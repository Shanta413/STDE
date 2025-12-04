import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../css/Classroom.css';

export default function Classroom() {
  // Example class data; replace with your backend/API data.
  const [classes] = useState([
    {
      id: 1,
      initials: 'CA',
      name: 'Capstone 1 2020',
      instructor: 'Dr. Smith',
      code: 'CS1-2020',
      color: '#2563eb', // blue-600
    },
    {
      id: 2,
      initials: 'CA',
      name: 'Capstone 1 2021',
      instructor: 'Dr. Johnson',
      code: 'CS1-2021',
      color: '#a21caf', // fuchsia-600
    },
  ]);

  return (
    <div className="ai-evaluate-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Pages</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item">Classroom</span>
          </div>
          <h1 className="page-title">Classroom</h1>
        </div>

        <div className="classroom-header">
          <button className="join-class-btn">+ Join Classroom</button>
        </div>

        <div className="section-title" style={{ marginTop: 12 }}>My Classes</div>

        <div className="class-cards-grid">
          {classes.map(cls => (
            <div key={cls.id} className="class-card">
              <div
                className="class-card-banner"
                style={{ background: cls.color }}
              >
                <div className="class-card-initials">{cls.initials}</div>
              </div>
              <div className="class-card-details">
                <div className="class-card-title">{cls.name}</div>
                <div className="class-card-instructor">{cls.instructor}</div>
                <div className="class-card-code">Code: {cls.code}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
