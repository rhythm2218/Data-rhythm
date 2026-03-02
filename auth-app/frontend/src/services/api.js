import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = (userData) => API.post('/auth/signup', userData);
export const login = (email, password) => API.post('/auth/login', { email, password });
export const getProfile = () => API.get('/auth/profile');

export default API;
