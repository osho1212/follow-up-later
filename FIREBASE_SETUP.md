# Firebase Setup Guide

This guide will help you set up Firebase for the Follow Up Later app, enabling user authentication and data persistence.

## Prerequisites

- A Google account
- Node.js installed on your machine

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "follow-up-later")
4. Accept the terms and click "Continue"
5. (Optional) Enable Google Analytics
6. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the web icon (`</>`) to add a web app
2. Enter an app nickname (e.g., "Follow Up Later Web")
3. **Do NOT** check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this later)
6. Click "Continue to console"

## Step 3: Enable Authentication

1. In the Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on the "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
5. Enable **Google** (optional but recommended):
   - Click on "Google"
   - Toggle "Enable" to ON
   - Select a support email
   - Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in **test mode**" (for development)
   - Note: For production, use production mode with proper security rules
4. Choose a Firestore location (pick one closest to your users)
5. Click "Enable"

## Step 5: Configure Security Rules

1. In Firestore Database, click on the "Rules" tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reminders collection - users can only access their own data
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // User settings collection - users can only access their own settings
    match /userSettings/{settingId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click "Publish"

## Step 6: Add Firebase Config to Your App

1. Create a `.env` file in the root of your project:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

3. Replace each value with the corresponding value from your Firebase config object (Step 2)

## Step 7: Run the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local URL (usually `http://localhost:5173`)

## Step 8: Test the Integration

1. You should see the authentication screen
2. Try signing up with email and password
3. Try signing in with Google (if enabled)
4. After authentication, you should see the app
5. Create some reminders - they will be saved to Firestore
6. Log out and log back in - your reminders should persist

## Firestore Data Structure

### Reminders Collection

```javascript
{
  id: "auto-generated",
  userId: "user-id",
  title: "Reminder title",
  note: "Reminder notes",
  dueLabel: "Today · 5:00 PM",
  dueISO: "2024-01-01T17:00:00.000Z",
  dueEpoch: 1704124800000,
  status: "today", // "today", "overdue", "upcoming", "completed"
  mediaType: "text", // "text", "link", "file", "image", "voice"
  source: "manual", // "manual", "share"
  countdown: "In 2h 14m",
  attachments: [],
  activity: [],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### User Settings Collection

```javascript
{
  id: "auto-generated",
  userId: "user-id",
  defaultDueTime: "17:00",
  snoozePresets: [
    { id: "preset-1h", label: "+1h", minutes: 60 },
    { id: "preset-3h", label: "+3h", minutes: 180 }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Troubleshooting

### Issue: "Firebase: Error (auth/popup-blocked)"
- **Solution**: Allow popups in your browser for Google Sign-In

### Issue: "Missing or insufficient permissions"
- **Solution**: Check your Firestore security rules (Step 5)

### Issue: Environment variables not loading
- **Solution**: Make sure your `.env` file is in the root directory and restart the dev server

### Issue: "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Double-check your API key in the `.env` file

## Production Deployment

When deploying to production:

1. Update Firestore security rules to production mode
2. Add your production domain to Firebase Authentication's authorized domains
3. Set up environment variables in your hosting platform
4. Enable Firebase App Check for additional security

## Support

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
