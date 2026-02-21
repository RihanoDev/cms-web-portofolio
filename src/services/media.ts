/**
 * Media upload service for CMS
 * Uploads files to the backend server and returns accessible URLs
 */
import { api } from "./api";

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
        console.error("Failed to fetch media:", error);
        return [];
    }
};

/**
 * Delete a media item by ID
 */
export const deleteMedia = async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
};
