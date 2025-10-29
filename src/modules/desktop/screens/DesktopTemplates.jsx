import { templates } from "../../../data/sampleData.js";

export default function DesktopTemplates() {
  const isPro = false;
  return (
    <div className="desktop-templates">
      <header className="desktop-section-header">
        <div>
          <h2>Templates</h2>
          <p className="muted">Reuse your best follow-up phrasing instantly.</p>
        </div>
        <div className="desktop-template-actions">
          <button className="ghost-button" type="button">
            Upgrade
          </button>
          <button className="primary" type="button">
            New template
          </button>
        </div>
      </header>

      <div className="template-grid">
        {templates.map((template) => (
          <article key={template.id} className={`template-tile ${isPro ? "" : "is-locked"}`}>
            <header>
              <h3>{template.name}</h3>
              <span className="muted">{template.usedAgo}</span>
            </header>
            <p>{template.snippet}</p>
            <footer>
              <button className="primary ghost" type="button">
                Preview
              </button>
              <button className="ghost-button" type="button">
                Apply
              </button>
            </footer>
            {!isPro && <span className="corner-ribbon">PRO</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
