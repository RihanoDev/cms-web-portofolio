import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// When VITE_API_BASE is empty, vite dev server proxy will handle "/api" to localhost:8080 as configured in vite.config.
const BASE = (import.meta as any).env?.VITE_API_BASE || '';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE,
  timeout: 15000, // 15 seconds timeout
  withCredentials: true, // Include cookies
});

// Request interceptor for adding auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cms_token');
    if (token) {
      const cleanToken = token.trim().replace(/^["']|["']$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log(`Adding auth header (token length: ${cleanToken.length})`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle auth errors globally
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - token may be invalid');
      // We could redirect to login page here if needed
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  async get(path: string, config?: AxiosRequestConfig) {
    console.log(`API GET request to: ${path}`);
    try {
      const response: AxiosResponse = await axiosInstance.get(path, config);
      console.log(`API GET response from ${path}:`, response.status);
      console.log(`API GET data from ${path}:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`API GET ${path} error:`, error);
      
      // Return more detailed error info
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
      
      throw new Error(errorMessage);
    }
  },
  
  async post(path: string, body?: any, config?: AxiosRequestConfig) {
    console.log(`API POST request to: ${path}`, body);
    try {
      const response: AxiosResponse = await axiosInstance.post(path, body, config);
      console.log(`API POST response from ${path}:`, response.status);
      console.log(`API POST data from ${path}:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`API POST ${path} error:`, error);
      
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
      
      throw new Error(errorMessage);
    }
  },
  
  async put(path: string, body?: any, config?: AxiosRequestConfig) {
    console.log(`API PUT request to: ${path}`, body);
    try {
      const response: AxiosResponse = await axiosInstance.put(path, body, config);
      console.log(`API PUT response from ${path}:`, response.status);
      console.log(`API PUT data from ${path}:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`API PUT ${path} error:`, error);
      
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
      
      // Special handling for auth errors
      if (error.response?.status === 401) {
        localStorage.removeItem('cms_token');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(errorMessage);
    }
  },
  
  async delete(path: string, config?: AxiosRequestConfig) {
    console.log(`API DELETE request to: ${path}`);
    try {
      const response: AxiosResponse = await axiosInstance.delete(path, config);
      console.log(`API DELETE response from ${path}:`, response.status);
      return response;
    } catch (error: any) {
      console.error(`API DELETE ${path} error:`, error);
      
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
      
      throw new Error(errorMessage);
    }
  },
  
  async upload(path: string, formData: FormData, config?: AxiosRequestConfig) {
    console.log(`API UPLOAD request to: ${path}`);
    try {
      const uploadConfig = {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response: AxiosResponse = await axiosInstance.post(path, formData, uploadConfig);
      console.log(`API UPLOAD response from ${path}:`, response.status);
      console.log(`API UPLOAD data from ${path}:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`API UPLOAD ${path} error:`, error);
      
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
      
      throw new Error(errorMessage);
    }
  }
}

// Note: authHeader function has been removed because it's now handled by axios interceptors
