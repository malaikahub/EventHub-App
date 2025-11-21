// src/screens/auth/Register.jsx

import React, { useState } from "react";
import "./Register.css";
import { registerUser } from "../../Firebase/auth";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role.");
      return;
    }

    const result = await registerUser(name, email, password, role);

    if (result.success) {
      alert("Registration Successful!");
      navigate("/login");
    } else {
      const err = result.error;

      if (err.includes("auth/email-already-in-use")) {
        setError("This email is already registered.");
      } else if (err.includes("auth/weak-password")) {
        setError("Password must be at least 6 characters.");
      } else if (err.includes("auth/invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(err);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="register-card">

        {/* Left Section */}
        <div className="register-image">
          <h2>Join EventHub</h2>
          <p>Create your account to start creating & managing events</p>
        </div>

        {/* Right Section */}
        <div className="register-form">
          <h2 className="form-title">Register</h2>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="student">Student - CR</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="btn-register">
              Register Now
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
