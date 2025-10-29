import { templates } from "../../../data/sampleData.js";

export default function MobileTemplates({ onUpgrade }) {
  const isProUser = false;

  return (
    <div className="mobile-screen mobile-templates">
      <header className="screen-header">
        <h2>Templates</h2>
        <button
          type="button"
          className="ghost-button"
          onClick={onUpgrade}
          aria-label="Upgrade to Pro"
        >
          Upgrade
        </button>
      </header>

      {!isProUser && (
        <div className="lock-card">
          <div>
            <h3>Templates are a Pro feature</h3>
            <p>Save your best responses and apply them in one tap.</p>
          </div>
          <button type="button" className="primary" onClick={onUpgrade}>
            Unlock templates
          </button>
        </div>
      )}

      <div className="template-list">
        {templates.map((template) => (
          <article key={template.id} className={`template-card ${isProUser ? "" : "is-locked"}`}>
            <header>
              <h4>{template.name}</h4>
              <span className="muted">{template.usedAgo}</span>
            </header>
            <p>{template.snippet}</p>
            <div className="template-card__actions">
              <button type="button" className="primary ghost" onClick={onUpgrade}>
                Preview
              </button>
              <button type="button" className="ghost-button" onClick={onUpgrade}>
                Apply
              </button>
            </div>
            {!isProUser && <div className="template-lock">PRO</div>}
          </article>
        ))}
      </div>
    </div>
  );
}
