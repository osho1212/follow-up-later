import { useMemo, useState } from "react";
import { useDeviceContext } from "../../../context/DeviceContext.jsx";
import { getMediaGlyph, getSourceLabel } from "../../../utils/formatters.js";

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
];

export default function DesktopHome({ onSelectReminder }) {
  const { reminders, completeReminder, snoozeReminder, completionLog } = useDeviceContext();
  const [statusFilter, setStatusFilter] = useState("all");

  const grouped = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? reminders
        : reminders.filter((item) => item.status === statusFilter);
    return filtered.reduce((acc, reminder) => {
      const key = reminder.status;
      acc[key] = acc[key] ? [...acc[key], reminder] : [reminder];
      return acc;
    }, {});
  }, [reminders, statusFilter]);

  const progressData = useMemo(() => {
    const now = new Date();
    const rawTotals = Object.values(completionLog);
    const totalCompleted = rawTotals.reduce((sum, value) => sum + value, 0);

    const windowSize = 7;
    const series = [];
    let completedThisWeek = 0;

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
        dateString: day.toLocaleDateString(),
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
      maxCount,
      series,
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
    <div className="desktop-home">
      <section className="home-header">
        <div>
          <h2>Timeline</h2>
          <p className="muted">Manage follow-ups across sources and media.</p>
        </div>
        <div className="filter-row">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip ${statusFilter === option.id ? "is-active" : ""}`}
              onClick={() => setStatusFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="home-layout">
        <div className="timeline-column">
          {["today", "upcoming", "overdue"].map((segment) => (
            <SegmentGroup
              key={segment}
              title={segmentTitle(segment)}
              reminders={grouped[segment] ?? []}
              onSelectReminder={onSelectReminder}
              onComplete={(id) => completeReminder(id)}
              onSnooze={(id) => snoozeReminder(id)}
            />
          ))}
        </div>

        <aside className="insight-column">
          <div className="insight-card">
            <h3>Progress</h3>
            <div className="progress-card__stats">
              <div>
                <p className="progress-card__metric">{progressData.completedThisWeek}</p>
                <p className="muted micro">Completed in last 7 days</p>
              </div>
              <div>
                <p className="progress-card__metric">{progressData.streak}</p>
                <p className="muted micro">Day streak</p>
              </div>
              <div>
                <p className="progress-card__metric">{progressData.totalCompleted}</p>
                <p className="muted micro">All-time completed</p>
              </div>
            </div>
            <div className="progress-card__chart" aria-hidden="true">
              {progressData.series.map((point) => {
                const height =
                  progressData.maxCount === 0
                    ? 0
                    : Math.round((point.count / progressData.maxCount) * 100);
                return (
                  <div key={point.key} className="progress-card__bar">
                    <span className="progress-card__barCount">{point.count}</span>
                    <div
                      className="progress-card__barFill"
                      style={{ height: `${height}%` }}
                      title={`${point.count} completed on ${point.dateString}`}
                    />
                    <span className="progress-card__barLabel">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="insight-card">
            <h3>Upcoming soon</h3>
            {upcomingSoon.length > 0 ? (
              <ul>
                {upcomingSoon.map((reminder) => (
                  <li key={reminder.id}>
                    <span>{reminder.title}</span>
                    <span className="muted">{reminder.dueLabel}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No upcoming follow-ups in the next few days</p>
            )}
          </div>

          <div className="insight-card">
            <h3>Automation ideas</h3>
            <p>Upgrade to Pro to unlock recurring reminders and AI suggestions.</p>
            <button type="button" className="ghost-button">
              View plans
            </button>
          </div>
        </aside>
      </div>

      <CompletedSection reminders={completedReminders} onReview={onSelectReminder} />
    </div>
  );
}

function SegmentGroup({ title, reminders, onSelectReminder, onComplete, onSnooze }) {
  return (
    <section className="segment-group">
      <header>
        <h3>{title}</h3>
        <span className="count">{reminders.length}</span>
      </header>
      {reminders.length === 0 ? (
        <div className="empty-slot">Nothing here yet.</div>
      ) : (
        <ul className="reminder-table">
          {reminders.map((reminder) => (
            <li key={reminder.id} className={`reminder-row status-${reminder.status}`}>
              <button type="button" onClick={() => onSelectReminder(reminder.id)}>
                <span className="glyph">{getMediaGlyph(reminder.mediaType)}</span>
                <div className="row-body">
                  <strong>{reminder.title}</strong>
                  <span className="muted">
                    {getSourceLabel(reminder.source)} • {reminder.dueLabel}
                  </span>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="pill positive"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onComplete?.(reminder.id);
                    }}
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    className="pill"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onSnooze?.(reminder.id);
                    }}
                  >
                    Snooze
                  </button>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function segmentTitle(id) {
  switch (id) {
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "overdue":
      return "Overdue";
    default:
      return id;
  }
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
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const time = formatter.format(reminder.completedAt);

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
    <section className="completed-section">
      <header className="completed-section__header">
        <div>
          <h3>Completed</h3>
          <p className="muted micro">Your most recent finished follow-ups</p>
        </div>
        <span className="completed-section__count">{reminders.length}</span>
      </header>

      <ul className="completed-list">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="completed-list__item">
            <div className="completed-list__main">
              <div className="completed-list__heading">
                <span className="completed-list__title">{reminder.title}</span>
                <span className={`status-pill status-${reminder.status}`}>Done</span>
              </div>
              <p className="muted micro">{formatCompletedLabel(reminder)}</p>
              <p className="completed-list__note">{reminder.note}</p>
              <div className="completed-list__meta">
                <span>{getSourceLabel(reminder.source)}</span>
                <span>Originally due · {reminder.dueLabel}</span>
              </div>
            </div>
            <div className="completed-list__actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => onReview(reminder.id)}
              >
                Review
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
