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
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: 'STUDENT'
      });

      navigate('/login/student', {
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
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
      subtitle="Revolutionize your software testing workflow with intelligent evaluation."
      features={features}
    >
      <div className="auth-form-wrapper">
        <div className="auth-logo">
          <div className="auth-logo-icon">S</div>
          <span className="auth-logo-text">STDE</span>
        </div>

        <div className="auth-header">
          <h2 className="auth-form-title">Create Student Account</h2>
          <p className="auth-form-subtitle">
            Already have an account?{' '}
            <Link to="/login/student" className="auth-link">Sign in</Link>
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-row">
            <InputField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
              disabled={loading}
            />
            <InputField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
            disabled={loading}
          />

          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            disabled={loading}
          />

          <PasswordInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <SocialButton
            provider="google"
            onClick={handleGoogleSignup}
            disabled={loading}
            text="Sign up with Google"
          />
        </form>

        <p className="auth-switch-role">
          Are you a teacher?{' '}
          <Link to="/register/teacher" className="auth-link">Register here</Link>
        </p>

        <p className="auth-footer">Capstone Project 2025</p>
      </div>
    </AuthLayout>
  );
}
