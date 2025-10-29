import { useMemo, useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import { getMediaGlyph, getSourceLabel } from "../../../utils/formatters.js";

export default function MobileReminderDetail({
  reminderId,
  onClose,
  onUpgrade,
  onComplete,
  onSnooze,
  onUndo,
  onReschedule,
}) {
  const { reminders, reminderSettings } = useDeviceContext();
  const [showSnoozePicker, setShowSnoozePicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const reminder = useMemo(
    () => reminders.find((item) => item.id === reminderId) ?? reminders[0],
    [reminderId, reminders]
  );

  const handleSnoozeClick = () => {
    setShowSnoozePicker(true);
  };

  const handleSnoozeWithMinutes = (minutes) => {
    onSnooze?.(reminder.id, minutes);
    setShowSnoozePicker(false);
    setCustomMinutes("");
  };

  const handleCustomSnooze = () => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0) {
      handleSnoozeWithMinutes(minutes);
    }
  };

  if (!reminder) return null;

  return (
    <div className="overlay-sheet">
      <div className="overlay-sheet__backdrop" onClick={onClose} />
      <aside className="overlay-sheet__panel">
        <header className="overlay-sheet__header">
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close detail">
            ←
          </button>
          <div>
            <p className="badge subtle">{getSourceLabel(reminder.source)}</p>
            <h3>{reminder.title}</h3>
          </div>
          <button type="button" className="icon-button" aria-label="More options">
            •••
          </button>
        </header>

        <section className="overlay-sheet__hero">
          <span className="media-chip">{getMediaGlyph(reminder.mediaType)}</span>
          <div>
            <p className="muted">Due</p>
            <h4>{reminder.dueLabel}</h4>
            <span className={`status-pill status-${reminder.status}`}>
              {reminder.countdown}
            </span>
          </div>
        </section>

        <section className="overlay-sheet__section">
          <h4>Notes</h4>
          <p>{reminder.note}</p>
        </section>

        {reminder.attachments.length > 0 && (
          <section className="overlay-sheet__section">
            <h4>Attachment</h4>
            <div className="attachment-stack">
              {reminder.attachments.map((attachment) => (
                <a key={attachment.label} href={attachment.href} className="attachment-pill">
                  {getMediaGlyph(attachment.type)} {attachment.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="overlay-sheet__section">
          <div className="cta-row">
            {reminder.status === "completed" ? (
              <button
                type="button"
                className="primary"
                onClick={() => onUndo?.(reminder.id)}
              >
                ↺ Undo complete
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={() => onComplete?.(reminder.id)}
              >
                ✓ Mark complete
              </button>
            )}
            <button
              type="button"
              className="ghost-button"
              disabled={reminder.status === "completed"}
              onClick={handleSnoozeClick}
            >
              💤 Snooze
            </button>
          </div>
        </section>

        <RescheduleSection
          reminder={reminder}
          onSnooze={onSnooze}
          onReschedule={onReschedule}
          onUpgrade={onUpgrade}
        />

        <section className="overlay-sheet__section">
          <h4>Activity</h4>
          <ul className="activity-list">
            {reminder.activity.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <span className="muted">{item.timestamp}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>

      {showSnoozePicker && (
        <div className="snooze-picker-overlay">
          <div className="snooze-picker-backdrop" onClick={() => setShowSnoozePicker(false)} />
          <div className="snooze-picker-panel">
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
    </div>
  );
}

function RescheduleSection({ reminder, onSnooze, onReschedule, onUpgrade }) {
  const dueDate = reminder.dueEpoch
    ? new Date(reminder.dueEpoch)
    : reminder.dueISO
    ? new Date(reminder.dueISO)
    : null;

  const defaultDate = dueDate ? toInputDate(dueDate) : "";
  const defaultTime = dueDate ? toInputTime(dueDate) : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const dueDateValue = formData.get("dueDate");
    const dueTimeValue = formData.get("dueTime");
    onReschedule?.(reminder.id, {
      dueDate: dueDateValue,
      dueTime: dueTimeValue,
    });
  };

  return (
    <section className="overlay-sheet__section">
      <h4>Reschedule</h4>
      <div className="snooze-row">
        {["Tonight", "Tomorrow AM", "Next Mon"].map((label) => (
          <button
            key={label}
            className="chip"
            type="button"
            onClick={() => onSnooze?.(reminder.id)}
            disabled={reminder.status === "completed"}
          >
            {label}
          </button>
        ))}
      </div>
      <form className="reschedule-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Due date</span>
          <input name="dueDate" type="date" defaultValue={defaultDate} />
        </label>
        <label className="field">
          <span className="field-label">Time</span>
          <input name="dueTime" type="time" defaultValue={defaultTime} />
        </label>
        <button type="submit" className="ghost-button">
          Save schedule
        </button>
      </form>
      <button type="button" className="lock-button" onClick={onUpgrade}>
        Recurring schedule · PRO
      </button>
    </section>
  );
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toInputTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
