import api from './api';

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        firstname: userData.firstName,
        lastname: userData.familyName,
        email: userData.email,
        password: userData.password,
        userType: userData.userType || 'STUDENT',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

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

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

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

  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      
      if (response.data.user) {
        const currentUser = authService.getCurrentUser();
        const updatedUser = response.data.user;

        if (!updatedUser.avatarUrl && currentUser?.avatarUrl) {
          updatedUser.avatarUrl = currentUser.avatarUrl;
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  },

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
