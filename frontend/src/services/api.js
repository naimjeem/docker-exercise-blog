import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const postsAPI = {
  // Get all posts
  getAllPosts: async () => {
    const response = await api.get('/api/posts');
    return response.data;
  },

  // Get single post by ID
  getPostById: async (id) => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData) => {
    const response = await api.post('/api/posts', postData);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

