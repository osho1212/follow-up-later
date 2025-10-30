import { useState } from "react";
import { getMediaGlyph } from "../../../utils/formatters.js";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";

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
  const { addReminder } = useDeviceContext();
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

      {mode === "share" ? <SharePanel onUpgrade={onUpgrade} addReminder={addReminder} /> : <ManualPanel onUpgrade={onUpgrade} addReminder={addReminder} />}
    </div>
  );
}

function SharePanel({ onUpgrade, addReminder }) {
  const [title, setTitle] = useState("Brand collab reply");
  const [note, setNote] = useState("Send updated rate card + CTA templates.");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const handleSave = async () => {
    await addReminder({
      title,
      note,
      dueDate,
      dueTime,
      mediaType: "link",
      source: "share",
    });
    // Reset form
    setTitle("");
    setNote("");
    setDueDate("");
    setDueTime("");
  };

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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Notes</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </label>
        <div className="template-banner" role="button" tabIndex={0} onClick={onUpgrade}>
          <span className="template-pill">PRO</span>
          <span>Apply template</span>
          <span className="chevron">›</span>
        </div>
      </section>

      <section className="panel">
        <div className="field inline">
          <div style={{ flex: 1 }}>
            <span className="field-label">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="inline-button"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <span className="field-label">Time</span>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="inline-button"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="ai-suggestion" role="button" tabIndex={0} onClick={onUpgrade}>
          <span className="spark">✧</span>
          <div>
            <p>AI suggests "Tonight, 7:30 PM"</p>
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
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setTitle("");
            setNote("");
            setDueDate("");
            setDueTime("");
          }}
        >
          Discard
        </button>
        <button className="primary" type="button" onClick={handleSave}>
          Save reminder
        </button>
      </section>
    </div>
  );
}

function ManualPanel({ onUpgrade, addReminder }) {
  const [mediaType, setMediaType] = useState("text");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const handleSave = async () => {
    await addReminder({
      title,
      note,
      dueDate,
      dueTime,
      mediaType,
      source: "manual",
    });
    // Reset form
    setTitle("");
    setNote("");
    setDueDate("");
    setDueTime("");
    setMediaType("text");
  };

  return (
    <div className="sheet-content">
      <section className="panel">
        <div className="media-selector">
          {MEDIA_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={`media-selector__item ${choice.id === mediaType ? "is-active" : ""}`}
              onClick={() => setMediaType(choice.id)}
            >
              <span aria-hidden="true">{choice.glyph}</span>
              {choice.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span className="field-label">Title</span>
          <input
            type="text"
            placeholder="Give this follow-up a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Notes</span>
          <textarea
            placeholder="Add context or paste content…"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
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
          <div style={{ flex: 1 }}>
            <span className="field-label">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="inline-button"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <span className="field-label">Time</span>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="inline-button"
              style={{ width: "100%" }}
            />
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
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            setTitle("");
            setNote("");
            setDueDate("");
            setDueTime("");
            setMediaType("text");
          }}
        >
          Cancel
        </button>
        <button className="primary" type="button" onClick={handleSave}>
          Save reminder
        </button>
      </section>
    </div>
  );
}
