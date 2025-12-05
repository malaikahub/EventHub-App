import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import "../screens.css";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../../components";

export default function EventDescription() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [interested, setInterested] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const email = currentUser.email || "";
        setUserEmail(email);

        const isManager = email === "manager@fjwu.edu.pk";
        const isStudent =
          email.toLowerCase().endsWith("@fjwu.edu.pk") &&
          email !== "manager@fjwu.edu.pk";

        setAllowed(isManager || isStudent);
      } else {
        setUserEmail(null);
        setAllowed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!allowed) {
      setEvent(null);
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setEvent(docSnap.data());
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, allowed]);

  if (userEmail && !allowed) {
    return (
      <div className="screen-container">
        <h2 className="screen-title">Access Denied</h2>
        <p className="empty-message">
          Only FJWU students or the manager can view this event.
        </p>
        <p className="event-meta">Logged in as: <strong>{userEmail}</strong></p>
      </div>
    );
  }

  if (loading) return <p className="loading">Loading...</p>;
  if (!event) return <p className="empty-message">Event not found.</p>;

  return (
    <Layout role={null}>
      <div className="event-description-page">
        <Link to="/"><button className="back-button">← Back</button></Link>

        <div className="event-description-card">
        <img
          src={
            event.imageUrl?.trim()
              ? event.imageUrl
              : "https://via.placeholder.com/900x350?text=No+Image"
          }
          alt={event.title}
          className="event-description-image"
        />

        <div className="event-description-content">
          <h1 className="event-title">{event.title}</h1>
          {event.subtitle && <p className="event-subtitle">{event.subtitle}</p>}

            <p className="event-description">{event.description}</p>

            <div className="event-extra-info">
            {event.startDate && event.endDate && (
              <p>📅 <strong>Start:</strong> {event.startDate} | <strong>End:</strong> {event.endDate}</p>
            )}
            {event.time && <p>⏰ <strong>Time:</strong> {event.time}</p>}
            {event.location && <p>📍 <strong>Venue:</strong> {event.location}</p>}
            {event.organizer && <p>👤 <strong>Organizer:</strong> {event.organizer}</p>}
          </div>

            {event.registrationLink && (
            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="event-register-button">
              Register Here
            </a>
          )}

          <div className="interest-buttons">
            <span>Interested?</span>
            <div>
              <button
                className={`btn-interest ${interested === "yes" ? "selected" : ""}`}
                onClick={() => setInterested("yes")}
              >Yes</button>

              <button
                className={`btn-interest ${interested === "no" ? "selected" : ""}`}
                onClick={() => setInterested("no")}
              >No</button>
            </div>
          </div>

            <hr className="divider" />
            <div className="social-actions">
            <button className="action-btn" onClick={() => alert("Like stored soon!")}>Like</button>

            <button
              className="action-btn"
              onClick={() =>
                document.getElementById("commentSection").scrollIntoView({ behavior: "smooth" })
              }
            >
              Comment
            </button>

            <button
              className="action-btn"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("🔗 Event Link Copied!");
              }}
            >
              Share
            </button>
          </div>

            <div id="commentSection" className="comments-area">
            <h3>Comments</h3>

            <input
              type="text"
              placeholder="Write a comment..."
              className="comment-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  alert("Comment saved soon!");
                  e.target.value = "";
                }
              }}
            />

            <p className="no-comments">No comments yet.</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
