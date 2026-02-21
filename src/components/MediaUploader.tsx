import React, { useState } from 'react';
import FileUpload from './FileUpload';

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
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  images = [],
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    setUploading(true);
    
    try {
      // In a real app, you would upload to your backend and get a URL
      // For now, we'll create a local URL
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage = {
            url: e.target.result.toString(),
            caption: '',
            altText: file.name,
          };
          
          onAdd(newImage);
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
    }
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
      
      <FileUpload
        onFileSelect={handleFileUpload}
        accept="image/*"
        multiple={false}
        label="Upload Image (PNG, JPG, GIF up to 10MB)"
      />
      
      {uploading && (
        <div className="flex items-center justify-center p-4">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
