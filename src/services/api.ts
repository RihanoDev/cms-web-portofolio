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
    return base64;
  }
}

/** Coba decode Base64 sampai 3 level sampai dapat JSON yang valid */
function tryDecodeResponse(raw: string): any {
  let current = raw;
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeBase64Utf8(current);
      return JSON.parse(decoded); // sukses!
    } catch {
      // masih bukan JSON, decode satu level lagi
      try {
        current = decodeBase64Utf8(current);
      } catch {
        break; // tidak bisa decode lagi
      }
    }
  }
  return raw; // kembalikan raw jika semua gagal
}

// Response interceptor for handling common errors and response decoding
axiosInstance.interceptors.response.use(
  (response) => {
    const isExplicitlyEncoded = response.headers["x-encoded-response"] === "true";
    const looksLikeBase64 =
      typeof response.data === "string" &&
      response.data.length > 20 &&
      /^[A-Za-z0-9+/]+=*$/.test(response.data.trim());

    if ((isExplicitlyEncoded || looksLikeBase64) && typeof response.data === "string") {
      const parsed = tryDecodeResponse(response.data);
      response.data = parsed;
    }

    // Jika backend mengembalikan { success: false } tapi HTTP 200
    // (terjadi karena WriteHeaderNow override di middleware Go)
    // konversi ke rejection supaya error handler berjalan normal
    const d = response.data;
    if (d && typeof d === "object" && d.success === false) {
      const msg = d.message || d.error || "Request failed";
      const err: any = new Error(msg);
      err.response = response;
      err.response.status = 400; // tandai sebagai error
      return Promise.reject(err);
    }

    return response;
  },
  (error) => {
    // Decode body error agar pesan bisa dibaca
    if (error.response && typeof error.response.data === "string") {
      try {
        error.response.data = tryDecodeResponse(error.response.data);
      } catch { /* biarkan */ }
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

  async patch(path: string, body?: any, config?: AxiosRequestConfig) {
    try {
      const response: AxiosResponse = await axiosInstance.patch(path, body, config);
      return response;
    } catch (error: any) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.error || errorData.message || error.message;
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
