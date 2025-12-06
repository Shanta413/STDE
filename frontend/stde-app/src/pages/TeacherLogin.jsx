import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../css/TeacherLogin.css";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await authService.login({ email, password });
    console.log("Login successful:", response);

    const user = response.user;

    // Validate strictly for TEACHER
    if (user.userType !== "TEACHER") {
      setError("This login is only for teachers. Please use the student login page.");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", response.token);

    navigate("/teacher/classroom");

  } catch (err) {
    console.error("Login error:", err);
    setError("Invalid email or password. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="background-pattern">
          <div className="pattern-box box-1"></div>
          <div className="pattern-box box-2"></div>
          <div className="pattern-box box-3"></div>
        </div>

        <div className="content">
          <h1 className="title">AI-Powered Documentation Analysis</h1>
          <p className="subtitle">
            Evaluate documents with AI, streamline grading, and improve outcomes.
          </p>

          <div className="features">
            <div className="feature-item"><div className="checkmark">✔</div>AI grading insights</div>
            <div className="feature-item"><div className="checkmark">✔</div>Automated scoring</div>
            <div className="feature-item"><div className="checkmark">✔</div>Classroom integration</div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-container">
          <div className="logo">
            <div className="logo-icon">S</div>
            <span className="logo-text">STDE</span>
          </div>

          <div className="welcome">
            <h2>Teacher Login</h2>
            <p>
              Don't have an account?{" "}
              <Link to="/register/teacher">Sign up</Link>
            </p>

            <p className="role-switch">
              Are you a student?{" "}
              <Link to="/login/student">Login here</Link>
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Teacher email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="footer">
            <p>Capstone Project 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
