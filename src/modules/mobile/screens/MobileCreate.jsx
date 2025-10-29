import { getMediaGlyph } from "../../../utils/formatters.js";

const SNOOZE_PRESETS = ["+1 hour", "+3 hours", "Tomorrow 9 AM", "Next Mon 9 AM"];
const MEDIA_CHOICES = [
  { id: "text", label: "Note", glyph: "📝" },
  { id: "link", label: "Link", glyph: "🔗" },
  { id: "image", label: "Image", glyph: "🖼️" },
  { id: "video", label: "Video", glyph: "🎥" },
  { id: "file", label: "File", glyph: "📄" },
  { id: "voice", label: "Voice", glyph: "🎙️" },
];

export default function MobileCreate({ mode, onSwitchMode, onUpgrade }) {
  return (
    <div className="mobile-screen mobile-create">
      <header className="sheet-header">
        <div className="drag-handle" aria-hidden="true" />
        <p className="badge subtle">{mode === "share" ? "Shared context" : "Manual follow-up"}</p>
        <h2>{mode === "share" ? "Create follow-up" : "New follow-up"}</h2>
        <div className="mode-switch">
          <button
            type="button"
            className={`mode-switch__button ${mode === "share" ? "is-active" : ""}`}
            onClick={() => onSwitchMode("share")}
          >
            Share
          </button>
          <button
            type="button"
            className={`mode-switch__button ${mode === "manual" ? "is-active" : ""}`}
            onClick={() => onSwitchMode("manual")}
          >
            Manual
          </button>
        </div>
      </header>

      {mode === "share" ? <SharePanel onUpgrade={onUpgrade} /> : <ManualPanel onUpgrade={onUpgrade} />}
    </div>
  );
}

function SharePanel({ onUpgrade }) {
  return (
    <div className="sheet-content">
      <section className="panel surface">
        <header>
          <h3>Brand collab reply</h3>
          <p>Link from Safari • Today 4:12 PM</p>
        </header>
        <div className="context-preview">
          <span className="media-chip">{getMediaGlyph("link")}</span>
          <div>
            <p className="context-title">https://brandkit.co/replies</p>
            <p className="context-subtitle">Preview the shared link before you follow up.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <label className="field">
          <span className="field-label">Title</span>
          <input type="text" defaultValue="Brand collab reply" />
        </label>
        <label className="field">
          <span className="field-label">Notes</span>
          <textarea defaultValue="Send updated rate card + CTA templates." rows={3} />
        </label>
        <div className="template-banner" role="button" tabIndex={0} onClick={onUpgrade}>
          <span className="template-pill">PRO</span>
          <span>Apply template</span>
          <span className="chevron">›</span>
        </div>
      </section>

      <section className="panel">
        <div className="field inline">
          <div>
            <span className="field-label">Due date</span>
            <button type="button" className="inline-button">
              Today
            </button>
          </div>
          <div>
            <span className="field-label">Time</span>
            <button type="button" className="inline-button">
              5:00 PM
            </button>
          </div>
        </div>
        <div className="ai-suggestion" role="button" tabIndex={0} onClick={onUpgrade}>
          <span className="spark">✧</span>
          <div>
            <p>AI suggests “Tonight, 7:30 PM”</p>
            <p className="muted">Upgrade to unlock smart scheduling.</p>
          </div>
        </div>
        <div className="snooze-row">
          {SNOOZE_PRESETS.map((preset) => (
            <button key={preset} type="button" className="chip">
              {preset}
            </button>
          ))}
        </div>
        <button type="button" className="lock-button" onClick={onUpgrade}>
          Recurring follow-up · PRO
        </button>
      </section>

      <section className="sheet-footer">
        <button className="ghost-button" type="button">
          Discard
        </button>
        <button className="primary" type="button">
          Save reminder
        </button>
      </section>
    </div>
  );
}

function ManualPanel({ onUpgrade }) {
  return (
    <div className="sheet-content">
      <section className="panel">
        <div className="media-selector">
          {MEDIA_CHOICES.map((choice) => (
            <button key={choice.id} type="button" className={`media-selector__item ${choice.id === "text" ? "is-active" : ""}`}>
              <span aria-hidden="true">{choice.glyph}</span>
              {choice.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span className="field-label">Title</span>
          <input type="text" placeholder="Give this follow-up a title" defaultValue="Send invoice #1042" />
        </label>
        <label className="field">
          <span className="field-label">Notes</span>
          <textarea placeholder="Add context or paste content…" rows={3} defaultValue="Attach invoice PDF and confirm mailing address." />
        </label>
        <div className="attachment-placeholder">
          <p>No attachment yet.</p>
          <button type="button" className="ghost-button">
            Add link or file
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="field inline">
          <div>
            <span className="field-label">Due date</span>
            <button type="button" className="inline-button">
              Tomorrow
            </button>
          </div>
          <div>
            <span className="field-label">Time</span>
            <button type="button" className="inline-button">
              11:00 AM
            </button>
          </div>
        </div>
        <div className="quick-picks">
          <p className="muted">Quick picks</p>
          <div className="quick-picks__row">
            <button type="button" className="chip">
              Tonight
            </button>
            <button type="button" className="chip">
              Tomorrow AM
            </button>
            <button type="button" className="chip">
              Next Mon
            </button>
          </div>
        </div>
        <button type="button" className="lock-button" onClick={onUpgrade}>
          AI suggested time · PRO
        </button>
      </section>

      <section className="sheet-footer">
        <button className="ghost-button" type="button">
          Cancel
        </button>
        <button className="primary" type="button">
          Save reminder
        </button>
      </section>
    </div>
  );
}
