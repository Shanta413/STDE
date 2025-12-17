import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';
import authService from '../services/authService';
import '../css/AuthForms.css';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');

  const features = [
    'AI grading insights',
    'Automated scoring',
    'Classroom integration'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const user = response.user;

      if (user.userType !== 'TEACHER') {
        setError('Access denied. This login is for teachers only. Please use the student login page.');
        authService.logout();
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);

      navigate('/teacher/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/api/oauth2/login/teacher';
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <AuthLayout
      title="AI-Powered Documentation Analysis"
      subtitle="Evaluate documents with AI, streamline grading, and improve outcomes."
      features={features}
    >
      <div className="auth-form-wrapper">
        {/* Logo */}
        <div className="auth-logo animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="auth-logo-icon">S</div>
          <span className="auth-logo-text">STDE</span>
        </div>

        {/* Header */}
        <div className="auth-header animate-slide-in" style={{ animationDelay: '200ms' }}>
          <h2 className="auth-form-title">Teacher Login</h2>
          <p className="auth-form-subtitle">
            Don't have an account?{' '}
            <Link to="/register/teacher" className="auth-link">Sign up</Link>
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="auth-error animate-fade-in">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            placeholder="Teacher email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="animate-slide-in"
            style={{ animationDelay: '300ms' }}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            showForgotPassword
            onForgotPassword={handleForgotPassword}
            className="animate-slide-in"
            style={{ animationDelay: '400ms' }}
          />

          <div className="animate-slide-in" style={{ animationDelay: '500ms' }}>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="auth-divider animate-slide-in" style={{ animationDelay: '600ms' }}>
            <span>OR</span>
          </div>

          <SocialButton
            provider="google"
            onClick={handleGoogleLogin}
            disabled={loading}
            delay={700}
          />
        </form>

        {/* Switch Role */}
        <p className="auth-switch-role animate-slide-in" style={{ animationDelay: '800ms' }}>
          Are you a student?{' '}
          <Link to="/login/student" className="auth-link">Login here</Link>
        </p>

        {/* Footer */}
        <p className="auth-footer animate-slide-in" style={{ animationDelay: '900ms' }}>Capstone Project 2025</p>
      </div>
    </AuthLayout>
  );
}
