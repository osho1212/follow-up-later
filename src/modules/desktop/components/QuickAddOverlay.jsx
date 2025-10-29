import { useEffect, useMemo, useRef, useState } from "react";

const MEDIA_OPTIONS = [
  { id: "text", label: "Text" },
  { id: "link", label: "Link" },
  { id: "file", label: "File" },
  { id: "image", label: "Image" },
  { id: "voice", label: "Voice memo" },
];

const SOURCE_OPTIONS = [
  { id: "manual", label: "Manual" },
  { id: "share", label: "Shared" },
];

export default function QuickAddOverlay({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [source, setSource] = useState("manual");
  const defaultDate = useMemo(() => formatDateInput(new Date()), []);
  const defaultTime = useMemo(() => formatTimeInput(addHours(new Date(), 1)), []);
  const [dueDate, setDueDate] = useState(defaultDate);
  const [dueTime, setDueTime] = useState(defaultTime);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      titleRef.current?.focus();
      return;
    }

    onSubmit({
      title: trimmedTitle,
      note: note.trim(),
      dueDate,
      dueTime,
      mediaType,
      source,
    });

    setTitle("");
    setNote("");
    setMediaType("text");
    setSource("manual");
    setDueDate(formatDateInput(new Date()));
    setDueTime(formatTimeInput(addHours(new Date(), 1)));
  };

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const isSaveDisabled = title.trim().length === 0;

  return (
    <div
      className="quick-add-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-heading"
      onMouseDown={handleOverlayMouseDown}
    >
      <form className="quick-add-dialog" onSubmit={handleSubmit}>
        <header className="quick-add-header">
          <div>
            <p className="badge subtle">Quick add</p>
            <h2 id="quick-add-heading">New follow-up</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </header>

        <div className="quick-add-grid">
          <label className="field">
            <span className="field-label">Title</span>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you need to follow up on?"
            />
          </label>

          <label className="field">
            <span className="field-label">Media type</span>
            <select value={mediaType} onChange={(event) => setMediaType(event.target.value)}>
              {MEDIA_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field full">
            <span className="field-label">Notes</span>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context, links, or what you need to send."
            />
          </label>

          <div className="quick-add-datetime">
            <label className="field">
              <span className="field-label">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Time</span>
              <input
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
              />
            </label>
          </div>
        </div>

        <footer className="quick-add-footer">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={isSaveDisabled}>
            Save reminder
          </button>
        </footer>
      </form>
    </div>
  );
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addHours(date, hours) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}
