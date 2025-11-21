// src/firebase/auth.js

import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

/* -------------------------------------------------------
   REGISTER USER (Auth + Firestore Profile)
------------------------------------------------------- */
export const registerUser = async (name, email, password, role) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Save user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   LOGIN USER (Auth + Fetch Firestore User Profile)
------------------------------------------------------- */
export const loginUser = async (email, password) => {
  try {
    // Firebase Auth login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Fetch Firestore user data
    const profile = await getDoc(doc(db, "users", user.uid));

    if (!profile.exists()) {
      return { success: false, error: "User profile not found." };
    }

    return {
      success: true,
      user,
      data: profile.data(),
    };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   LOGOUT USER
------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: cleanError(error) };
  }
};

/* -------------------------------------------------------
   CLEAN FIREBASE ERROR MESSAGE
------------------------------------------------------- */
const cleanError = (error) => {
  if (!error.message) return "Unknown error";

  return error.message
    .replace("Firebase:", "")
    .replace("auth/", "")
    .replace(/\(.*\)/, "")
    .trim();
};
