import React, { useState } from "react";
import "./CreateEvent.css";
import { createEvent } from "../../firebase/events";
import { auth } from "../../firebase/firebaseConfig";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Workshop",
    type: "Offline",
    venue: "",
    startDate: "",
    endDate: "",
    organizer: "",
    contact: "",
    registrationLink: "",
    description: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create an event.");
      setLoading(false);
      return;
    }

    try {
      const eventToSave = { ...formData, createdBy: user.uid, createdAt: new Date() };
      const result = await createEvent(eventToSave);
      if (result.success) {
        alert("🎉 Event created successfully!");
        window.location.href = "/my-events";
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="create-event-page">
      <div className="container">
        {/* ---------------- MAIN CONTENT ---------------- */}
        <main className="main-content">
          <h2>Create New Event</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Event Title</label>
              <input type="text" name="title" placeholder="Enter event name" required onChange={handleChange} />
            </div>

            <div>
              <label>Event Image URL</label>
              <input type="url" name="imageUrl" placeholder="Paste Google Drive image link" onChange={handleChange} />
            </div>

            <div>
              <label>Event Category</label>
              <select name="category" onChange={handleChange}>
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Cultural</option>
                <option>Sports</option>
              </select>
            </div>

            <div>
              <label>Event Type</label>
              <select name="type" onChange={handleChange}>
                <option>Offline</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div>
              <label>Venue</label>
              <input type="text" name="venue" placeholder="Enter location or room number" onChange={handleChange} />
            </div>

            <div>
              <label>Start Date & Time</label>
              <input type="datetime-local" name="startDate" onChange={handleChange} />
            </div>

            <div>
              <label>End Date & Time</label>
              <input type="datetime-local" name="endDate" onChange={handleChange} />
            </div>

            <div>
              <label>Organizer Name</label>
              <input type="text" name="organizer" placeholder="Department or Club name" onChange={handleChange} />
            </div>

            <div>
              <label>Contact</label>
              <input type="text" name="contact" placeholder="Phone number or email" onChange={handleChange} />
            </div>

            <div>
              <label>Registration Link</label>
              <input type="url" name="registrationLink" placeholder="Paste registration form link" onChange={handleChange} />
            </div>

            <textarea name="description" placeholder="Enter detailed event description..." onChange={handleChange} />

            <div className="submit-btn">
              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Event"}
              </button>
            </div>
          </form>
        </main>

        {/* ---------------- RIGHT SIDEBAR ---------------- */}
        <aside className="right-sidebar">
          <h3>
            <span className="material-icons">tips_and_updates</span> Tips & Checklist
          </h3>

          <p>✅ Provide clear and engaging event descriptions.</p>
          <p>📅 Set correct date and time.</p>
          <p>📢 Share your event after posting!</p>
          <p>🎯 Mention target audience (e.g., CS students, all departments).</p>
          <p>🏷️ Add organizer name and contact for queries.</p>
          <p>🔗 Double-check registration link is working.</p>
          <p>🖼️ Use a clear event image banner.</p>
          <p>⚡ Keep title short and catchy.</p>
          <p>📝 Proofread description for spelling mistakes.</p>
          <p>📌 Include tags or categories for better search.</p>
          <p>🕒 Ensure start/end time is correct and consistent.</p>

          <hr />

          <h4>Quick Checklist</h4>
          <ul className="tips-list">
            <li>Title clear & concise</li>
            <li>Start & End date/time correct</li>
            <li>Venue / online link correct</li>
            <li>Description detailed & 3–4 lines minimum</li>
            <li>Proofread spelling & dates</li>
            <li>Registration link working</li>
            <li>Image included & clear</li>
            <li>Target audience specified</li>
          </ul>
        </aside>
      </div>

      <footer>
        © 2025 Fatima Jinnah Women University | EventHub Management Portal
      </footer>
    </div>
  );
};

export default CreateEvent;
