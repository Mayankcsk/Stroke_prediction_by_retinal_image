
from pathlib import Path
from io import BytesIO
import base64

import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from segmentation import segment_vessels
from classification import classify_narrowing


# --------------------------------------------------
# 1. FastAPI application
# --------------------------------------------------

app = FastAPI(title="Retinal Health Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# --------------------------------------------------
# 2. Hemorrhage classification model
# Architecture retained from your existing final.py
# --------------------------------------------------

class ConvBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()

        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.conv(x)


class ResUNetEncoder(nn.Module):
    def __init__(self, in_channels=3, features=None):
        super().__init__()

        if features is None:
            features = [64, 128, 256, 512]

        self.encoder_blocks = nn.ModuleList()
        self.pool = nn.MaxPool2d(2, 2)

        for feature in features:
            self.encoder_blocks.append(ConvBlock(in_channels, feature))
            in_channels = feature

    def forward(self, x):
        for encoder in self.encoder_blocks:
            x = encoder(x)
            x = self.pool(x)

        return x


class ImprovedResUNetClassifier(nn.Module):
    def __init__(
        self,
        in_channels=3,
        num_classes=1,
        features=None,
        dropout=0.5,
    ):
        super().__init__()

        if features is None:
            features = [64, 128, 256, 512]

        self.encoder = ResUNetEncoder(in_channels, features)
        self.global_pool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout)

        self.classifier = nn.Sequential(
            nn.Linear(features[-1], 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.global_pool(x)
        x = torch.flatten(x, 1)
        x = self.dropout(x)
        return self.classifier(x)


# --------------------------------------------------
# 3. Load hemorrhage model once when API starts
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
HEMORRHAGE_MODEL_PATH = BASE_DIR / "best_resunet_classifier.pth"

hemorrhage_model = ImprovedResUNetClassifier()

hemorrhage_model.load_state_dict(
    torch.load(HEMORRHAGE_MODEL_PATH, map_location="cpu")
)

hemorrhage_model.eval()

hemorrhage_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


def predict_hemorrhage(image: Image.Image):
    input_tensor = hemorrhage_transform(image).unsqueeze(0)

    with torch.no_grad():
        output = hemorrhage_model(input_tensor)
        probability = torch.sigmoid(output).item()

    prediction = 1 if probability > 0.50 else 0

    return {
        "prediction": "Hemorrhage" if prediction == 1 else "Normal",
        "class_id": prediction,
        "score": float(probability),
    }


# --------------------------------------------------
# 4. Helper to convert vessel mask to a browser image
# --------------------------------------------------

def mask_to_base64(mask):
    mask_image = Image.fromarray((mask.astype(np.uint8) * 255))
    buffer = BytesIO()
    mask_image.save(buffer, format="PNG")

    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


# --------------------------------------------------
# 5. API endpoints
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Retinal analysis API is running"}


@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    allowed_types = {"image/jpeg", "image/png", "image/tiff"}

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG, or TIFF image.",
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Image size must be 15 MB or less.",
            )

        image = Image.open(BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the image. Please upload a valid image file.",
        )

    # Vessel segmentation and narrowing classification
    try:
        vessel_mask = segment_vessels(image_np)
        narrowing_prediction, narrowing_score, features = (
            classify_narrowing(vessel_mask)
        )

        narrowing_labels = {
            0: "No Narrowing / Mild Narrowing",
            1: "Narrowing Present",
            2: "No Narrowing (Confirmed)",
        }

        narrowing_result = {
            "class_id": int(narrowing_prediction),
            "prediction": narrowing_labels.get(
                int(narrowing_prediction), "Unknown"
            ),
            "score": float(narrowing_score),
            "features": {
                key: float(value) for key, value in features.items()
            },
            "segmentation_image": mask_to_base64(vessel_mask),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Vessel analysis failed: {str(exc)}",
        )

    # Hemorrhage classification
    try:
        hemorrhage_result = predict_hemorrhage(image)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Hemorrhage analysis failed: {str(exc)}",
        )

    # Preserve the risk-assessment logic from the existing app
    narrowing_risk = narrowing_prediction == 1
    hemorrhage_risk = hemorrhage_result["class_id"] == 1

    if narrowing_risk and hemorrhage_risk:
        risk = "High"
    elif narrowing_risk or hemorrhage_risk:
        risk = "Moderate"
    else:
        risk = "Low"

    return {
        "filename": file.filename,
        "narrowing": narrowing_result,
        "hemorrhage": hemorrhage_result,
        "overall_assessment": risk,
        "disclaimer": (
            "Research prototype only. Results are not a medical diagnosis."
        ),
    }
