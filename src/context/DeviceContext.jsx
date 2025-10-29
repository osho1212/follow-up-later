import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialReminders, templates, integrations } from "../data/sampleData.js";

const DeviceContext = createContext(null);

export function DeviceContextProvider({ children }) {
  const [reminders, setReminders] = useState(() => normalizeReminders(initialReminders));
  const [activeReminderId, setActiveReminderId] = useState(reminders[0]?.id ?? null);
  const [completionLog, setCompletionLog] = useState(() =>
    initialiseCompletionLog(initialReminders)
  );
  const [reminderSettings, setReminderSettings] = useState(defaultReminderSettings);

  useEffect(() => {
    const derivedLog = buildCompletionLogFromReminders(reminders);
    setCompletionLog((prev) => {
      if (shallowCompareLogs(prev, derivedLog)) {
        return prev;
      }
      return derivedLog;
    });
  }, [reminders]);

  const addReminder = useCallback(
    ({ title, note, dueDate, dueTime, mediaType, source }) => {
      const now = new Date();
      const normalizedSource = source === "share" ? "share" : "manual";
      const normalizedMediaType = mediaType ?? "text";
      const normalizedTitle = (title ?? "").trim();
      const normalizedNote = (note ?? "").trim();
      const dueAt = buildDueDate(dueDate, dueTime, now, reminderSettings.defaultDueTime);
      const dueEpoch = dueAt.getTime();

      const reminder = {
        id: generateReminderId(),
        title: normalizedTitle.length > 0 ? normalizedTitle : "Untitled follow-up",
        mediaType: normalizedMediaType,
        source: normalizedSource,
        dueLabel: formatDueLabel(dueAt, now),
        dueISO: dueAt.toISOString(),
        dueEpoch,
        status: deriveStatus(dueAt, now),
        note: normalizedNote.length > 0 ? normalizedNote : "No notes yet.",
        createdAtLabel: formatCreatedAtLabel(normalizedSource, now),
        countdown: formatCountdown(dueAt, now),
        attachments: [],
        activity: [createActivityEntry(now)],
      };

      setReminders((prev) => [reminder, ...prev]);
      setActiveReminderId(reminder.id);
      return reminder;
    },
    [reminderSettings.defaultDueTime]
  );

  const removeReminder = useCallback((reminderId) => {
    const outcome = {
      removed: false,
      nextActiveId: null,
    };

    setReminders((prev) => {
      const next = [];
      for (const item of prev) {
        if (item.id === reminderId) {
          outcome.removed = true;
        } else {
          next.push(item);
        }
      }

      if (!outcome.removed) {
        return prev;
      }

      outcome.nextActiveId = next[0]?.id ?? null;
      return next;
    });

    if (outcome.removed) {
      setActiveReminderId((currentId) =>
        currentId === reminderId ? outcome.nextActiveId : currentId
      );
    }

    return outcome.nextActiveId;
  }, []);

  const completeReminder = useCallback((reminderId) => {
    const now = new Date();
    const completionStamp = now.toISOString();
    let didComplete = false;

    setReminders((prev) => {
      let modified = false;
      const next = prev.map((item) => {
        if (item.id !== reminderId || item.status === "completed") {
          return item;
        }
        modified = true;
        return {
          ...item,
          status: "completed",
          completedAtISO: completionStamp,
          countdown: formatCompletionCountdown(now, now),
          activity: [createActivityEntry(now, "Marked complete"), ...item.activity],
        };
      });

      if (!modified) {
        return prev;
      }

      didComplete = true;
      return next;
    });

  }, []);

  const undoCompleteReminder = useCallback(
    (reminderId) => {
      const reference = new Date();
      let removedStamp = null;

      setReminders((prev) => {
        let modified = false;
        const next = prev.map((item) => {
          if (item.id !== reminderId || item.status !== "completed") {
            return item;
          }
          modified = true;
          removedStamp = item.completedAtISO ?? null;
          const dueAt =
            getDueDate(item) ??
            buildDueDate(null, null, reference, reminderSettings.defaultDueTime);
          const reverted = {
            ...item,
            dueEpoch: dueAt.getTime(),
            status: deriveStatus(dueAt, reference),
            dueLabel: formatDueLabel(dueAt, reference),
            countdown: formatCountdown(dueAt, reference),
            activity: [createActivityEntry(reference, "Marked active"), ...item.activity],
          };
          delete reverted.completedAtISO;
          return reverted;
        });

        if (!modified) {
          removedStamp = null;
          return prev;
        }

        return next;
      });

    },
    [reminderSettings.defaultDueTime]
  );

  const snoozeReminder = useCallback((reminderId, minutes) => {
    setReminders((prev) =>
      prev.map((item) => {
        if (item.id !== reminderId || item.status === "completed") {
          return item;
        }
        const now = new Date();
        const presetMinutes =
          minutes ?? reminderSettings.snoozePresets[0]?.minutes ?? 60;
        const currentDue =
          getDueDate(item) ?? buildDueDate(null, null, now, reminderSettings.defaultDueTime);
        const base = currentDue > now ? currentDue : now;
        const newDue = new Date(base);
        newDue.setMinutes(newDue.getMinutes() + presetMinutes);
        return {
          ...item,
          dueEpoch: newDue.getTime(),
          dueISO: newDue.toISOString(),
          dueLabel: formatDueLabel(newDue, now),
          status: deriveStatus(newDue, now),
          countdown: formatCountdown(newDue, now),
          activity: [
            createActivityEntry(now, formatSnoozeActivityLabel(presetMinutes)),
            ...item.activity,
          ],
        };
      })
    );
  }, [reminderSettings.defaultDueTime, reminderSettings.snoozePresets]);

  const updateReminderSchedule = useCallback(
    (reminderId, { dueDate, dueTime }) => {
      setReminders((prev) =>
        prev.map((item) => {
          if (item.id !== reminderId) {
            return item;
          }
          const now = new Date();
          const nextDue = buildDueDate(dueDate, dueTime, now, reminderSettings.defaultDueTime);
          return {
            ...item,
            dueEpoch: nextDue.getTime(),
            dueISO: nextDue.toISOString(),
            dueLabel: formatDueLabel(nextDue, now),
            status: item.status === "completed" ? "completed" : deriveStatus(nextDue, now),
            countdown:
              item.status === "completed"
                ? item.countdown
                : formatCountdown(nextDue, now),
            activity: [createActivityEntry(now, "Schedule updated"), ...item.activity],
          };
        })
      );
    },
    [reminderSettings.defaultDueTime]
  );

  const updateDefaultDueTime = useCallback((timeString) => {
    if (!isValidTimeValue(timeString)) {
      return false;
    }
    setReminderSettings((prev) => ({
      ...prev,
      defaultDueTime: timeString,
    }));
    return true;
  }, []);

  const updateSnoozePresets = useCallback((presets) => {
    setReminderSettings((prev) => ({
      ...prev,
      snoozePresets: normalizeSnoozePresets(presets),
    }));
  }, []);

  const value = useMemo(
    () => ({
      reminders,
      setReminders,
      activeReminderId,
      setActiveReminderId,
      templates,
      integrations,
      addReminder,
      removeReminder,
      completeReminder,
      undoCompleteReminder,
      snoozeReminder,
      updateReminderSchedule,
      reminderSettings,
      updateDefaultDueTime,
      updateSnoozePresets,
      completionLog,
    }),
    [
      reminders,
      activeReminderId,
      addReminder,
      removeReminder,
      completeReminder,
      undoCompleteReminder,
      snoozeReminder,
      updateReminderSchedule,
      reminderSettings,
      updateDefaultDueTime,
      updateSnoozePresets,
      completionLog,
    ]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDeviceContext() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDeviceContext must be used within DeviceContextProvider");
  }
  return context;
}

function generateReminderId() {
  return `rem-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeReminders(list, defaultDueTime = defaultReminderSettings.defaultDueTime) {
  const now = new Date();
  return list.map((reminder) => {
    const dueAt = getDueDate(reminder) ?? buildDueDate(null, null, now, defaultDueTime);
    const completedAt =
      reminder.status === "completed" && reminder.completedAtISO
        ? parseDueDate(reminder.completedAtISO)
        : null;
    return {
      ...reminder,
      dueEpoch: dueAt.getTime(),
      dueISO: reminder.dueISO ? normalizeISO(reminder.dueISO, dueAt) : dueAt.toISOString(),
      dueLabel: reminder.dueLabel ?? formatDueLabel(dueAt, now),
      status: reminder.status ?? deriveStatus(dueAt, now),
      countdown:
        reminder.status === "completed"
          ? reminder.countdown ?? formatCompletionCountdown(completedAt ?? now, now)
          : reminder.countdown ?? formatCountdown(dueAt, now),
    };
  });
}

function initialiseCompletionLog(reminders) {
  return buildCompletionLogFromReminders(reminders);
}

function buildDueDate(dateInput, timeInput, reference, defaultDueTime = defaultReminderSettings.defaultDueTime) {
  const parsedTime = parseTimeValue(timeInput ?? defaultDueTime);

  if (dateInput) {
    const [year, month, day] = dateInput.split("-").map(Number);
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day) &&
      parsedTime
    ) {
      const candidate = new Date(year, month - 1, day, parsedTime[0], parsedTime[1]);
      if (!Number.isNaN(candidate.getTime())) {
        return candidate;
      }
    }
  }

  const fallback = new Date(reference);
  if (parsedTime) {
    fallback.setHours(parsedTime[0], parsedTime[1], 0, 0);
    if (fallback <= reference) {
      fallback.setDate(fallback.getDate() + 1);
    }
    return fallback;
  }

  fallback.setHours(fallback.getHours() + 1, 0, 0, 0);
  return fallback;
}

function formatDueLabel(dueAt, reference) {
  const timeLabel = dueAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isSameDay(dueAt, reference)) {
    return `Today • ${timeLabel}`;
  }

  const tomorrow = new Date(reference);
  tomorrow.setDate(reference.getDate() + 1);
  if (isSameDay(dueAt, tomorrow)) {
    return `Tomorrow • ${timeLabel}`;
  }

  const formatter =
    dueAt.getFullYear() === reference.getFullYear()
      ? new Intl.DateTimeFormat([], { weekday: "short", month: "short", day: "numeric" })
      : new Intl.DateTimeFormat([], { month: "short", day: "numeric", year: "numeric" });

  return `${formatter.format(dueAt)} • ${timeLabel}`;
}

function deriveStatus(dueAt, reference) {
  const diff = dueAt.getTime() - reference.getTime();
  if (diff < -60 * 1000) {
    return "overdue";
  }
  if (isSameDay(dueAt, reference)) {
    return "today";
  }
  return "upcoming";
}

function formatCountdown(dueAt, reference) {
  const diffMs = dueAt.getTime() - reference.getTime();
  const prefix = diffMs >= 0 ? "In" : "Overdue by";
  const absMs = Math.abs(diffMs);
  const totalMinutes = Math.round(absMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const segments = [];
  if (hours > 0) {
    segments.push(`${hours}h`);
  }
  if (minutes > 0 || segments.length === 0) {
    segments.push(`${minutes}m`);
  }
  return `${prefix} ${segments.join(" ")}`;
}

function formatCreatedAtLabel(source, reference) {
  const timeLabel = reference.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  let daySegment = reference.toLocaleDateString([], { month: "short", day: "numeric" });

  const today = new Date();
  const yesterday = new Date();
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(reference, today)) {
    daySegment = "Today";
  } else if (isSameDay(reference, yesterday)) {
    daySegment = "Yesterday";
  }

  const sourceLabel = source === "share" ? "Shared" : "Created manually";
  return `${sourceLabel} • ${daySegment} ${timeLabel}`;
}

function createActivityEntry(reference, label = "Reminder created") {
  const timeLabel = reference.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const daySegment = isSameDay(reference, today)
    ? "Today"
    : reference.toLocaleDateString([], { month: "short", day: "numeric" });
  const timestamp = `${daySegment} • ${timeLabel}`;
  return {
    id: `act-${Math.random().toString(36).slice(2, 9)}`,
    label,
    timestamp,
  };
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatCompletionCountdown(completedAt, reference) {
  const diffMs = reference.getTime() - completedAt.getTime();
  if (diffMs < 60 * 1000) {
    return "Completed just now";
  }
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const segments = [];
  if (hours > 0) {
    segments.push(`${hours}h`);
  }
  if (minutes > 0) {
    segments.push(`${minutes}m`);
  }
  const suffix = segments.length > 0 ? segments.join(" ") : `${totalMinutes}m`;
  return `Completed ${suffix} ago`;
}

function isValidTimeValue(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function parseTimeValue(value) {
  if (!isValidTimeValue(value)) {
    return null;
  }
  const [hour, minute] = value.split(":").map(Number);
  return [hour, minute];
}

function formatSnoozeActivityLabel(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Snoozed";
  }
  if (minutes % 1440 === 0) {
    const days = Math.round(minutes / 1440);
    return `Snoozed +${days}d`;
  }
  if (minutes % 60 === 0) {
    const hours = Math.round(minutes / 60);
    return `Snoozed +${hours}h`;
  }
  return `Snoozed +${minutes}m`;
}

function normalizeSnoozePresets(presets) {
  if (!Array.isArray(presets) || presets.length === 0) {
    return defaultReminderSettings.snoozePresets;
  }
  const normalized = presets
    .map((preset, index) => {
      if (!preset) {
        return null;
      }
      const minutes = Number(preset.minutes);
      if (!Number.isFinite(minutes) || minutes <= 0) {
        return null;
      }
      const label =
        (preset.label ?? "").trim() || formatPresetLabelFromMinutes(minutes);
      return {
        id: preset.id ?? createPresetId(index),
        label,
        minutes,
      };
    })
    .filter(Boolean);
  return normalized.length > 0 ? normalized : defaultReminderSettings.snoozePresets;
}

function formatPresetLabelFromMinutes(minutes) {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `+${days} day${days === 1 ? "" : "s"}`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `+${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `+${minutes} min`;
}

function createPresetId(seed) {
  return `preset-${Math.random().toString(36).slice(2, 6)}-${seed}`;
}

function parseDueDate(isoString) {
  if (!isoString) {
    return null;
  }
  const hasZone = /[+-]\d\d:\d\d$|Z$/.test(isoString);
  if (hasZone) {
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const [datePart, timePart = ""] = isoString.split("T");
  if (!datePart) {
    return null;
  }
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours = 9, minutes = 0] = timePart.split(":").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }
  const candidate = new Date(year, (month ?? 1) - 1, day, hours ?? 9, minutes ?? 0);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function getDueDate(reminder) {
  if (reminder?.dueEpoch) {
    const date = new Date(reminder.dueEpoch);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  if (reminder?.dueISO) {
    return parseDueDate(reminder.dueISO);
  }
  return null;
}

function normalizeISO(originalIso, dueAt) {
  if (!originalIso) {
    return dueAt.toISOString();
  }
  const hasZone = /[+-]\d\d:\d\d$|Z$/.test(originalIso);
  return hasZone ? originalIso : dueAt.toISOString();
}

function toDateKey(timestamp) {
  if (!timestamp) {
    return null;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCompletionLogFromReminders(reminders) {
  return reminders.reduce((acc, reminder) => {
    if (reminder.status === "completed" && reminder.completedAtISO) {
      const key = toDateKey(reminder.completedAtISO);
      if (key) {
        acc[key] = (acc[key] ?? 0) + 1;
      }
    }
    return acc;
  }, {});
}

function shallowCompareLogs(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

const defaultReminderSettings = {
  defaultDueTime: "17:00",
  snoozePresets: [
    { id: "preset-1h", label: "+1h", minutes: 60 },
    { id: "preset-3h", label: "+3h", minutes: 180 },
    { id: "preset-tomorrow", label: "Tomorrow 9 AM", minutes: 1020 },
    { id: "preset-nextmon", label: "Next Mon 9 AM", minutes: 4320 },
  ],
};
