import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // <-- Use the shared sidebar!
import authService from '../services/authService';
import '../css/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage (or API)
    const userData = authService.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="ai-evaluate-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-evaluate-container">
      <Sidebar />

      <div className="main-content">
        <div className="header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Pages</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">Profile</span>
          </div>
          <h1 className="page-title">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-large">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" />
                ) : (
                  <span className="avatar-initials">
                    {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="user-info">
                <h2 className="user-name">{user.firstname} {user.lastname}</h2>
                <p className="user-role">{user.userType}</p>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="profile-body">
            <h3 className="section-title">Account Information</h3>
            
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">First Name</label>
                <div className="info-value">{user.firstname}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Last Name</label>
                <div className="info-value">{user.lastname}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Email Address</label>
                <div className="info-value">{user.email}</div>
              </div>

              <div className="info-item">
                <label className="info-label">Account Type</label>
                <div className="info-value">
                  <span className={`badge ${user.userType === 'STUDENT' ? 'badge-blue' : 'badge-green'}`}>
                    {user.userType}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <label className="info-label">User ID</label>
                <div className="info-value info-value-small">{user.id}</div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="profile-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
