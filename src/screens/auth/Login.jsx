// src/screens/auth/Login.jsx

import React, { useState } from "react";
import "./Login.css";
import { loginUser } from "../../Firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await loginUser(email, password);

    if (result.success) {
      alert("Login Successful!");
      navigate("/my-events");                    // 🔥 fixed navigation path
    } else {
      const err = result.error;

      if (err.includes("auth/invalid-credential")) {
        setError("Incorrect email or password.");
      } else if (err.includes("auth/user-not-found")) {
        setError("No account found with this email.");
      } else if (err.includes("auth/wrong-password")) {
        setError("Incorrect password.");
      } else if (err.includes("auth/invalid-email")) {
        setError("Invalid email format.");
      } else {
        setError(err);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          <div className="login-image">
            <h2>Welcome Back</h2>
            <p>Login to manage and create events</p>
          </div>

          <div className="login-form">
            <h2 className="form-title">Login</h2>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="btn-login">
                Login
              </button>
            </form>

            <p className="register-link">
              Don't have an account? <a href="/register">Register here</a>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
