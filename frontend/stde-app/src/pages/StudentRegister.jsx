import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import SocialButton from '../components/SocialButton';
import authService from '../services/authService';
import '../css/AuthForms.css';

export default function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const features = [
    'Automated test case evaluation',
    'Comprehensive quality metrics',
    'Instant feedback and recommendations'
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        familyName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: 'STUDENT'
      });

      navigate('/login/student', {
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setError(err || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:8080/api/oauth2/login/student';
  };

  return (
    <AuthLayout
      title="AI-Powered Documentation Analysis"
      subtitle="Revolutionize your software testing workflow with intelligent evaluation and insights powered by advanced AI technology."
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
          <h2 className="auth-form-title">Create Student Account</h2>
          <p className="auth-form-subtitle">
            Already have an account?{' '}
            <Link to="/login/student" className="auth-link">Sign in</Link>
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="auth-error animate-fade-in">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-row">
            <InputField
              label="First Name"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
              disabled={loading}
              className="animate-slide-in"
              style={{ animationDelay: '300ms' }}
            />
            <InputField
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
              disabled={loading}
              className="animate-slide-in"
              style={{ animationDelay: '350ms' }}
            />
          </div>

          <InputField
            label="Email"
            type="email"
            placeholder="student@university.edu"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            disabled={loading}
            className="animate-slide-in"
            style={{ animationDelay: '400ms' }}
          />

          <InputField
            label="Student ID"
            type="text"
            placeholder="20XX-XXXXX"
            value={formData.studentId}
            onChange={(e) => updateField('studentId', e.target.value)}
            required
            disabled={loading}
            className="animate-slide-in"
            style={{ animationDelay: '450ms' }}
          />

          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            disabled={loading}
            className="animate-slide-in"
            style={{ animationDelay: '500ms' }}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            required
            disabled={loading}
            className="animate-slide-in"
            style={{ animationDelay: '550ms' }}
          />

          <div className="animate-slide-in" style={{ animationDelay: '600ms' }}>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="auth-divider animate-slide-in" style={{ animationDelay: '650ms' }}>
            <span>OR</span>
          </div>

          <SocialButton
            provider="google"
            onClick={handleGoogleSignup}
            disabled={loading}
            text="Sign up with Google"
            delay={700}
          />
        </form>

        {/* Switch Role */}
        <p className="auth-switch-role animate-slide-in" style={{ animationDelay: '800ms' }}>
          Are you a teacher?{' '}
          <Link to="/register/teacher" className="auth-link">Register here</Link>
        </p>

        {/* Footer */}
        <p className="auth-footer animate-slide-in" style={{ animationDelay: '900ms' }}>Capstone Project 2025</p>
      </div>
    </AuthLayout>
  );
}
