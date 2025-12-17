import { useNavigate } from 'react-router-dom';
import FeatureList from './FeatureList';
import '../css/AuthLayout.css';

export default function AuthLayout({
  children,
  title,
  subtitle,
  features = [],
  onBack,
  showBackButton = true
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel - Branding */}
      <div className="auth-left-panel">
        <div className="auth-background-pattern">
          <div className="pattern-box pattern-box-1"></div>
          <div className="pattern-box pattern-box-2"></div>
          <div className="pattern-box pattern-box-3"></div>
          <div className="pattern-orb pattern-orb-1"></div>
          <div className="pattern-orb pattern-orb-2"></div>
        </div>

        <div className="auth-left-content">
          {showBackButton && (
            <button className="auth-back-button" onClick={handleBack}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          )}

          <div className="auth-branding">
            <h1 className="auth-title animate-fade-in-down">{title}</h1>
            <p className="auth-subtitle animate-fade-in-down" style={{ animationDelay: '200ms' }}>{subtitle}</p>

            {features.length > 0 && (
              <div className="animate-slide-in" style={{ animationDelay: '400ms' }}>
                <FeatureList features={features} variant="dark" delay={500} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
}
