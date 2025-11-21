// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --------------------------------------------
// Firebase Config (NO STORAGE REQUIRED)
// --------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCA5mdpHqQJS0G1gZgrE388EbhPhbY3pIE",
  authDomain: "event-ui-9f0a5.firebaseapp.com",
  projectId: "event-ui-9f0a5",
  storageBucket: "event-ui-9f0a5.appspot.com", // Firebase adds this automatically, ignore it
  messagingSenderId: "676418503838",
  appId: "1:676418503838:web:c05e3bf4b5896aa22aa78f",
  measurementId: "G-MHT6LSRF1C",
};

// --------------------------------------------
// Initialize Firebase
// --------------------------------------------
const app = initializeApp(firebaseConfig);

// --------------------------------------------
// Export only Auth + Firestore
// --------------------------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
