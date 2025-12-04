// src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the current path (without query/hash)
  const activePath = location.pathname;

  // Logout handler
  const handleLogout = () => {
    // clear auth, add your logic here
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">STDE Platform</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link
          to="/ai-evaluate"
          className={`nav-item${activePath === "/ai-evaluate" ? " active" : ""}`}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor">
            <path d="M9.663 17h4.673M12 3v1M6.343 5.343l-.707-.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>AI Evaluate</span>
        </Link>

        <Link
          to="/classroom"
          className={`nav-item${activePath === "/classroom" ? " active" : ""}`}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor">
            <circle cx="12" cy="7" r="4" strokeWidth="2" />
            <path d="M5 21a7 7 0 0114 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Classroom</span>
        </Link>

        <Link
          to="/profile"
          className={`nav-item${activePath === "/profile" ? " active" : ""}`}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Profile</span>
        </Link>

        <button className="nav-item" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
