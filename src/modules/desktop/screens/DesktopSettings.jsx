import { useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";

export default function DesktopSettings() {
  const { reminderSettings, updateDefaultDueTime } = useDeviceContext();
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);

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
    <div className="desktop-settings">
      <header className="desktop-section-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">Control defaults, notifications, and integrations.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <h3>Reminder defaults</h3>
          <div className="settings-row">
            <span>Default due time</span>
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

        <section className="settings-card">
          <h3>Notifications</h3>
          <div className="toggle-row">
            <div>
              <p>Push notifications</p>
              <p className="muted">Timely nudges for upcoming due items.</p>
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
              <p>Email digest</p>
              <p className="muted">Morning summary with overdue highlights.</p>
            </div>
            <button
              className={`toggle ${emailDigestEnabled ? "is-on" : ""}`}
              type="button"
              aria-pressed={emailDigestEnabled}
              onClick={() => setEmailDigestEnabled(!emailDigestEnabled)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </section>

        <section className="settings-card">
          <h3>Branding</h3>
          <p className="muted">Customize the app icon and notification sound (Pro).</p>
          <button type="button" className="lock-button">
            Unlock branding controls
          </button>
        </section>

        <section className="settings-card">
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
    </div>
  );
}
