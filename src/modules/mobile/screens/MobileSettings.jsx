import { useState } from "react";
import { integrations } from "../../../data/sampleData.js";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";

export default function MobileSettings({ onOpenIntegrations, onUpgrade }) {
  const { reminderSettings, updateDefaultDueTime } = useDeviceContext();
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    if (updateDefaultDueTime(newTime)) {
      setShowTimeEditor(false);
    }
  };

  const formatDefaultTimeLabel = (timeString) => {
    if (!timeString) return "Today · 5:00 PM";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    const timeLabel = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `Today · ${timeLabel}`;
  };

  return (
    <div className="mobile-screen mobile-settings">
      <header className="screen-header">
        <h2>Settings</h2>
        <span className="muted">Customize reminders</span>
      </header>

      <section className="settings-section">
        <h3>Reminders</h3>
        <div className="settings-row">
          <span className="label">Default due time</span>
          {showTimeEditor ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="time"
                defaultValue={reminderSettings.defaultDueTime}
                onChange={handleTimeChange}
                className="time-input"
                autoFocus
              />
              <button
                type="button"
                className="inline-button"
                onClick={() => setShowTimeEditor(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-button"
              onClick={() => setShowTimeEditor(true)}
            >
              {formatDefaultTimeLabel(reminderSettings.defaultDueTime)}
            </button>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h3>Notifications</h3>
        <div className="toggle-row">
          <div>
            <p>Push notifications</p>
            <p className="muted">Stay on track with timely nudges.</p>
          </div>
          <button
            className={`toggle ${pushEnabled ? "is-on" : ""}`}
            type="button"
            aria-pressed={pushEnabled}
            onClick={() => setPushEnabled(!pushEnabled)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="toggle-row">
          <div>
            <p>Digest summary</p>
            <p className="muted">Get a daily round-up at 8:00 AM.</p>
          </div>
          <button
            className={`toggle ${digestEnabled ? "is-on" : ""}`}
            type="button"
            aria-pressed={digestEnabled}
            onClick={() => setDigestEnabled(!digestEnabled)}
          >
            <span className="toggle-thumb" />
          </button>
        </div>
        <div className="toggle-row is-locked" onClick={onUpgrade} role="button" tabIndex={0}>
          <div>
            <p>Custom sound</p>
            <p className="muted">Pick a notification sound that matches your vibe.</p>
          </div>
          <span className="lock-pill">PRO</span>
        </div>
      </section>

      <section className="settings-section">
        <h3>Integrations</h3>
        <div className="integration-list">
          {integrations.map((integration) => (
            <article key={integration.id} className="integration-card">
              <div className="integration-card__left">
                <div className="integration-icon" aria-hidden="true">
                  {getIntegrationGlyph(integration.id)}
                </div>
                <div>
                  <h4>{integration.name}</h4>
                  <p className="muted">{integration.description}</p>
                </div>
              </div>
              <div className="integration-card__right">
                <span className={`status ${integration.status}`}>{integration.status}</span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={integration.pro ? onUpgrade : onOpenIntegrations}
                >
                  {integration.cta}
                </button>
              </div>
              {integration.pro && <span className="corner-ribbon">PRO</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>Support</h3>
        <div className="support-cards">
          <button type="button" className="support-card">
            Help center
          </button>
          <button type="button" className="support-card">
            Send feedback
          </button>
        </div>
      </section>
    </div>
  );
}

function getIntegrationGlyph(id) {
  switch (id) {
    case "whatsapp":
      return "💬";
    case "email":
      return "✉️";
    case "calendar":
      return "📆";
    case "notion":
      return "🧠";
    default:
      return "🔗";
  }
}
