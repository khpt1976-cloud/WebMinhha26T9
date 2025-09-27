import axios from 'axios';

// API base URL - Force localhost:8000 for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token exists:', token ? 'YES' : 'NO');
    
    // For testing - create fake token if none exists
    if (!token && config.url?.includes('/api/')) {
      localStorage.setItem('admin_token', 'fake-token-for-testing');
      localStorage.setItem('admin_user', JSON.stringify({
        username: 'Hpt', 
        email: 'Khpt1976@gmail.com',
        role: 'super_admin'
      }));
      console.log('🔧 Created fake token for testing');
    }
    
    const finalToken = localStorage.getItem('admin_token');
    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
      console.log('✅ Authorization header added');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.response?.data);
    console.error('❌ Full error:', error);
    
    // Temporarily disable 401 redirect for debugging
    // if (error.response?.status === 401) {
    //   console.log('🚪 Unauthorized - redirecting to login');
    //   localStorage.removeItem('admin_token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;