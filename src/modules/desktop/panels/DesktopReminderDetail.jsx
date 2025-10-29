import { useEffect, useMemo, useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import { getMediaGlyph, getSourceLabel } from "../../../utils/formatters.js";

export default function DesktopReminderDetail({ reminderId, isOpen, onClose, onDelete }) {
  const {
    reminders,
    reminderSettings,
    completeReminder,
    undoCompleteReminder,
    updateReminderSchedule,
    snoozeReminder,
  } = useDeviceContext();

  const reminder = useMemo(
    () => reminders.find((item) => item.id === reminderId) ?? reminders[0],
    [reminderId, reminders]
  );

  const isCompleted = reminder?.status === "completed";

  const [dueDateInput, setDueDateInput] = useState(() => formatDateInput(reminder));
  const [dueTimeInput, setDueTimeInput] = useState(() => formatTimeInput(reminder));
  const [showSnoozePicker, setShowSnoozePicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  useEffect(() => {
    setDueDateInput(formatDateInput(reminder));
    setDueTimeInput(formatTimeInput(reminder));
  }, [reminder]);

  const handleDelete = () => {
    if (!reminder) {
      return;
    }
    const confirmed = window.confirm("Delete this follow-up? This can’t be undone.");
    if (confirmed) {
      onDelete?.(reminder.id);
    }
  };

  const handleToggleComplete = () => {
    if (!reminder) {
      return;
    }
    if (reminder.status === "completed") {
      undoCompleteReminder(reminder.id);
    } else {
      completeReminder(reminder.id);
    }
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    if (!reminder) {
      return;
    }
    updateReminderSchedule(reminder.id, {
      dueDate: dueDateInput,
      dueTime: dueTimeInput,
    });
  };

  const handleSnoozeClick = () => {
    setShowSnoozePicker(true);
  };

  const handleSnoozeWithMinutes = (minutes) => {
    if (reminder) {
      snoozeReminder(reminder.id, minutes);
      setShowSnoozePicker(false);
      setCustomMinutes("");
    }
  };

  const handleCustomSnooze = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0) {
      handleSnoozeWithMinutes(minutes);
    }
  };

  return (
    <aside className={`desktop-detail ${isOpen ? "is-open" : ""}`}>
      <header className="detail-header">
        <div>
          <p className="badge subtle">{reminder ? getSourceLabel(reminder.source) : "Reminder"}</p>
          <h3>{reminder?.title ?? "Select a reminder"}</h3>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close panel">
          ✕
        </button>
      </header>

      {reminder ? (
        <div className="detail-body">
          <section className="detail-hero">
            <div className="hero-badge">{getMediaGlyph(reminder.mediaType)}</div>
            <div>
              <h4>{reminder.dueLabel}</h4>
              <span className={`status-pill status-${reminder.status}`}>
                {reminder.countdown}
              </span>
            </div>
          </section>

          <section className="detail-section">
            <h4>Notes</h4>
            <p>{reminder.note}</p>
          </section>

          {reminder.attachments.length > 0 && (
            <section className="detail-section">
              <h4>Attachments</h4>
              <div className="attachment-stack">
                {reminder.attachments.map((attachment) => (
                  <a key={attachment.label} href={attachment.href} className="attachment-pill">
                    {getMediaGlyph(attachment.type)} {attachment.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="detail-section">
            <div className="cta-row">
              <button
                type="button"
                className="primary"
                onClick={handleToggleComplete}
                aria-pressed={isCompleted}
              >
                {isCompleted ? "↺ Undo complete" : "✓ Complete"}
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={isCompleted}
                onClick={handleSnoozeClick}
              >
                💤 Snooze
              </button>
            </div>
            <button type="button" className="destructive-button" onClick={handleDelete}>
              Delete reminder
            </button>
          </section>

          <section className="detail-section">
            <h4>Schedule</h4>
            <form className="schedule-form" onSubmit={handleScheduleSubmit}>
              <label className="field">
                <span className="field-label">Due date</span>
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(event) => setDueDateInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Time</span>
                <input
                  type="time"
                  value={dueTimeInput}
                  onChange={(event) => setDueTimeInput(event.target.value)}
                />
              </label>
              <button type="submit" className="ghost-button">
                Save schedule
              </button>
            </form>
          </section>

          <section className="detail-section">
            <h4>Log</h4>
            <ul className="activity-list">
              {reminder.activity.map((item) => (
                <li key={item.id}>
                  <span>{item.label}</span>
                  <span className="muted">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="detail-empty">Select a reminder to view details.</div>
      )}

      {showSnoozePicker && (
        <div className="snooze-picker-overlay">
          <div className="snooze-picker-backdrop" onClick={() => setShowSnoozePicker(false)} />
          <div className="snooze-picker-panel snooze-picker-panel-desktop">
            <h4>Snooze for how long?</h4>
            <div className="snooze-preset-grid">
              {reminderSettings.snoozePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="snooze-preset-btn"
                  onClick={() => handleSnoozeWithMinutes(preset.minutes)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="custom-snooze-row">
              <input
                type="number"
                placeholder="Custom minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="custom-snooze-input"
                min="1"
              />
              <button
                type="button"
                className="ghost-button"
                onClick={handleCustomSnooze}
                disabled={!customMinutes || parseInt(customMinutes, 10) <= 0}
              >
                Set
              </button>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setShowSnoozePicker(false)}
              style={{ marginTop: "8px", width: "100%" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function formatDateInput(reminder) {
  if (!reminder) {
    return "";
  }
  const date = reminder.dueEpoch ? new Date(reminder.dueEpoch) : reminder.dueISO ? new Date(reminder.dueISO) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(reminder) {
  if (!reminder) {
    return "";
  }
  const date = reminder.dueEpoch ? new Date(reminder.dueEpoch) : reminder.dueISO ? new Date(reminder.dueISO) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
