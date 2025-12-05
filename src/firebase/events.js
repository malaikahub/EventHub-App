// src/firebase/events.js

import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

/* -------------------------------------------------------
   CREATE EVENT
------------------------------------------------------- */
export const createEvent = async (eventData) => {
  try {
    if (!eventData?.createdBy) {
      return { success: false, error: "Missing required field: createdBy" };
    }

    const ref = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: ref.id };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   GET ALL EVENTS
------------------------------------------------------- */
export const getAllEvents = async () => {
  try {
    const snapshot = await getDocs(collection(db, "events"));
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, events };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   GET EVENTS CREATED BY USER
------------------------------------------------------- */
export const getMyEvents = async (userId) => {
  try {
    if (!userId) return { success: false, error: "User ID missing." };

    const q = query(collection(db, "events"), where("createdBy", "==", userId));
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return { success: true, events };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   SAVE EVENT FOR USER
------------------------------------------------------- */
export const saveEventForUser = async (userId, event) => {
  try {
    if (!userId || !event?.id) return { success: false, error: "User ID or Event missing." };

    // Save full event info under user's savedEvents
    await setDoc(doc(db, "users", userId, "savedEvents", event.id), {
      ...event,
      savedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   UNSAVE EVENT FOR USER
------------------------------------------------------- */
export const unsaveEventForUser = async (userId, eventId) => {
  try {
    if (!userId || !eventId) return { success: false, error: "User ID or Event ID missing." };

    await deleteDoc(doc(db, "users", userId, "savedEvents", eventId));
    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   LIKE EVENT
------------------------------------------------------- */
export const likeEvent = async (userId, eventId) => {
  try {
    if (!userId || !eventId) return { success: false, error: "User ID or Event ID missing." };

    await setDoc(doc(db, "events", eventId, "likes", userId), { likedAt: serverTimestamp() });
    await setDoc(doc(db, "users", userId, "likes", eventId), { likedAt: serverTimestamp() });

    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   UNLIKE EVENT
------------------------------------------------------- */
export const unlikeEvent = async (userId, eventId) => {
  try {
    if (!userId || !eventId) return { success: false, error: "User ID or Event ID missing." };

    await deleteDoc(doc(db, "events", eventId, "likes", userId));
    await deleteDoc(doc(db, "users", userId, "likes", eventId));

    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   ADD COMMENT TO EVENT
------------------------------------------------------- */
export const addCommentToEvent = async (userId, userName, eventId, commentText) => {
  try {
    if (!userId || !eventId || !commentText) return { success: false, error: "Missing data." };

    await addDoc(collection(db, "events", eventId, "comments"), {
      userId,
      userName,
      comment: commentText,
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   CLEAN FIREBASE ERROR MESSAGE
------------------------------------------------------- */
const cleanError = (error) => {
  if (!error?.message) return "Unknown error occurred";
  return error.message.replace("Firebase:", "").trim();
};
