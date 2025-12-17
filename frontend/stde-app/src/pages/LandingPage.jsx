import { useNavigate } from 'react-router-dom';
import RoleCard from '../components/RoleCard';
import '../css/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    if (role === 'student') {
      navigate('/login/student');
    } else if (role === 'teacher') {
      navigate('/login/teacher');
    }
  };

  const studentFeatures = [
    'Automated test case evaluation',
    'Comprehensive quality metrics',
    'Instant feedback and recommendations'
  ];

  const teacherFeatures = [
    'AI grading insights',
    'Automated scoring',
    'Classroom integration'
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-background">
        <div className="bg-gradient"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <div className="landing-content">
        {/* Header */}
        <div className="landing-header">
          <div className="landing-logo">
            <div className="logo-icon">S</div>
          </div>
          <h1 className="landing-title">STDE Platform</h1>
          <p className="landing-subtitle">AI-Powered Documentation Analysis</p>
          <p className="landing-hint">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="landing-cards">
          <RoleCard
            icon={
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            }
            title="Student"
            description="Access your courses, submit assignments, and track your progress"
            features={studentFeatures}
            buttonText="Continue as Student"
            onClick={() => handleSelectRole('student')}
            delay={200}
          />

          <RoleCard
            icon={
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            title="Teacher"
            description="Manage classes, evaluate documents, and improve outcomes"
            features={teacherFeatures}
            buttonText="Continue as Teacher"
            onClick={() => handleSelectRole('teacher')}
            delay={400}
          />
        </div>

        {/* Footer */}
        <p className="landing-footer">Capstone Project 2025</p>
      </div>
    </div>
  );
}
