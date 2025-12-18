import api from './api';

const authService = {

  // =========================
  // REGISTER (FIXED)
  // =========================
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        // MATCH BACKEND RegisterRequest EXACTLY
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        password: userData.password,
        userType: userData.userType || 'STUDENT',
        avatarUrl: null
      });

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  // =========================
  // LOGIN
  // =========================
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  // =========================
  // LOGOUT
  // =========================
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // =========================
  // CURRENT USER
  // =========================
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUserType: () => {
    const user = authService.getCurrentUser();
    return user?.userType || null;
  },

  // =========================
  // UPDATE PROFILE
  // =========================
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', {
        firstname: data.firstname,
        lastname: data.lastname
      });

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },

  // =========================
  // PASSWORD RESET
  // =========================
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send reset link';
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reset password';
    }
  },
};

export default authService;
