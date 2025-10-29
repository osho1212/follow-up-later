import { useMemo, useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import { getMediaGlyph, getSourceLabel } from "../../../utils/formatters.js";

const SEGMENTS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
];

const FILTERS = [
  { id: "all", label: "All media" },
  { id: "link", label: "Links" },
  { id: "file", label: "Files" },
  { id: "image", label: "Images" },
  { id: "voice", label: "Voice" },
  { id: "text", label: "Notes" },
];

export default function MobileHome({ onOpenReminder, onOpenSearch, onOpenManualCreate }) {
  const { reminders, completeReminder, snoozeReminder, completionLog } = useDeviceContext();
  const [segment, setSegment] = useState("today");
  const [mediaFilter, setMediaFilter] = useState("all");

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const segmentMatch = reminder.status === segment;
      const mediaMatch = mediaFilter === "all" || reminder.mediaType === mediaFilter;
      return segmentMatch && mediaMatch;
    });
  }, [reminders, segment, mediaFilter]);

  const progressData = useMemo(() => {
    const now = new Date();
    const windowSize = 7;

    const series = [];
    let completedThisWeek = 0;
    const totalCompleted = Object.values(completionLog).reduce(
      (sum, value) => sum + value,
      0
    );

    for (let offset = windowSize - 1; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      const key = formatDateKey(day);
      const count = completionLog[key] ?? 0;
      completedThisWeek += count;
      series.push({
        key,
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        count,
      });
    }

    const maxCount = series.reduce((max, point) => Math.max(max, point.count), 0);

    let streak = 0;
    for (let i = series.length - 1; i >= 0; i -= 1) {
      if (series[i].count > 0) {
        streak += 1;
      } else {
        break;
      }
    }

    return {
      completedThisWeek,
      totalCompleted,
      streak,
      series,
      maxCount,
    };
  }, [completionLog]);

  const upcomingSoon = useMemo(() => {
    return reminders
      .filter(
        (reminder) =>
          reminder.status !== "completed" &&
          (reminder.status === "today" || reminder.status === "upcoming")
      )
      .map((reminder) => ({ reminder, dueDate: getDueDate(reminder) }))
      .filter(({ dueDate }) => dueDate !== null)
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 3)
      .map(({ reminder }) => reminder);
  }, [reminders]);

  const completedReminders = useMemo(() => {
    return reminders
      .filter((reminder) => reminder.status === "completed")
      .map((reminder) => ({
        ...reminder,
        completedAt: reminder.completedAtISO ? new Date(reminder.completedAtISO) : null,
      }))
      .sort((a, b) => {
        const aTime = a.completedAt ? a.completedAt.getTime() : 0;
        const bTime = b.completedAt ? b.completedAt.getTime() : 0;
        return bTime - aTime;
      });
  }, [reminders]);

  return (
    <div className="mobile-screen mobile-home">
      <header className="mobile-home__header">
        <div>
          <p className="badge subtle">Today</p>
          <h2>Stay on track today</h2>
        </div>
        <button type="button" className="icon-button" onClick={onOpenSearch} aria-label="Search">
          🔍
        </button>
      </header>

      <div className="mobile-home__segment">
        {SEGMENTS.map((item) => (
          <button
            key={item.id}
            className={`segment-chip ${segment === item.id ? "is-active" : ""}`}
            onClick={() => setSegment(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mobile-home__filters" role="toolbar" aria-label="Media filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`filter-chip ${mediaFilter === filter.id ? "is-active" : ""}`}
            onClick={() => setMediaFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="mobile-insights">
        <article className="mobile-progress-card">
          <h3>Progress</h3>
          <div className="mobile-progress-card__stats">
            <div>
              <p className="metric">{progressData.completedThisWeek}</p>
              <p className="muted micro">Completed in 7 days</p>
            </div>
            <div>
              <p className="metric">{progressData.streak}</p>
              <p className="muted micro">Day streak</p>
            </div>
            <div>
              <p className="metric">{progressData.totalCompleted}</p>
              <p className="muted micro">All-time</p>
            </div>
          </div>
          <div className="mobile-progress-chart" aria-hidden="true">
            {progressData.series.map((point) => {
              const height =
                progressData.maxCount === 0
                  ? 0
                  : Math.round((point.count / progressData.maxCount) * 100);
              return (
                <div key={point.key} className="mobile-progress-chart__bar">
                  <span className="mobile-progress-chart__count">{point.count}</span>
                  <div
                    className="mobile-progress-chart__fill"
                    style={{ height: `${height}%` }}
                    title={`${point.count} completed on ${point.key}`}
                  />
                  <span className="mobile-progress-chart__label">{point.label}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="mobile-upcoming-card">
          <header>
            <h3>Upcoming soon</h3>
            <span className="muted micro">Next reminders</span>
          </header>
          {upcomingSoon.length > 0 ? (
            <ul>
              {upcomingSoon.map((reminder) => (
                <li key={reminder.id} onClick={() => onOpenReminder(reminder.id)}>
                  <div>
                    <strong>{reminder.title}</strong>
                    <span className="muted micro">{reminder.dueLabel}</span>
                  </div>
                  <button
                    type="button"
                    className="inline-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenReminder(reminder.id);
                    }}
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted micro">No upcoming reminders soon</p>
          )}
        </article>
      </section>

      <div className="mobile-home__timeline">
        {filteredReminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true">
              ⏱️
            </div>
            <h3>Everything scheduled.</h3>
            <p>Add a follow-up to stay ahead of the rush.</p>
            <button className="primary" type="button" onClick={onOpenManualCreate}>
              + Follow-Up
            </button>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <article
              key={reminder.id}
              className="reminder-card"
              onClick={() => onOpenReminder(reminder.id)}
            >
              <div className="reminder-card__head">
                <span className="media-chip">{getMediaGlyph(reminder.mediaType)}</span>
                <div className="reminder-card__meta">
                  <h4>{reminder.title}</h4>
                  <p>
                    {getSourceLabel(reminder.source)} • {reminder.dueLabel}
                  </p>
                </div>
                <span className={`status-pill status-${reminder.status}`}>
                  {reminder.countdown}
                </span>
              </div>
              <div className="reminder-card__actions">
                <button
                  type="button"
                  className="action action-complete"
                  onClick={(event) => {
                    event.stopPropagation();
                    completeReminder(reminder.id);
                  }}
                >
                  ✓ Complete
                </button>
                <button
                  type="button"
                  className="action action-snooze"
                  onClick={(event) => {
                    event.stopPropagation();
                    snoozeReminder(reminder.id);
                  }}
                >
                  💤 Snooze
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <CompletedSection reminders={completedReminders} onReview={onOpenReminder} />
    </div>
  );
}

function getDueDate(reminder) {
  if (!reminder) {
    return null;
  }
  if (reminder.dueEpoch) {
    const fromEpoch = new Date(reminder.dueEpoch);
    if (!Number.isNaN(fromEpoch.getTime())) {
      return fromEpoch;
    }
  }
  if (reminder.dueISO) {
    const parsed = new Date(reminder.dueISO);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCompletedLabel(reminder) {
  if (!reminder.completedAt) {
    return "Completed";
  }
  const now = new Date();
  const time = reminder.completedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (reminder.completedAt.toDateString() === now.toDateString()) {
    return `Completed today · ${time}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (reminder.completedAt.toDateString() === yesterday.toDateString()) {
    return `Completed yesterday · ${time}`;
  }
  return `Completed ${reminder.completedAt.toLocaleDateString()} · ${time}`;
}

function CompletedSection({ reminders, onReview }) {
  if (reminders.length === 0) {
    return null;
  }
  return (
    <section className="mobile-completed-section">
      <header>
        <h3>Completed</h3>
        <span className="muted micro">{reminders.length} total</span>
      </header>
      <ul>
        {reminders.map((reminder) => (
          <li key={reminder.id}>
            <div className="completed-info">
              <strong>{reminder.title}</strong>
              <span className="muted micro">{formatCompletedLabel(reminder)}</span>
              <p className="completed-note">{reminder.note}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => onReview(reminder.id)}>
              Review
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
