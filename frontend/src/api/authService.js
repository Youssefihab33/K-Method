import axiosClient from './axiosClient';

export const authService = {
  // Login user and return token + user data
  login: async (credentials) => {
    const response = await axiosClient.post('/login/', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register a new user
  register: async (userData) => {
    const response = await axiosClient.post('/register/', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout current user (Clears client storage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Fetch authenticated user profile
  getCurrentUser: async () => {
    const response = await axiosClient.get('/users/current/');
    return response.data;
  },

  // Update authenticated user profile
  updateCurrentUser: async (userData) => {
    const response = await axiosClient.patch('/users/current/', userData);
    return response.data;
  },

  // User List (Admin/Tutor view)
  getUsers: async () => {
    const response = await axiosClient.get('/users/');
    return response.data;
  },

  // Fetch specific user details
  getUserById: async (id) => {
    const response = await axiosClient.get(`/users/${id}/`);
    return response.data;
  },
};