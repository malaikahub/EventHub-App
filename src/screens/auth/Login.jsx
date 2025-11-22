import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../../firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "student") navigate("/events", { replace: true });
    else if (role === "manager") navigate("/create-event", { replace: true });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      setLoading(false);

      if (result.success) {
        const role = result.data.role;
        localStorage.setItem("userRole", role);

        if (role === "student") navigate("/events", { replace: true });
        else if (role === "manager") navigate("/create-event", { replace: true });
        else setError("Invalid role. Contact admin.");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-image">
            <h2>Welcome Back</h2>
            <p>Login to access your event panel</p>
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
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="register-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
