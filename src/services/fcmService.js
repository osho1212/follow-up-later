// Firebase Cloud Messaging Service
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// You need to add this to your .env file
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request FCM token for push notifications
 * @param {string} userId - Current user ID
 * @returns {Promise<string|null>} FCM token or null
 */
export const requestFCMToken = async (userId) => {
  if (!messaging) {
    console.warn("Firebase Messaging not supported");
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    console.log("Service Worker registered:", registration);

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log("FCM Token:", token);

    // Save token to Firestore for this user
    if (token && userId) {
      await setDoc(
        doc(db, "fcmTokens", userId),
        {
          token,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {function} callback - Callback to handle incoming messages
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
};

/**
 * Show notification from FCM payload
 * @param {object} payload - FCM message payload
 */
export const showFCMNotification = (payload) => {
  const notificationTitle = payload.notification?.title || "Follow-up Reminder";
  const notificationOptions = {
    body: payload.notification?.body || "You have a reminder due now",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    tag: payload.data?.reminderId || "reminder",
    requireInteraction: true,
    data: payload.data,
  };

  if (Notification.permission === "granted") {
    new Notification(notificationTitle, notificationOptions);
  }
};
