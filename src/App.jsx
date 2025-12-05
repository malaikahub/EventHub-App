import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "./components";

// AUTH SCREENS
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";

// STUDENT SCREENS
import MyRegistrations from "./screens/student/MyRegistrations";
import MySavedEvents from "./screens/student/MySavedEvents";
import Profile from "./screens/student/Profile";
import Settings from "./screens/student/Settings";

// MANAGER SCREENS
import CreateEvent from "./screens/manager/CreateEvent";
import Analytics from "./screens/manager/Analytics";
import MyCreatedEvents from "./screens/manager/MyCreatedEvents";

// COMMON SCREENS
import AllEvents from "./screens/common/AllEvents";
import EventDescription from "./screens/common/EventDescription";

// FIREBASE
import { auth, db } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, allowed, user, role }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return children;
};

const StudentRoute = ({ children, user, role }) => (
  <ProtectedRoute allowed={["student"]} user={user} role={role}>{children}</ProtectedRoute>
);

const ManagerRoute = ({ children, user, role }) => (
  <ProtectedRoute allowed={["manager"]} user={user} role={role}>{children}</ProtectedRoute>
);

const BothRoute = ({ children, user, role }) => (
  <ProtectedRoute allowed={["student", "manager"]} user={user} role={role}>{children}</ProtectedRoute>
);

const AuthRedirect = ({ children, user, role }) => {
  if (user && role === "student") return <Navigate to="/events" replace />;
  if (user && role === "manager") return <Navigate to="/create-event" replace />;
  return children;
};

function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔍 GLOBAL SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        let fetchedRole = docSnap.exists() ? docSnap.data().role : null;

        if (currentUser.email === "manager@fjwu.edu.pk") {
          fetchedRole = "manager";
        }

        setRole(fetchedRole);
        localStorage.setItem("userRole", fetchedRole);
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem("userRole");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", display: "flex", 
        justifyContent: "center", alignItems: "center", 
        fontSize: 24, fontWeight: 700 
      }}>
        Loading...
      </div>
    );
  }

  const defaultRedirect = () => {
    if (role === "manager") return "/create-event";
    if (role === "student") return "/events";
    return "/login";
  };

  return (
    <>
      {/* 🔍 PASS SEARCH STATE INTO NAVBAR */}
      {!hideNavbar && <Navbar setSearchQuery={setSearchQuery} />}

      <Routes>
        <Route path="/" element={<Navigate to={defaultRedirect()} replace />} />

        <Route path="/login" element={<AuthRedirect user={user} role={role}><Login /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect user={user} role={role}><Register /></AuthRedirect>} />

        {/* 🔍 PASS SEARCH QUERY TO AllEvents */}
        <Route
          path="/events"
          element={<BothRoute user={user} role={role}><AllEvents searchQuery={searchQuery} /></BothRoute>}
        />

        <Route path="/event/:id" element={<BothRoute user={user} role={role}><EventDescription /></BothRoute>} />

        {/* ❌ REMOVE SEARCH PAGE – now searching is in navbar */}
        {/* <Route path="/search" element={<BothRoute><Search /></BothRoute>} /> */}

        <Route path="/my-registrations" element={<StudentRoute user={user} role={role}><MyRegistrations /></StudentRoute>} />
        <Route path="/my-saved-events" element={<StudentRoute user={user} role={role}><MySavedEvents /></StudentRoute>} />
        <Route path="/profile" element={<StudentRoute user={user} role={role}><Profile /></StudentRoute>} />
        <Route path="/settings" element={<StudentRoute user={user} role={role}><Settings /></StudentRoute>} />

        <Route path="/create-event" element={<ManagerRoute user={user} role={role}><CreateEvent /></ManagerRoute>} />
        <Route path="/analytics" element={<ManagerRoute user={user} role={role}><Analytics /></ManagerRoute>} />
        <Route path="/my-created-events" element={<ManagerRoute user={user} role={role}><MyCreatedEvents /></ManagerRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
