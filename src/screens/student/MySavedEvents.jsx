// src/screens/student/MySavedEvents.jsx

import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaBookmark } from "react-icons/fa";

export default function MySavedEvents() {
  const [savedEvents, setSavedEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [likedEventIds, setLikedEventIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const navigate = useNavigate();

  const likesUnsubsRef = useRef({});

  /* -----------------------------
     AUTH + LISTEN TO SAVED EVENTS + LIKES
  ----------------------------- */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setSavedEvents([]);
        setLikedEventIds(new Set());
        return;
      }

      const savedRef = collection(db, "users", currentUser.uid, "savedEvents");
      const unsubSaved = onSnapshot(savedRef, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSavedEvents(list);
      });

      const likesRef = collection(db, "users", currentUser.uid, "likes");
      const unsubLikes = onSnapshot(likesRef, (snapshot) => {
        setLikedEventIds(new Set(snapshot.docs.map((d) => d.id)));
      });

      return () => {
        unsubSaved();
        unsubLikes();
      };
    });

    return () => unsubAuth();
  }, []);

  /* -----------------------------
     LISTEN TO LIKE COUNTS PER EVENT
  ----------------------------- */
  useEffect(() => {
    Object.values(likesUnsubsRef.current).forEach((unsub) => unsub && unsub());
    likesUnsubsRef.current = {};

    savedEvents.forEach((event) => {
      const likesCol = collection(db, "events", event.id, "likes");
      const unsub = onSnapshot(likesCol, (snap) => {
        setLikeCounts((prev) => ({
          ...prev,
          [event.id]: snap.size,
        }));
      });

      likesUnsubsRef.current[event.id] = unsub;
    });

    return () => {
      Object.values(likesUnsubsRef.current).forEach((unsub) => unsub && unsub());
    };
  }, [savedEvents]);

  /* -----------------------------
     LIKE / UNLIKE EVENT
  ----------------------------- */
  const toggleLike = async (event, e) => {
    e.stopPropagation();
    if (!user) return alert("Please login first.");

    const eventLikeRef = doc(db, "events", event.id, "likes", user.uid);
    const userLikeRef = doc(db, "users", user.uid, "likes", event.id);

    try {
      if (likedEventIds.has(event.id)) {
        // Unlike
        await deleteDoc(eventLikeRef);
        await deleteDoc(userLikeRef);
      } else {
        // Like
        await setDoc(eventLikeRef, { likedAt: Date.now() });
        await setDoc(userLikeRef, { likedAt: Date.now() });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Something went wrong while liking the event.");
    }
  };

  /* -----------------------------
     UNSAVE EVENT
  ----------------------------- */
  const unsaveEvent = async (eventId, e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "savedEvents", eventId));
      setSavedEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err) {
      console.error("Error unsaving event:", err);
      alert("Failed to remove event from saved list.");
    }
  };

  /* -----------------------------
     RENDER UI
  ----------------------------- */
  return (
    <div className="layout">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar-left">
        <ul>
          <li><Link to="/events">📅 All Events</Link></li>
          <li><Link to="/mysavedevents">🔖 My Saved Events</Link></li>
          <li><Link to="/profile">👤 Profile</Link></li>
        </ul>
      </aside>

      {/* MAIN FEED */}
      <main className="feed">
        <h2>My Saved Events</h2>

        {savedEvents.length === 0 && (
          <p className="empty-message">You have not saved any events.</p>
        )}

        {savedEvents.map((event) => (
          <div
            className="post-card"
            key={event.id}
            onClick={() => navigate(`/event/${event.id}`)}
          >
            {/* HEADER */}
            <div className="post-header">
              <div className="post-avatar">{event.title?.charAt(0)?.toUpperCase()}</div>
              <div>
                <h3 className="post-title">{event.title}</h3>
                <div className="post-meta">
                  {event.date && <span>📅 {event.date}</span>}
                  {event.location && <span> · 📍 {event.location}</span>}
                </div>
              </div>
            </div>

            {/* IMAGE */}
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="post-image" />
            )}

            {/* ACTIONS */}
            <div className="action-icons">
              {/* LIKE */}
              <button
                className={`action-icon ${likedEventIds.has(event.id) ? "liked" : ""}`}
                onClick={(e) => toggleLike(event, e)}
              >
                {likedEventIds.has(event.id) ? <FaHeart /> : <FaRegHeart />}
                <span className="like-count">{likeCounts[event.id] || 0}</span>
              </button>

              {/* UNSAVE */}
              <button
                className="action-icon saved"
                onClick={(e) => unsaveEvent(event.id, e)}
              >
                <FaBookmark />
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="post-body">
              {(event.description || "").length > 200
                ? event.description.slice(0, 200) + "..."
                : event.description}
            </div>
          </div>
        ))}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar-right">
        <div className="right-card">🔥 Saved for later</div>
      </aside>
    </div>
  );
}
