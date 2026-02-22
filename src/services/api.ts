import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL } from "./config";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  withCredentials: true, // Include credentials for CORS with auth
});

// Request interceptor for adding auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cms_token");
    if (token) {
      const cleanToken = token.trim().replace(/^["']|["']$/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;

    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  },
);

function decodeBase64Utf8(base64: string): string {
  try {
    if (typeof window === "undefined" || !window.atob) return base64;
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return base64; // Fallback to raw string if not valid base64
  }
}

// Response interceptor for handling common errors and response decoding
axiosInstance.interceptors.response.use(
  (response) => {
    // Decode if backend sends encoded payload
    if (response.headers["x-encoded-response"] === "true" && typeof response.data === "string") {
      try {
        const decoded = decodeBase64Utf8(response.data);
        response.data = JSON.parse(decoded);
      } catch (e) {
        // failed to decode, keep raw or handle error
      }
    }
    return response;
  },
  (error) => {


    // Handle auth errors globally
    if (error.response && error.response.status === 401) {

      // We could redirect to login page here if needed
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export const api = {
  async get(path: string, config?: AxiosRequestConfig) {

    try {
      const response: AxiosResponse = await axiosInstance.get(path, config);


      return response;
    } catch (error: any) {


      // Return more detailed error info
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  async post(path: string, body?: any, config?: AxiosRequestConfig) {

    try {
      const response: AxiosResponse = await axiosInstance.post(path, body, config);


      return response;
    } catch (error: any) {


      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  async put(path: string, body?: any, config?: AxiosRequestConfig) {

    try {
      const response: AxiosResponse = await axiosInstance.put(path, body, config);


      return response;
    } catch (error: any) {


      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;

      // Special handling for auth errors
      if (error.response?.status === 401) {
        localStorage.removeItem("cms_token");
        const authError = new Error("Authentication failed. Please log in again.") as any;
        authError.response = error.response;
        throw authError;
      }

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  async delete(path: string, config?: AxiosRequestConfig) {

    try {
      const response: AxiosResponse = await axiosInstance.delete(path, config);

      return response;
    } catch (error: any) {


      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  async upload(path: string, formData: FormData, config?: AxiosRequestConfig) {

    try {
      const uploadConfig = {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      };

      const response: AxiosResponse = await axiosInstance.post(path, formData, uploadConfig);


      return response;
    } catch (error: any) {


      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;

      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },
};

// Note: authHeader function has been removed because it's now handled by axios interceptors
