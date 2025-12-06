import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../css/Login.css";

export default function Login() {
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
      // Authenticate with backend
      const response = await authService.login({ email, password });

      // Depending on your backend, you might need this:
      // const user = response.user; // if backend returns { user: {...}, token: "..." }
      // If backend returns user object directly, just use "response"

      const user = response.user ? response.user : response; // Handles both structures

      // Allow only students to log in here
      if (user.userType !== "STUDENT") {
        setError("This login is for students only. Please use the correct login page.");
        setLoading(false);
        return;
      }

      // Save user and token to localStorage if needed
      localStorage.setItem("user", JSON.stringify(user));
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Redirect to student dashboard
      navigate("/ai-evaluate");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="background-pattern">
          <div className="pattern-box box-1"></div>
          <div className="pattern-box box-2"></div>
          <div className="pattern-box box-3"></div>
        </div>

        <div className="content">
          <h1 className="title">AI-Powered Documentation Analysis</h1>
          <p className="subtitle">
            Revolutionize your software testing workflow with intelligent
            evaluation and insights powered by advanced AI technology.
          </p>

          <div className="features">
            <div className="feature-item">
              <div className="checkmark">✔</div>
              <p>Automated test case evaluation</p>
            </div>
            <div className="feature-item">
              <div className="checkmark">✔</div>
              <p>Comprehensive quality metrics</p>
            </div>
            <div className="feature-item">
              <div className="checkmark">✔</div>
              <p>Instant feedback and recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="form-container">
          <div className="logo">
            <div className="logo-icon">S</div>
            <span className="logo-text">STDE</span>
          </div>

          <div className="welcome">
            <h2>Student Login</h2>
            <p>
              Don't have an account?{" "}
              <Link to="/register/student">Sign up</Link>
            </p>
            <p className="role-switch">
              Are you a teacher?{" "}
              <Link to="/login/teacher">Login here</Link>
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message"
                style={{
                  backgroundColor: '#fee',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
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
