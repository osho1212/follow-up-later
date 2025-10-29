import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase.js";

const REMINDERS_COLLECTION = "reminders";
const SETTINGS_COLLECTION = "userSettings";

// Create a new reminder
export const createReminder = async (userId, reminderData) => {
  try {
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), {
      ...reminderData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

// Update a reminder
export const updateReminder = async (reminderId, updates) => {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId) => {
  try {
    await deleteDoc(doc(db, REMINDERS_COLLECTION, reminderId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get all reminders for a user
export const getUserReminders = async (userId) => {
  try {
    const q = query(
      collection(db, REMINDERS_COLLECTION),
      where("userId", "==", userId),
      orderBy("dueEpoch", "asc")
    );
    const querySnapshot = await getDocs(q);
    const reminders = [];
    querySnapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() });
    });
    return { reminders, error: null };
  } catch (error) {
    return { reminders: [], error: error.message };
  }
};

// Subscribe to real-time updates for user reminders
export const subscribeToReminders = (userId, callback) => {
  const q = query(
    collection(db, REMINDERS_COLLECTION),
    where("userId", "==", userId),
    orderBy("dueEpoch", "asc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const reminders = [];
      querySnapshot.forEach((doc) => {
        reminders.push({ id: doc.id, ...doc.data() });
      });
      callback(reminders, null);
    },
    (error) => {
      callback([], error.message);
    }
  );
};

// Save user settings
export const saveUserSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    }).catch(async (error) => {
      // If document doesn't exist, create it
      if (error.code === "not-found") {
        await addDoc(collection(db, SETTINGS_COLLECTION), {
          userId,
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        throw error;
      }
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    const q = query(collection(db, SETTINGS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { settings: { id: doc.id, ...doc.data() }, error: null };
    }
    return { settings: null, error: null };
  } catch (error) {
    return { settings: null, error: error.message };
  }
};
