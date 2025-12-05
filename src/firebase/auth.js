// src/firebase/auth.js
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* -------------------------------------------------------
   REGISTER USER (Auth + Firestore Profile)
   Allowed: Students only
   Required fields: name, email, password, department,
                    phone, dob, country, city, username
------------------------------------------------------- */
export const registerUser = async (
  name,
  email,
  password,
  department,
  phone,
  dob,
  country,
  city,
  username
) => {
  try {
    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !phone ||
      !dob ||
      !country ||
      !city ||
      !username
    ) {
      return { success: false, error: "All fields are required." };
    }

    let role = "student"; // always student if registering

    // ❌ Manager cannot register
    if (email === "manager@fjwu.edu.pk") {
      return {
        success: false,
        error: "Manager account cannot be created here.",
      };
    }

    // ✅ Student email validation
    if (!email.endsWith("fjwu.edu.pk")) {
      return {
        success: false,
        error:
          "Email must end with fjwu.edu.pk (e.g., username@cs.fjwu.edu.pk).",
      };
    }

    // Firebase authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Data saved in Firestore
    const profile = {
      uid: user.uid,
      name,
      email,
      username,
      phone,
      dob,
      country,
      city,
      department,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), profile);

    // Store role in local storage
    localStorage.setItem("userRole", role);

    return { success: true, user, data: profile };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   LOGIN USER — auto assign roles
   Students: student
   manager@fjwu.edu.pk → manager
------------------------------------------------------- */
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required." };
    }

    // Firebase login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch profile from Firestore
    const profileRef = doc(db, "users", user.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      return { success: false, error: "User profile not found." };
    }

    let profileData = profileSnapshot.data();

    // 🚨 Override role for manager login
    if (email === "manager@fjwu.edu.pk") {
      profileData.role = "manager";
    }

    localStorage.setItem("userRole", profileData.role);

    return { success: true, user, data: profileData };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   LOGOUT USER
------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("userRole");
    return { success: true };
  } catch (error) {
    return { success: false, error: mapAuthError(error) };
  }
};

/* -------------------------------------------------------
   FRIENDLY FIREBASE ERROR MESSAGES
------------------------------------------------------- */
const mapAuthError = (error) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return error.message?.replace("Firebase:", "").trim() || "Unknown error.";
  }
};
