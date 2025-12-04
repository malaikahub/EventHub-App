// src/firebase/events.js

import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

/* -------------------------------------------------------
   CREATE EVENT (Firestore Only)
------------------------------------------------------- */
export const createEvent = async (eventData) => {
  try {
    if (!eventData || !eventData.createdBy) {
      return { success: false, error: "Missing required field: createdBy" };
    }

    const ref = await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: ref.id,
    };
  } catch (error) {
    return {
      success: false,
      error: cleanError(error),
    };
  }
};

/* -------------------------------------------------------
   GET ALL EVENTS
------------------------------------------------------- */
export const getAllEvents = async () => {
  try {
    const snapshot = await getDocs(collection(db, "events"));

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, events };
  } catch (error) {
    return {
      success: false,
      error: cleanError(error),
    };
  }
};

/* -------------------------------------------------------
   GET EVENTS CREATED BY LOGGED-IN USER
------------------------------------------------------- */
export const getMyEvents = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID missing." };
    }

    const q = query(collection(db, "events"), where("createdBy", "==", userId));

    const snapshot = await getDocs(q);

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, events };
  } catch (error) {
    return {
      success: false,
      error: cleanError(error),
    };
  }
};

/* -------------------------------------------------------
   CLEAN FIREBASE ERROR MESSAGE
------------------------------------------------------- */
const cleanError = (error) => {
  if (!error?.message) return "Unknown error occurred";
  return error.message.replace("Firebase:", "").trim();
};
