import React, { useState } from 'react';
import { uploadMedia } from '../services/media';

interface ImagePreviewProps {
  url: string;
  caption?: string;
  altText?: string;
  onRemove: () => void;
  onCaptionChange?: (caption: string) => void;
  onAltTextChange?: (altText: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  caption = '',
  altText = '',
  onRemove,
  onCaptionChange,
  onAltTextChange,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative group border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
      <img
        src={url}
        alt={altText || 'Preview'}
        className="w-full h-48 object-cover"
      />

      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex justify-end">
          <button
            onClick={onRemove}
            className="p-1 bg-red-500/80 hover:bg-red-500 rounded-full"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-slate-600/80 hover:bg-slate-600 rounded-lg text-xs"
          >
            {showDetails ? 'Hide Details' : 'Edit Details'}
          </button>
        </div>
      </div>

      {/* Caption and alt text section */}
      {showDetails && (
        <div className="p-3 border-t border-slate-700 space-y-3">
          {onCaptionChange && (
            <div>
              <label htmlFor="caption" className="block text-xs font-medium text-slate-400 mb-1">
                Caption
              </label>
              <input
                type="text"
                id="caption"
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                placeholder="Add a caption..."
              />
            </div>
          )}

          {onAltTextChange && (
            <div>
              <label htmlFor="alt-text" className="block text-xs font-medium text-slate-400 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                id="alt-text"
                value={altText}
                onChange={(e) => onAltTextChange(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                placeholder="Describe this image..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MediaUploaderProps {
  images: Array<{
    id?: string;
    url: string;
    caption?: string;
    altText?: string;
  }>;
  onAdd: (image: { url: string; caption?: string; altText?: string }) => void;
  onUpdate: (index: number, image: { url: string; caption?: string; altText?: string }) => void;
  onRemove: (index: number) => void;
  folder?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  images = [],
  onAdd,
  onUpdate,
  onRemove,
  folder,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, GIF, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Upload to server
      const result = await uploadMedia(file, folder);

      const newImage = {
        url: result.fileUrl,
        caption: '',
        altText: file.name.replace(/\.[^/.]+$/, ''),
      };

      onAdd(newImage);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <ImagePreview
            key={image.id || index}
            url={image.url}
            caption={image.caption}
            altText={image.altText}
            onRemove={() => onRemove(index)}
            onCaptionChange={(caption) => onUpdate(index, { ...image, caption })}
            onAltTextChange={(altText) => onUpdate(index, { ...image, altText })}
          />
        ))}
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragOver
          ? 'border-blue-400 bg-blue-500/10'
          : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
          }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400 text-sm">Uploading to server...</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-slate-400 text-sm mb-1">
              Drag & drop image here, or{' '}
              <label className="text-blue-400 cursor-pointer hover:text-blue-300 underline">
                browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-slate-500 text-xs">PNG, JPG, GIF, WebP up to 10MB</p>
            <p className="text-green-400/70 text-xs mt-1">✓ Files are stored on server and publicly accessible</p>
          </>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-200">✕</button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
