// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCiuTC9K0MfHhNDyR-Y9G94OkRgnQHTYlU",
  authDomain: "follow-up-3ea55.firebaseapp.com",
  projectId: "follow-up-3ea55",
  storageBucket: "follow-up-3ea55.firebasestorage.app",
  messagingSenderId: "822719159075",
  appId: "1:822719159075:web:0a08581b04173070440a96"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Follow-up Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a reminder due now',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: payload.data?.reminderId || 'reminder',
    requireInteraction: true,
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Open the app
  event.waitUntil(
    clients.openWindow('/')
  );
});
