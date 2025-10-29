import { useMemo, useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import { getMediaGlyph } from "../../../utils/formatters.js";

const FILTERS = [
  { id: "all", label: "All status" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
];

export default function MobileSearchOverlay({ onClose }) {
  const { reminders } = useDeviceContext();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reminders.filter((item) => {
      const matchesQuery =
        normalized.length === 0 || item.title.toLowerCase().includes(normalized);
      const matchesFilter = filter === "all" || item.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, reminders, filter]);

  return (
    <div className="overlay-dimmer">
      <div className="search-sheet">
        <header className="search-sheet__header">
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close search">
            ←
          </button>
          <input
            className="search-input"
            placeholder="Search reminders…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <button type="button" className="icon-button" aria-label="Voice search">
            🎙️
          </button>
        </header>

        <div className="search-filter-bar">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-chip ${filter === item.id ? "is-active" : ""}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="search-results">
          {results.length === 0 ? (
            <div className="empty-state compact">
              <div className="empty-illustration">🔍</div>
              <h3>No matches</h3>
              <p>Try another keyword or reset filters.</p>
              <button className="ghost-button" type="button" onClick={() => setFilter("all")}>
                Clear filters
              </button>
            </div>
          ) : (
            results.map((item) => (
              <article key={item.id} className="search-result">
                <div className="media-chip">{getMediaGlyph(item.mediaType)}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p className="muted">{item.dueLabel}</p>
                </div>
                <button type="button" className="ghost-button">
                  View
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
