import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response: AxiosResponse = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response: AxiosResponse = await api.post('/auth/login', data);
    return response.data;
  },

  googleAuth: (redirectUrl: string = 'http://localhost:5173') => {
    window.location.href = `${API_BASE_URL}/oauth2/google?redirectUrl=${redirectUrl}/oauth2/callback`;
  },
};

// URL API calls
export const urlAPI = {
  createUrl: async (data: { original_url: string; title?: string }) => {
    const response: AxiosResponse = await api.post('/url', data);
    return response.data;
  },

  getUrls: async () => {
    const response: AxiosResponse = await api.get('/url');
    return response.data;
  },

  getUrl: async (id: string) => {
    const response: AxiosResponse = await api.get(`/url/${id}`);
    return response.data;
  },

  updateUrl: async (id: string, data: { title?: string; original_url?: string }) => {
    const response: AxiosResponse = await api.put(`/url/${id}`, data);
    return response.data;
  },

  deleteUrl: async (id: string) => {
    const response: AxiosResponse = await api.delete(`/url/${id}`);
    return response.data;
  },
};

export interface URLItem {
  id: number;
  user_id: number;
  original_url: string;
  short_code: string;
  clicks: number;
  title?: string;
  created_at: string;
  updated_at: string;
}