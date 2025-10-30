# Firebase Cloud Messaging Setup Guide

## Overview
To get real-time push notifications working, you need:
1. Firebase Cloud Messaging (FCM) configured
2. A VAPID key for web push
3. Firebase Cloud Functions to send notifications at scheduled times

## Step 1: Get VAPID Key from Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/follow-up-3ea55/settings/cloudmessaging)
2. Navigate to: **Project Settings** → **Cloud Messaging** tab
3. Scroll to **Web Push certificates**
4. If you don't have a key pair, click **"Generate key pair"**
5. Copy the **"Key pair"** value (starts with `B...`)

## Step 2: Add VAPID Key to .env

Add this line to your `.env` file:

```env
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

Replace `YOUR_VAPID_KEY_HERE` with the key you copied.

## Step 3: Enable Firebase Cloud Functions (Requires Billing)

**Important:** Cloud Functions require the **Blaze Plan** (pay-as-you-go). The free tier includes:
- 2M invocations/month
- 400,000 GB-seconds, 200,000 GHz-seconds of compute time
- 5GB outbound networking

For a small app, this is effectively free.

### Install Firebase CLI and Initialize Functions:

```bash
cd "Follow up app"
npm install -g firebase-tools
firebase login
firebase init functions
```

Select:
- Use existing project: `follow-up-3ea55`
- Language: JavaScript or TypeScript
- Install dependencies: Yes

## Step 4: Create Cloud Function for Scheduled Notifications

Create `functions/index.js`:

```javascript
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Run every minute to check for due reminders
exports.sendScheduledNotifications = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Query reminders that are due now (within last 5 minutes)
    const remindersSnapshot = await admin
      .firestore()
      .collection("reminders")
      .where("dueEpoch", ">=", fiveMinutesAgo)
      .where("dueEpoch", "<=", now)
      .where("status", "!=", "completed")
      .where("notificationSent", "==", false)
      .get();

    const promises = [];

    remindersSnapshot.forEach((doc) => {
      const reminder = doc.data();

      // Get user's FCM token
      admin
        .firestore()
        .collection("fcmTokens")
        .doc(reminder.userId)
        .get()
        .then((tokenDoc) => {
          if (!tokenDoc.exists) {
            console.log("No FCM token for user:", reminder.userId);
            return;
          }

          const { token } = tokenDoc.data();

          // Send notification
          const message = {
            notification: {
              title: reminder.title || "Follow-up Reminder",
              body: reminder.note || "You have a follow-up due now",
            },
            data: {
              reminderId: doc.id,
              dueTime: reminder.dueISO,
            },
            token: token,
          };

          promises.push(
            admin
              .messaging()
              .send(message)
              .then(() => {
                // Mark notification as sent
                return doc.ref.update({ notificationSent: true });
              })
              .catch((error) => {
                console.error("Error sending notification:", error);
              })
          );
        });
    });

    await Promise.all(promises);
    console.log(`Sent ${promises.length} notifications`);
  });

// Trigger when a new reminder is created
exports.onReminderCreated = functions.firestore
  .document("reminders/{reminderId}")
  .onCreate(async (snap, context) => {
    const reminder = snap.data();

    // Initialize notificationSent field
    await snap.ref.update({ notificationSent: false });
  });
```

## Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

## Step 6: Update Firestore Security Rules

Add `notificationSent` field permission:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null;
    }

    match /fcmTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Alternative: Simpler Browser-Only Solution

If you don't want to set up Cloud Functions, you can use the browser-based notification system that's already implemented. It will show notifications when:
- The browser is open
- User has granted notification permission
- The reminder's due time is reached

**Limitations:**
- Only works when browser is open
- Notifications stop when tab is closed
- No notifications if computer is off

## Testing FCM

Once everything is set up:

1. Enable notifications in Settings
2. Check browser console for "FCM Token: ..."
3. Create a reminder due in 2 minutes
4. You should receive a notification at the due time

## Troubleshooting

- **"messaging is not defined"**: VAPID key not configured
- **"Service worker registration failed"**: Check `public/firebase-messaging-sw.js` exists
- **No notifications**: Check Cloud Function logs in Firebase Console
- **"Billing account required"**: Upgrade to Blaze plan for Cloud Functions
