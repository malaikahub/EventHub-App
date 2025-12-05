import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { registerUser } from "../../firebase/auth";

const departments = [
  "Anthropology",
  "Behavioral Sciences",
  "Bioinformatics",
  "Biotechnology",
  "Business Administration",
  "Chemistry",
  "Commerce",
  "Communication and Media Studies",
  "Computer Arts",
  "Computer Science",
  "International Relations",
  "Economics",
  "Education",
  "Electronic Engineering",
  "English",
  "Fine Arts",
  "Gender Studies",
  "Islamic Studies",
  "Law",
  "Mathematical Sciences",
  "Physics",
  "Public Administration",
  "Public Health and Allied Sciences",
  "Sociology",
  "Software Engineering",
  "Urdu",
];

const Register = () => {
  const [role, setRole] = useState(() => localStorage.getItem("loginRole") || "student");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole === "student") navigate("/events", { replace: true });
    if (savedRole === "manager") navigate("/create-event", { replace: true });
  }, [navigate]);

  const isValidFjwuEmail = (email) => email.endsWith("fjwu.edu.pk");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) return setError("Please select a role.");

    // Manager cannot register
    if (role === "manager") return setError("Manager cannot register here. Use Manager Login.");

    if (!isValidFjwuEmail(email)) return setError("Email must end with fjwu.edu.pk");

    if (!department) return setError("Please select your department.");

    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const result = await registerUser(
        name,
        email,
        password,
        department,
        phone,
        dob,
        country,
        city,
        username
      );
      setLoading(false);

      if (result.success) {
        alert("Registration Successful!");
        localStorage.setItem("userRole", "student");
        localStorage.setItem("loginRole", "student");
        navigate("/events", { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong during registration.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="register-card">
          {/* LEFT IMAGE */}
          <div className="register-image">
            <h2>Join EventHub</h2>
            <p>Create your account to explore & participate in events</p>
          </div>

          {/* RIGHT FORM */}
          <div className="register-form">
            <h2 className="form-title">Register</h2>

            {error && <p className="error-message">{error}</p>}

            {/* Role Toggle (Sliding Switch) */}
            <div className="role-toggle">
              <input
                type="radio"
                id="student"
                name="role"
                checked={role === "student"}
                onChange={() => setRole("student")}
              />
              <label htmlFor="student">Student</label>

              <input
                type="radio"
                id="manager"
                name="role"
                checked={role === "manager"}
                onChange={() => setRole("manager")}
              />
              <label htmlFor="manager">Manager</label>

              <div className="slider"></div>
            </div>

            {/* STUDENT FORM */}
            {role === "student" && (
              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Username (unique)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="University Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? "Registering..." : "Register Now"}
                </button>
              </form>
            )}

            {/* MANAGER MESSAGE */}
            {role === "manager" && (
              <div>
                <p className="error-message">
                  Manager account cannot be registered here.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-login"
                >
                  Go to Manager Login
                </button>
              </div>
            )}

            <p className="register-link">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
