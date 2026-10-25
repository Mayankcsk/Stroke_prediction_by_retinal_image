
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/analyze";

const themes = {
  default: {
    page: "#f0f5fa",
    surface: "#ffffff",
    sidebar: "#ffffff",
    text: "#102a43",
    muted: "#607d9e",
    border: "#dce5ef",
    accent: "#009e91",
    accentSoft: "#eafaf7",
    hover: "#f1f7f8",
    subtle: "#f7f9fc",
    shadow: "0 1px 3px rgba(15, 35, 60, 0.10)",
  },
  light: {
    page: "#ffffff",
    surface: "#ffffff",
    sidebar: "#ffffff",
    text: "#1e293b",
    muted: "#64748b",
    border: "#e2e8f0",
    accent: "#0f766e",
    accentSoft: "#f0fdfa",
    hover: "#f1f5f9",
    subtle: "#f8fafc",
    shadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  },
  dark: {
    page: "#0b1220",
    surface: "#111c2e",
    sidebar: "#111c2e",
    text: "#e5edf7",
    muted: "#9aabc2",
    border: "#29384d",
    accent: "#2dd4bf",
    accentSoft: "#153b3b",
    hover: "#1b2a3e",
    subtle: "#162236",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
  },
};

const styles = `
  * { box-sizing: border-box; }

  button, input { font: inherit; }
  button { cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .6; }

  .app-shell {
    min-height: 100vh;
    display: flex;
    background: var(--page);
    color: var(--text);
    transition: background .2s ease, color .2s ease;
  }

  .sidebar {
    width: 248px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--sidebar);
    border-right: 1px solid var(--border);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 26px 13px;
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: 13px;
    width: 100%;
    padding: 15px 16px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: var(--muted);
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    transition: background .2s, color .2s;
  }

  .nav-button:hover {
    background: var(--hover);
    color: var(--text);
  }

  .nav-button.active {
    background: var(--accentSoft);
    color: var(--accent);
  }

  .workspace-label {
    margin: 12px 15px 10px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .sidebar-bottom {
    margin-top: auto;
    padding: 20px 15px;
    border-top: 1px solid var(--border);
  }

  .prototype-box {
    border-radius: 14px;
    padding: 18px;
    background: var(--subtle);
  }

  .main-area { min-width: 0; flex: 1; }

  .topbar {
    min-height: 78px;
    padding: 17px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }

  .page-content {
    padding: 30px;
    max-width: 1700px;
    margin: 0 auto;
  }

  .eyebrow {
    color: var(--accent);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .page-title {
    margin: 12px 0 7px;
    font-size: 32px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: -.8px;
  }

  .page-description {
    margin: 0;
    color: var(--muted);
    font-size: 15px;
    line-height: 1.7;
  }

  .page-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 34px;
  }

  .button-primary {
    border: 0;
    border-radius: 13px;
    padding: 13px 20px;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 750;
    transition: filter .2s;
  }

  .button-primary:hover { filter: brightness(.93); }

  .button-secondary {
    border: 1px solid var(--border);
    border-radius: 11px;
    padding: 10px 14px;
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    font-weight: 650;
  }

  .button-secondary:hover { background: var(--hover); }

  .card {
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 23px;
    background: var(--surface);
    box-shadow: var(--shadow);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .stat-title {
    color: var(--muted);
    font-size: 14px;
    font-weight: 550;
  }

  .stat-icon {
    width: 43px;
    height: 43px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    flex-shrink: 0;
    background: var(--accentSoft);
    color: var(--accent);
  }

  .stat-value {
    margin: 26px 0 6px;
    font-size: 23px;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .stat-detail {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .section-title { margin: 0; font-size: 19px; font-weight: 750; }

  .section-description {
    margin: 7px 0 0;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
  }

  .latest-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 27px;
  }

  .result-mini {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    border: 1px solid var(--border);
    border-radius: 15px;
    padding: 19px;
    min-width: 0;
  }

  .result-mini h4 {
    margin: 4px 0 7px;
    font-size: 16px;
    overflow-wrap: anywhere;
  }

  .result-mini p {
    margin: 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 13px;
    border-radius: 999px;
    background: var(--accentSoft);
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }

  /* Corrected upload area */
  .upload-box {
    margin-top: 22px;
    padding: 26px 20px;
    border: 2px dashed var(--border);
    border-radius: 15px;
    background: var(--subtle);
    text-align: center;
    transition: border-color .2s;
    min-width: 0;
    overflow: hidden;
  }

  .upload-box:hover { border-color: var(--accent); }

  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .file-input {
    display: block;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin: 18px 0 0;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--muted);
    cursor: pointer;
    font-size: 13px;
  }

  .file-input::file-selector-button {
    margin-right: 10px;
    padding: 8px 10px;
    border: 0;
    border-radius: 7px;
    background: var(--accentSoft);
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .preview-image {
    display: block;
    width: 100%;
    max-height: 430px;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    background: #080b12;
    border: 1px solid var(--border);
    border-radius: 13px;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 22px;
  }

  .field-table { width: 100%; border-collapse: collapse; font-size: 13px; }

  .field-table th, .field-table td {
    padding: 12px;
    border-bottom: 1px solid var(--border);
    text-align: left;
    overflow-wrap: anywhere;
  }

  .field-table th { color: var(--muted); font-weight: 700; }

  .notice {
    border: 1px solid #e8c878;
    background: #fff9e8;
    color: #805a12;
    border-radius: 13px;
    padding: 16px;
    font-size: 12px;
    line-height: 1.8;
  }

  .theme-switcher {
    display: inline-flex;
    gap: 3px;
    padding: 4px;
    border-radius: 13px;
    border: 1px solid var(--border);
    background: var(--subtle);
  }

  .theme-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 11px;
    border: 0;
    border-radius: 9px;
    color: var(--muted);
    background: transparent;
    font-size: 12px;
    font-weight: 700;
  }

  .theme-button.selected { background: var(--accent); color: #fff; }

  .error-box {
    margin-top: 16px;
    padding: 13px;
    border-radius: 12px;
    background: #fff0f0;
    color: #b42318;
    border: 1px solid #fecaca;
    font-size: 13px;
    line-height: 1.6;
  }

  .footer {
    margin-top: 35px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    text-align: center;
    font-size: 11px;
    line-height: 1.7;
  }

  @media (max-width: 1100px) {
    .sidebar { width: 215px; }
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .page-content { padding: 23px; }
    .topbar { padding: 16px 23px; }
  }

  @media (max-width: 760px) {
    .app-shell { flex-direction: column; }
    .sidebar {
      width: 100%;
      border-right: 0;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-nav {
      flex-direction: row;
      padding: 8px 12px 12px;
      overflow-x: auto;
    }
    .workspace-label, .sidebar-bottom { display: none; }
    .nav-button { width: auto; flex-shrink: 0; padding: 11px 13px; }
    .topbar { padding: 14px 17px; align-items: flex-start; }
    .page-content { padding: 20px 15px; }
    .page-title { font-size: 27px; }
    .latest-grid, .comparison-grid { grid-template-columns: 1fr; }
    .card { padding: 18px; }
    .theme-button { padding: 9px; }
    .theme-button span.label { display: none; }
  }

  @media (max-width: 420px) {
    .stats-grid { grid-template-columns: 1fr; }
    .topbar { flex-wrap: wrap; }
  }
`;

function ThemeSwitcher({ theme, setTheme }) {
  const options = [
    { value: "default", label: "Default", icon: "◐" },
    { value: "light", label: "Light", icon: "☀" },
    { value: "dark", label: "Dark", icon: "☾" },
  ];

  return (
    <div className="theme-switcher" aria-label="Choose appearance">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`theme-button ${theme === option.value ? "selected" : ""}`}
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          title={`${option.label} mode`}
        >
          <span>{option.icon}</span>
          <span className="label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

function Sidebar({ page, setPage }) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "analysis", label: "Image Analysis", icon: "◎" },
    { id: "about", label: "About Project", icon: "ⓘ" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <p className="workspace-label">Workspace</p>

        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => setPage(link.id)}
            className={`nav-button ${page === link.id ? "active" : ""}`}
          >
            <span style={{ fontSize: 19 }}>{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="prototype-box">
          <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 750 }}>
            Research prototype
          </p>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 12, lineHeight: 1.9 }}>
            AI-assisted retinal image analysis.
            <br />
            Not a clinical diagnostic system.
          </p>
        </div>
        <p style={{ margin: "24px 0 0", color: "var(--muted)", fontSize: 11 }}>
          Local research workspace
        </p>
      </div>
    </aside>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="page-title">{title}</h2>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ title, value, detail, icon }) {
  return (
    <div className="card">
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function ResultMini({ title, prediction, score, scoreLabel, icon }) {
  return (
    <div className="result-mini">
      <div className="stat-icon">{icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p>{title}</p>
        <h4>{prediction || "Not available"}</h4>
        <p>
          {scoreLabel || "Model score"}:{" "}
          {typeof score === "number" ? `${(score * 100).toFixed(2)}%` : "—"}
        </p>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="notice">
      <strong>Research disclaimer:</strong> This application is an educational
      research prototype. Its model outputs are not a clinically validated
      diagnosis or a reliable standalone assessment of stroke risk. Consult a
      qualified healthcare professional for medical concerns.
    </div>
  );
}

function DashboardPage({ results, preview, filename, setPage }) {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Overview of your retinal image analysis workspace."
        action={
          <button
            className="button-primary"
            onClick={() => setPage("analysis")}
            type="button"
          >
            + New Analysis
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard
          title="Selected Image"
          value={preview ? "Uploaded" : "No image"}
          detail={filename || "Upload an image to get started"}
          icon="◉"
        />
        <StatCard
          title="Vessel Segmentation"
          value={results?.narrowing?.segmentation_image ? "Completed" : "Pending"}
          detail="U-Net model"
          icon="⌁"
        />
        <StatCard
          title="Narrowing Analysis"
          value={results?.narrowing ? "Completed" : "Pending"}
          detail="Vessel feature classifier"
          icon="◎"
        />
        <StatCard
          title="Hemorrhage Analysis"
          value={results?.hemorrhage ? "Completed" : "Pending"}
          detail="PyTorch classifier"
          icon="✳"
        />
      </div>

      <div className="card" style={{ marginTop: 30 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 className="section-title">Latest Analysis</h3>
            <p className="section-description">
              Results from your most recent image submission.
            </p>
          </div>
          {results && (
            <span className="status-pill">
              <span className="dot" />
              Analysis returned
            </span>
          )}
        </div>

        {results ? (
          <>
            <div className="latest-grid">
              <ResultMini
                title="Vessel Narrowing"
                prediction={results.narrowing?.prediction}
                score={results.narrowing?.score}
                scoreLabel="Classifier score"
                icon="⌁"
              />
              <ResultMini
                title="Hemorrhage Classification"
                prediction={results.hemorrhage?.prediction}
                score={results.hemorrhage?.score}
                scoreLabel="Model output"
                icon="✳"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 20,
                border: "1px solid var(--border)",
                borderRadius: 15,
                background: "var(--subtle)",
              }}
            >
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                Overall rule-based category
              </p>
              <h3 style={{ margin: "9px 0 0", fontSize: 21 }}>
                {results.overall_assessment || "Not provided"}
              </h3>
              <p className="section-description">
                This is the category returned by the project's current model
                logic, not a confirmed clinical assessment.
              </p>
            </div>
          </>
        ) : (
          <div
            style={{
              marginTop: 24,
              padding: 30,
              borderRadius: 15,
              background: "var(--subtle)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 30 }}>▧</div>
            <h3 style={{ margin: "10px 0 5px", fontSize: 16 }}>
              No analysis yet
            </h3>
            <p className="section-description">
              Start a new analysis to view your model results here.
            </p>
          </div>
        )}

        {preview && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
              Selected retinal image
            </p>
            <img
              src={preview}
              alt="Selected retinal fundus"
              className="preview-image"
              style={{ maxHeight: 280, maxWidth: 420 }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Disclaimer />
      </div>
    </>
  );
}

function ImageAnalysisPage({
  results,
  setResults,
  preview,
  setPreview,
  selectedFile,
  setSelectedFile,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
    setError("");
  }

  async function analyzeImage() {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || `The server returned status ${response.status}.`
        );
      }

      setResults(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to FastAPI. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Image Analysis"
        description="Upload a retinal fundus image and inspect the output of your analysis models."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div className="card">
          <h3 className="section-title">Upload Image</h3>
          <p className="section-description">
            Choose a retinal image from your computer.
          </p>

          {/* Fixed upload box: the prompt and file input are separate */}
          <div className="upload-box">
            <label className="upload-prompt" htmlFor="retinal-image">
              <span style={{ fontSize: 35, color: "var(--accent)" }}>↑</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 750,
                  margin: "10px 0 5px",
                  color: "var(--text)",
                }}
              >
                Select an image
              </span>
              <span className="section-description">
                Choose a PNG, JPG, or JPEG file.
              </span>
            </label>

            <input
              id="retinal-image"
              className="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div
              style={{
                marginTop: 16,
                padding: 13,
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                overflowWrap: "anywhere",
              }}
            >
              <strong>{selectedFile.name}</strong>
              <p className="section-description">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          <button
            className="button-primary"
            style={{ width: "100%", marginTop: 18 }}
            onClick={analyzeImage}
            disabled={!selectedFile || loading}
            type="button"
          >
            {loading ? "Analyzing image..." : "Run Analysis →"}
          </button>

          {loading && (
            <p className="section-description" style={{ textAlign: "center" }}>
              Processing image. Please wait...
            </p>
          )}

          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title">Original Image Preview</h3>
          <p className="section-description">
            Preview the image you selected.
          </p>

          {preview ? (
            <img
              src={preview}
              alt="Original retinal fundus"
              className="preview-image"
              style={{ marginTop: 22 }}
            />
          ) : (
            <div className="upload-box">
              <div style={{ fontSize: 35 }}>▧</div>
              <p className="section-description">
                Your selected image will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div style={{ marginTop: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow">Completed analysis</div>
            <h3 className="page-title" style={{ fontSize: 25 }}>
              Analysis Results
            </h3>
            <p className="page-description">
              Model outputs returned by the FastAPI backend.
            </p>
          </div>

          <div className="latest-grid">
            <ResultMini
              title="Vessel Narrowing"
              prediction={results.narrowing?.prediction}
              score={results.narrowing?.score}
              scoreLabel="Classifier score"
              icon="⌁"
            />
            <ResultMini
              title="Hemorrhage Classification"
              prediction={results.hemorrhage?.prediction}
              score={results.hemorrhage?.score}
              scoreLabel="Model output"
              icon="✳"
            />
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="section-title">Overall Rule-Based Category</h3>
            <h2 style={{ margin: "15px 0 7px", fontSize: 24 }}>
              {results.overall_assessment || "Not provided"}
            </h2>
            <p className="section-description">
              This category reflects the project's current model logic and
              should not be interpreted as a clinical diagnosis.
            </p>
          </div>

          {results.narrowing?.features &&
            typeof results.narrowing.features === "object" && (
              <div className="card" style={{ marginTop: 20 }}>
                <h3 className="section-title">Vessel Features</h3>
                <p className="section-description">
                  Feature values returned by the backend.
                </p>

                <div style={{ overflowX: "auto", marginTop: 15 }}>
                  <table className="field-table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results.narrowing.features).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td style={{ textTransform: "capitalize" }}>
                              {key.replaceAll("_", " ")}
                            </td>
                            <td>
                              {typeof value === "number"
                                ? value.toFixed(4)
                                : String(value)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {results.narrowing?.segmentation_image && (
            <div className="card" style={{ marginTop: 20 }}>
              <h3 className="section-title">Retinal Image Comparison</h3>
              <p className="section-description">
                Compare the uploaded image with the predicted vessel
                segmentation mask.
              </p>

              <div className="comparison-grid">
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      margin: "0 0 12px",
                    }}
                  >
                    Original Retinal Image
                  </p>
                  {preview && (
                    <img
                      src={preview}
                      alt="Original retinal fundus image"
                      className="preview-image"
                    />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      margin: "0 0 12px",
                    }}
                  >
                    Vessel Segmentation Mask
                  </p>
                  <img
                    src={results.narrowing.segmentation_image}
                    alt="Predicted vessel segmentation mask"
                    className="preview-image"
                  />
                </div>
              </div>

              <p
                className="section-description"
                style={{ marginTop: 15, fontSize: 12 }}
              >
                The segmentation mask shows vessels detected by the model. It
                is a model output, not a confirmed clinical finding.
              </p>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <Disclaimer />
          </div>
        </div>
      )}
    </>
  );
}

function AboutPage() {
  const items = [
    {
      number: "01",
      title: "Image Processing",
      description:
        "The uploaded retinal fundus image is sent to the backend for processing.",
    },
    {
      number: "02",
      title: "Vessel Segmentation",
      description:
        "A trained U-Net-based model generates a vessel segmentation mask.",
    },
    {
      number: "03",
      title: "Narrowing Analysis",
      description:
        "Vessel features are passed to the narrowing classification model.",
    },
    {
      number: "04",
      title: "Hemorrhage Classification",
      description:
        "The trained image classifier returns its predicted class and score.",
    },
    {
      number: "05",
      title: "Visualization",
      description:
        "The dashboard displays model results, features, and the segmentation mask.",
    },
    {
      number: "06",
      title: "Technology Stack",
      description:
        "React, Tailwind CSS, Python, FastAPI, PyTorch, and scikit-learn.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="About Project"
        description="Learn about the components of this retinal image analysis research prototype."
      />

      <div className="card">
        <div className="eyebrow">Project overview</div>
        <h3 style={{ margin: "12px 0", fontSize: 23, fontWeight: 800 }}>
          Stroke Detection Using Retinal Fundus Images
        </h3>
        <p className="page-description" style={{ maxWidth: 850 }}>
          This project brings retinal vessel segmentation, vessel feature
          analysis, and hemorrhage classification together in one application.
          React powers the frontend, while FastAPI serves the trained models
          and returns their outputs.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        {items.map((item) => (
          <div className="card" key={item.number}>
            <div className="stat-icon">{item.number}</div>
            <h3 style={{ margin: "17px 0 8px", fontSize: 16, fontWeight: 750 }}>
              {item.title}
            </h3>
            <p className="section-description">{item.description}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Disclaimer />
      </div>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [theme, setTheme] = useState("default");
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const palette = themes[theme];

  function resetAnalysis() {
    if (preview) URL.revokeObjectURL(preview);
    setResults(null);
    setPreview("");
    setSelectedFile(null);
  }

  return (
    <>
      <style>{styles}</style>

      <div
        className="app-shell"
        style={{
          "--page": palette.page,
          "--surface": palette.surface,
          "--sidebar": palette.sidebar,
          "--text": palette.text,
          "--muted": palette.muted,
          "--border": palette.border,
          "--accent": palette.accent,
          "--accentSoft": palette.accentSoft,
          "--hover": palette.hover,
          "--subtle": palette.subtle,
          "--shadow": palette.shadow,
        }}
      >
        <Sidebar page={page} setPage={setPage} />

        <main className="main-area">
          <header className="topbar">
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "var(--muted)",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Retinal Health Platform
              </p>
              <h1 style={{ margin: 0, fontSize: 21, fontWeight: 750 }}>
                {page === "dashboard"
                  ? "Dashboard"
                  : page === "analysis"
                    ? "Image Analysis"
                    : "About Project"}
              </h1>
            </div>

            <ThemeSwitcher theme={theme} setTheme={setTheme} />
          </header>

          <div className="page-content">
            {page === "dashboard" && (
              <DashboardPage
                results={results}
                preview={preview}
                filename={selectedFile?.name}
                setPage={setPage}
              />
            )}

            {page === "analysis" && (
              <ImageAnalysisPage
                results={results}
                setResults={setResults}
                preview={preview}
                setPreview={setPreview}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            )}

            {page === "about" && <AboutPage />}

            <footer className="footer">
              Educational research prototype · Not for clinical diagnosis
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}
