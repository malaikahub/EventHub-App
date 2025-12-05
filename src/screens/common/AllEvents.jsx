// src/screens/student/AllEvents.jsx

import React, { useEffect, useRef, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import "../screens.css";
import "./AllEvents.css";
import { Layout } from "../../components";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaRegComment,
  FaShare,
} from "react-icons/fa";

import {
  saveEventForUser,
  unsaveEventForUser,
  likeEvent,
  unlikeEvent,
  addCommentToEvent,
} from "../../firebase/events";

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [savedEventIds, setSavedEventIds] = useState(new Set());
  const [likedEventIds, setLikedEventIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [openShareId, setOpenShareId] = useState(null);
  const [openComments, setOpenComments] = useState(new Set());

  const likesUnsubsRef = useRef({});
  const navigate = useNavigate();

  /* -----------------------------
     AUTH + REAL-TIME USER DATA
  ----------------------------- */
  useEffect(() => {
    let unsubSaved = () => {};
    let unsubLike = () => {};

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setSavedEventIds(new Set());
        setLikedEventIds(new Set());
        return;
      }

      const email = currentUser.email || "";
      setRole(email === "manager@fjwu.edu.pk" ? "manager" : "student");

      const savedRef = collection(db, "users", currentUser.uid, "savedEvents");
      unsubSaved = onSnapshot(savedRef, (snap) => {
        const ids = snap.docs.map((d) => d.id);
        setSavedEventIds(new Set(ids));
      });

      const likesRef = collection(db, "users", currentUser.uid, "likes");
      unsubLike = onSnapshot(likesRef, (snap) => {
        const ids = snap.docs.map((d) => d.id);
        setLikedEventIds(new Set(ids));
      });
    });

    return () => {
      unsubAuth();
      unsubSaved();
      unsubLike();
    };
  }, []);

  /* -----------------------------
     FETCH EVENTS + REAL-TIME LIKE COUNTS
  ----------------------------- */
  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "events"));
        if (cancelled) return;

        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEvents(list);

        // Clean previous like listeners
        Object.values(likesUnsubsRef.current).forEach((un) => un && un());
        likesUnsubsRef.current = {};

        // Set new like listeners
        list.forEach((ev) => {
          const likesCol = collection(db, "events", ev.id, "likes");
          const unsub = onSnapshot(likesCol, (snap) => {
            setLikeCounts((prev) => ({
              ...prev,
              [ev.id]: snap.size,
            }));
          });
          likesUnsubsRef.current[ev.id] = unsub;
        });
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      cancelled = true;
      Object.values(likesUnsubsRef.current).forEach((un) => un && un());
    };
  }, []);

  /* -----------------------------
     TOGGLE SAVE EVENT
  ----------------------------- */
  const toggleSave = async (event, e) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to save events.");

    const newSaved = new Set(savedEventIds);

    if (savedEventIds.has(event.id)) {
      const res = await unsaveEventForUser(user.uid, event.id);
      if (!res.success) return alert("Failed to unsave: " + res.error);
      newSaved.delete(event.id);
    } else {
      const res = await saveEventForUser(user.uid, event);
      if (!res.success) return alert("Failed to save: " + res.error);
      newSaved.add(event.id);
    }

    setSavedEventIds(newSaved);
  };

  /* -----------------------------
     TOGGLE LIKE EVENT
  ----------------------------- */
  const toggleLike = async (eventId, e) => {
    e.stopPropagation();
    if (!user) return alert("Please login to like events.");

    if (likedEventIds.has(eventId)) {
      const res = await unlikeEvent(user.uid, eventId);
      if (!res.success) return alert(res.error);
    } else {
      const res = await likeEvent(user.uid, eventId);
      if (!res.success) return alert(res.error);
    }
  };

  /* -----------------------------
     TOGGLE COMMENTS
  ----------------------------- */
  const toggleComments = (id, e) => {
    e?.stopPropagation();
    setOpenComments((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  /* -----------------------------
     SHARE PANEL
  ----------------------------- */
  const toggleShare = (e, id) => {
    e.stopPropagation();
    setOpenShareId(openShareId === id ? null : id);
  };

  const shareButtons = (event) => {
    const url = `${window.location.origin}/event/${event.id}`;
    return (
      <div className="share-buttons">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(url);
            alert("Link copied!");
          }}
        >
          Copy Link
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `mailto:?subject=${event.title}&body=${url}`;
          }}
        >
          Email
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `https://wa.me/?text=${encodeURIComponent(url)}`,
              "_blank"
            );
          }}
        >
          WhatsApp
        </button>
      </div>
    );
  };

  if (loading) return <p className="loading">Loading events...</p>;

  /* -----------------------------
     RENDER EVENTS
  ----------------------------- */
  return (
    <Layout role={role}>
      {events.map((event) => (
        <div
          key={event.id}
          className="post-card"
          onClick={() => navigate(`/event/${event.id}`)}
        >
          {/* HEADER */}
          <div className="post-header">
            <div className="post-avatar">
              {event.title?.charAt(0)?.toUpperCase()}
            </div>
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

          {/* ACTION ICONS */}
          <div className="action-icons">
            {/* LIKE */}
            <button
              className={`action-icon ${likedEventIds.has(event.id) ? "liked" : ""}`}
              onClick={(e) => toggleLike(event.id, e)}
            >
              {likedEventIds.has(event.id) ? <FaHeart /> : <FaRegHeart />}
              <span className="like-count">{likeCounts[event.id] || 0}</span>
            </button>

            {/* COMMENT */}
            <button
              className="action-icon"
              onClick={(e) => toggleComments(event.id, e)}
            >
              <FaRegComment />
            </button>

            {/* SHARE */}
            <button className="action-icon" onClick={(e) => toggleShare(e, event.id)}>
              <FaShare />
            </button>

            {openShareId === event.id && (
              <div className="share-panel" onClick={(e) => e.stopPropagation()}>
                {shareButtons(event)}
              </div>
            )}

            {/* SAVE */}
            <button
              className={`action-icon ${savedEventIds.has(event.id) ? "saved" : ""}`}
              onClick={(e) => toggleSave(event, e)}
            >
              {savedEventIds.has(event.id) ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </div>

          {/* TITLE + DESCRIPTION */}
          <Link to={`/event/${event.id}`} className="post-link">
            <h3 className="post-title under">{event.title}</h3>
            <div className="post-body">
              {event.description?.length > 300
                ? event.description.slice(0, 300) + "..."
                : event.description}
            </div>
          </Link>

          {/* COMMENTS SECTION */}
          {openComments.has(event.id) && <CommentSection eventId={event.id} user={user} />}
        </div>
      ))}
    </Layout>
  );
}

/* -----------------------------
   COMMENT SECTION
----------------------------- */
function CommentSection({ eventId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "events", eventId, "comments"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [eventId]);

  const submitComment = async () => {
    if (!user) return alert("Please login to comment.");
    if (!newComment.trim()) return;

    const res = await addCommentToEvent(
      user.uid,
      user.displayName || user.email,
      eventId,
      newComment
    );

    if (!res.success) alert(res.error);
    else setNewComment("");
  };

  return (
    <div className="comment-section" onClick={(e) => e.stopPropagation()}>
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <strong>{c.userName}: </strong>
          {c.comment}
        </div>
      ))}

      <div className="comment-input">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={submitComment}>Send</button>
      </div>
    </div>
  );
}
