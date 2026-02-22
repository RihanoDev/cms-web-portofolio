/**
 * Media upload service for CMS
 * Uploads files to the backend server and returns accessible URLs
 */
import { api } from "./api";
import { API_BASE_URL } from "./config";

export interface MediaItem {
  id: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadResult {
  id: number;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Upload a file to the backend server
 * Returns the accessible URL and metadata of the uploaded file
 */
export const uploadMedia = async (file: File, folder?: string): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await api.upload("/media/upload", formData);
  const data = response.data?.data;
  if (!data) {
    throw new Error("No data returned from upload");
  }
  // Normalize returned fileUrl:
  // - If backend returned a localhost absolute URL, replace host with configured API base
  // - If backend returned a relative path (starts with '/'), prefix with API base
  try {
    const publicBase = API_BASE_URL.replace(/\/api\/?v?1\/?$/i, "").replace(/\/$/, "");
    if (data.fileUrl && typeof data.fileUrl === "string") {
      // Replace any localhost or mismatched host with API base
      if (/https?:\/\/localhost(:\d+)?/i.test(data.fileUrl) || /https?:\/\/127\.0\.0\.1(:\d+)?/i.test(data.fileUrl)) {
        data.fileUrl = data.fileUrl.replace(/https?:\/\/[^/]+/, publicBase);
      } else if (data.fileUrl.startsWith("/")) {
        data.fileUrl = `${publicBase}${data.fileUrl}`;
      }
    }
  } catch (e) {
    // Non-fatal: if normalization fails, just return original URL
    
  }

  return data as UploadResult;
};

/**
 * Get all media items
 */
export const getMedia = async (): Promise<MediaItem[]> => {
  try {
    const response = await api.get("/media");
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    
    return [];
  }
};

/**
 * Delete a media item by ID
 */
export const deleteMedia = async (id: number): Promise<void> => {
  await api.delete(`/media/${id}`);
};
