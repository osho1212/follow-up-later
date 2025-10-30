import { useState, useEffect } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import {
  requestNotificationPermission,
  getNotificationPermission,
  showTestNotification,
} from "../../../services/notificationService.js";

export default function DesktopSettings() {
  const { reminderSettings, updateDefaultDueTime } = useDeviceContext();
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");

  useEffect(() => {
    const permission = getNotificationPermission();
    setNotificationPermission(permission);
    setPushEnabled(permission === "granted");
  }, []);

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
          {notificationPermission === "unsupported" && (
            <div className="notification-banner warning">
              <p>Browser notifications are not supported on this device.</p>
            </div>
          )}
          {notificationPermission === "denied" && (
            <div className="notification-banner error">
              <p>Notifications are blocked. Enable them in your browser settings, then click the button below.</p>
              <button
                type="button"
                className="inline-button"
                style={{ marginTop: "8px" }}
                onClick={() => {
                  const permission = getNotificationPermission();
                  setNotificationPermission(permission);
                  if (permission === "granted") {
                    setPushEnabled(true);
                    showTestNotification();
                  }
                }}
              >
                Refresh Permission Status
              </button>
            </div>
          )}
          <div className="toggle-row">
            <div>
              <p>Push notifications</p>
              <p className="muted">
                {notificationPermission === "granted"
                  ? "Timely nudges for upcoming due items."
                  : "Enable to get notified when reminders are due."}
              </p>
            </div>
            <button
              className={`toggle ${pushEnabled ? "is-on" : ""}`}
              type="button"
              aria-pressed={pushEnabled}
              onClick={async () => {
                if (!pushEnabled && notificationPermission !== "granted") {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    setPushEnabled(true);
                    setNotificationPermission("granted");
                    showTestNotification();
                  } else {
                    setNotificationPermission(getNotificationPermission());
                  }
                } else {
                  setPushEnabled(!pushEnabled);
                }
              }}
              disabled={notificationPermission === "denied" || notificationPermission === "unsupported"}
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
