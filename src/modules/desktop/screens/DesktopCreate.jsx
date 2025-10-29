export default function DesktopCreate() {
  return (
    <div className="desktop-create">
      <header className="desktop-section-header">
        <div>
          <h2>Create follow-up</h2>
          <p className="muted">Capture shared context or craft a manual reminder.</p>
        </div>
        <div className="desktop-create__actions">
          <button type="button" className="ghost-button">
            Share input
          </button>
          <button type="button" className="primary">
            Save reminder
          </button>
        </div>
      </header>

      <div className="create-layout">
        <section className="preview-pane">
          <header>
            <p className="badge subtle">Shared context</p>
            <h3>Brand collab reply</h3>
            <p className="muted">Link from Safari • Today 4:12 PM</p>
          </header>
          <div className="preview-card">
            <div className="preview-badge">🔗</div>
            <div>
              <p className="muted">https://brandkit.co/replies</p>
              <p>Preview the shared link before you follow up.</p>
            </div>
          </div>
          <footer>
            <button type="button" className="ghost-button">
              Switch to manual
            </button>
          </footer>
        </section>

        <section className="form-pane">
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Title</span>
              <input type="text" defaultValue="Brand collab reply" />
            </label>
            <label className="field full">
              <span className="field-label">Notes</span>
              <textarea defaultValue="Send updated rate card + CTA templates." rows={6} />
            </label>
            <div className="field-group">
              <label className="field">
                <span className="field-label">Due date</span>
                <input type="date" defaultValue="2024-05-14" />
              </label>
              <label className="field">
                <span className="field-label">Time</span>
                <input type="time" defaultValue="17:00" />
              </label>
              <div className="ai-suggestion-card">
                <p>AI suggests “Tonight, 7:30 PM”</p>
                <button type="button" className="lock-button">
                  Unlock AI suggestions
                </button>
              </div>
            </div>
          </div>
          <div className="form-footer">
            <div className="tag-row">
              <span className="chip">+1 hour</span>
              <span className="chip">+3 hours</span>
              <span className="chip">Tomorrow 9 AM</span>
              <span className="chip">Next Mon 9 AM</span>
            </div>
            <button type="button" className="lock-button">
              Recurring follow-up · Pro
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
