// Browser Notification Service

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} true if granted, false otherwise
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

/**
 * Check if notifications are supported and permitted
 * @returns {boolean}
 */
export const areNotificationsEnabled = () => {
  return "Notification" in window && Notification.permission === "granted";
};

/**
 * Get current notification permission status
 * @returns {"granted" | "denied" | "default" | "unsupported"}
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

/**
 * Show a notification for a reminder
 * @param {Object} reminder - The reminder object
 * @returns {Notification | null}
 */
export const showReminderNotification = (reminder) => {
  console.log("[Notification] showReminderNotification called for:", reminder.title);
  console.log("[Notification] Notifications enabled:", areNotificationsEnabled());
  console.log("[Notification] Permission:", Notification.permission);

  if (!areNotificationsEnabled()) {
    console.error("[Notification] Notifications not enabled!");
    return null;
  }

  try {
    console.log("[Notification] Creating notification...");
    const notification = new Notification(reminder.title || "Follow-up Reminder", {
      body: reminder.note || "You have a follow-up due now",
      tag: `reminder-${reminder.id}`, // Prevents duplicate notifications
      requireInteraction: true, // Notification stays until user interacts
      data: {
        reminderId: reminder.id,
        dueTime: reminder.dueISO,
      },
    });

    console.log("[Notification] Notification created successfully:", notification);

    // Handle notification click
    notification.onclick = (event) => {
      console.log("[Notification] Notification clicked");
      event.preventDefault();
      window.focus();
      notification.close();

      // Dispatch custom event that the app can listen to
      window.dispatchEvent(
        new CustomEvent("notification-clicked", {
          detail: { reminderId: reminder.id },
        })
      );
    };

    notification.onerror = (error) => {
      console.error("[Notification] Notification error:", error);
    };

    notification.onshow = () => {
      console.log("[Notification] Notification shown successfully!");
    };

    notification.onclose = () => {
      console.log("[Notification] Notification closed");
    };

    return notification;
  } catch (error) {
    console.error("[Notification] Error showing notification:", error);
    return null;
  }
};

/**
 * Schedule a notification for a specific time
 * @param {Object} reminder - The reminder object
 * @param {Date} dueDate - When to show the notification
 * @returns {number | null} - Timeout ID for cancellation, or null
 */
export const scheduleNotification = (reminder, dueDate) => {
  if (!areNotificationsEnabled()) {
    console.log("[Notification] Not enabled, skipping schedule for:", reminder.title);
    return null;
  }

  const now = new Date();
  const timeUntilDue = dueDate.getTime() - now.getTime();

  console.log("[Notification] Scheduling:", {
    title: reminder.title,
    dueDate: dueDate.toISOString(),
    now: now.toISOString(),
    timeUntilDueMs: timeUntilDue,
    timeUntilDueMinutes: (timeUntilDue / 1000 / 60).toFixed(2),
  });

  // Don't schedule if already past due
  if (timeUntilDue < 0) {
    console.log("[Notification] Already past due, skipping:", reminder.title);
    return null;
  }

  // Browser setTimeout max is ~24.8 days (2^31-1 milliseconds)
  // Don't schedule if too far in the future
  const MAX_TIMEOUT = 2147483647;
  if (timeUntilDue > MAX_TIMEOUT) {
    console.log("[Notification] Too far in future, skipping:", reminder.title);
    return null;
  }

  const timeoutId = setTimeout(() => {
    console.log("[Notification] Triggering notification for:", reminder.title);
    showReminderNotification(reminder);
  }, timeUntilDue);

  console.log("[Notification] Scheduled successfully with timeout ID:", timeoutId);
  return timeoutId;
};

/**
 * Cancel a scheduled notification
 * @param {number} timeoutId - The timeout ID returned from scheduleNotification
 */
export const cancelScheduledNotification = (timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
};

/**
 * Show a test notification
 * @returns {Notification | null}
 */
export const showTestNotification = () => {
  console.log("[Test Notification] Starting...");
  console.log("[Test Notification] Notifications enabled:", areNotificationsEnabled());
  console.log("[Test Notification] Permission:", Notification.permission);

  if (!areNotificationsEnabled()) {
    console.error("[Test Notification] Notifications NOT enabled!");
    alert("Notifications not enabled! Permission: " + Notification.permission);
    return null;
  }

  try {
    console.log("[Test Notification] Creating notification...");
    const notification = new Notification("✅ Test Notification", {
      body: "Notifications are working! You'll be notified when reminders are due.",
      tag: "test-notification",
      requireInteraction: false,
    });

    console.log("[Test Notification] Notification object created:", notification);

    notification.onclick = (event) => {
      console.log("[Test Notification] Clicked");
      event.preventDefault();
      window.focus();
      notification.close();
    };

    notification.onshow = () => {
      console.log("[Test Notification] SHOWN!");
    };

    notification.onerror = (error) => {
      console.error("[Test Notification] ERROR:", error);
    };

    notification.onclose = () => {
      console.log("[Test Notification] Closed");
    };

    return notification;
  } catch (error) {
    console.error("[Test Notification] Exception:", error);
    alert("Error showing notification: " + error.message);
    return null;
  }
};
