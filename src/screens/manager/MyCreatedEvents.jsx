import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../screens.css";

export default function MyCreatedEvents() {
  const [events, setEvents] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interested, setInterested] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsManager(user.email === "manager@fjwu.edu.pk");
      } else {
        setUserEmail(null);
        setIsManager(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "events"), where("createdBy", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map(docData => ({
        id: docData.id,
        ...docData.data(),
      }));
      setEvents(eventList);
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      setEvents(events.filter(event => event.id !== id));
    }
  };

  return (
    <div className="screen-container">
      <h2 className="screen-title">My Created Events</h2>
      {userEmail && (
        <p className="event-meta">Logged in as: <strong>{userEmail}</strong></p>
      )}

      {events.length === 0 && <p className="empty-message">No events created yet.</p>}

      <div className="event-grid-3">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <img
              src={event.imageUrl?.trim() ? event.imageUrl : "https://via.placeholder.com/400x200?text=No+Image"}
              alt={event.title}
              className="event-card-image"
            />
            <div className="event-card-content">
              <h3>{event.title}</h3>
              {event.location && <p className="event-meta">📍 {event.location}</p>}
              <p className="event-description-snippet">{event.description?.slice(0, 100)}...</p>

              <div className="event-card-footer">
                <button
                  className="btn-view"
                  onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                >View</button>

                {isManager && (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => { window.location.href = `/edit-event/${event.id}`; }}
                    >Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(event.id)}
                    >Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL VIEW MODAL */}
      {showModal && selectedEvent && (
        <>
          <div className="modal-overlay">
            <div className="modal-content">
              <img
                src={selectedEvent.imageUrl?.trim() ? selectedEvent.imageUrl : "https://via.placeholder.com/900x350?text=No+Image"}
                alt={selectedEvent.title}
                className="event-description-image"
              />

              <h1 className="event-title">{selectedEvent.title}</h1>
              {selectedEvent.subtitle && <p className="event-subtitle">{selectedEvent.subtitle}</p>}
              <p className="event-description">{selectedEvent.description}</p>

              <div className="event-extra-info">
                {selectedEvent.startDate && selectedEvent.endDate && (
                  <p>📅 <strong>Start:</strong> {selectedEvent.startDate} | <strong>End:</strong> {selectedEvent.endDate}</p>
                )}
                {selectedEvent.time && <p>⏰ <strong>Time:</strong> {selectedEvent.time}</p>}
                {selectedEvent.location && <p>📍 <strong>Venue:</strong> {selectedEvent.location}</p>}
                {selectedEvent.organizer && <p>👤 <strong>Organizer:</strong> {selectedEvent.organizer}</p>}
              </div>

              {selectedEvent.registrationLink && (
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-register-button"
                >Register Here</a>
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
                <button className="action-btn" onClick={() => alert("Like stored soon!")}>👍 Like</button>
                <button
                  className="action-btn"
                  onClick={() => document.getElementById("commentSectionModal").scrollIntoView({ behavior: "smooth" })}
                >💬 Comment</button>
                <button
                  className="action-btn"
                  onClick={() => { navigator.clipboard.writeText(window.location.href); alert("🔗 Event Link Copied!"); }}
                >🔗 Share</button>
              </div>

              <div id="commentSectionModal" className="comments-area">
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

          {/* FIXED CLOSE BUTTON */}
          <button
            className="btn-close-fixed"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}
