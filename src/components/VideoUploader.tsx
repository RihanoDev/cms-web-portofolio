import React, { useState, useEffect } from 'react';

interface VideoInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
}

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid video URL:', url);
    return null;
  }

  try {
    // Clean up the URL first
    const cleanUrl = url.trim();
    console.log('Processing video URL:', cleanUrl);
    
    // Handle direct embed URLs - just return as is
    if (cleanUrl.includes('youtube.com/embed/') || cleanUrl.includes('player.vimeo.com/video/')) {
      console.log('Already an embed URL, returning as is:', cleanUrl);
      return cleanUrl;
    }
    
    // Simple YouTube URL detection with manual ID extraction
    // This is more reliable than regex for many URL formats
    if (cleanUrl.includes('youtube.com/watch') || cleanUrl.includes('youtu.be/')) {
      console.log('Detected YouTube URL');
      
      let videoId = '';
      
      // Handle youtube.com/watch?v=ID format
      if (cleanUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(cleanUrl);
        videoId = urlObj.searchParams.get('v') || '';
      } 
      // Handle youtu.be/ID format
      else if (cleanUrl.includes('youtu.be/')) {
        const parts = cleanUrl.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0].split('&')[0].split('#')[0];
        }
      }
      
      if (videoId) {
        console.log('Extracted YouTube video ID:', videoId);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('Generated YouTube embed URL:', embedUrl);
        return embedUrl;
      }
    }
    
    // Vimeo simple detection
    if (cleanUrl.includes('vimeo.com')) {
      console.log('Detected Vimeo URL');
      
      // Extract the ID using a simpler approach
      const vimeoId = cleanUrl.split('vimeo.com/')[1];
      if (vimeoId) {
        // Clean up the ID by removing anything after ? or # or /
        const cleanId = vimeoId.split(/[?#/]/)[0];
        if (cleanId && /^\d+$/.test(cleanId)) {
          console.log('Extracted Vimeo ID:', cleanId);
          const embedUrl = `https://player.vimeo.com/video/${cleanId}`;
          console.log('Generated Vimeo embed URL:', embedUrl);
          return embedUrl;
        }
      }
    }
    
    // Direct URL check - sometimes users might paste the full iframe embed code or a direct player URL
    // This tries to extract it from common patterns
    const directUrlMatch = cleanUrl.match(/src=["'](.+?)["']/i);
    if (directUrlMatch && directUrlMatch[1]) {
      const extractedUrl = directUrlMatch[1];
      console.log('Extracted direct URL from input:', extractedUrl);
      
      // Verify it's a valid embed URL
      if (extractedUrl.includes('youtube.com/embed/') || extractedUrl.includes('player.vimeo.com/video/')) {
        return extractedUrl;
      }
    }
    
    console.warn('No supported video URL pattern matched for:', cleanUrl);
    return null;
  } catch (error) {
    console.error('Error processing video URL:', error);
    return null;
  }
};

const VideoInput: React.FC<VideoInputProps> = ({
  value,
  onChange,
  onSubmit,
  caption = '',
  onCaptionChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ? getVideoEmbedUrl(value) : null);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);
    
    // Auto-update the main value if there's already a preview
    if (previewUrl) {
      onChange(newValue);
      const newEmbedUrl = getVideoEmbedUrl(newValue);
      setPreviewUrl(newEmbedUrl);
    }
  };
  
  // Special function for extracting YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    try {
      // First try URL object approach
      if (url.includes('youtube.com')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      } 
      // Handle youtu.be short links
      else if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          return parts[1].split('?')[0].split('&')[0];
        }
      }
      return null;
    } catch (err) {
      console.error('Error extracting YouTube ID:', err);
      return null;
    }
  };
  
  const handleGenerate = () => {
    console.log('Generating preview for input:', inputValue);
    setError(null);
    
    // Try standard processing first
    const embedUrl = getVideoEmbedUrl(inputValue);
    console.log('Generated embed URL:', embedUrl);
    
    if (embedUrl) {
      setPreviewUrl(embedUrl);
      onChange(inputValue);
      if (onSubmit) onSubmit();
      return;
    }
    
    // If standard processing fails, try a more direct approach for YouTube
    if (inputValue.includes('youtube.com/watch?v=') || inputValue.includes('youtu.be/')) {
      try {
        console.log('Trying fallback YouTube URL processing');
        const videoId = extractYouTubeVideoId(inputValue);
        console.log('Extracted YouTube ID:', videoId);
        
        if (videoId) {
          const fallbackEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
          console.log('Fallback YouTube embed URL:', fallbackEmbedUrl);
          setPreviewUrl(fallbackEmbedUrl);
          onChange(inputValue);
          if (onSubmit) onSubmit();
          return;
        }
      } catch (err) {
        console.error('Fallback YouTube processing failed:', err);
        setError('Could not extract video ID from YouTube URL');
      }
    }
    
    // If we got here, we couldn't process the video URL
    setError('Could not generate embed URL from this video link. Please use a direct YouTube or Vimeo URL.');
    setPreviewUrl(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="YouTube or Vimeo URL"
          className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
        >
          Preview
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}
      
      {onCaptionChange && (
        <div>
          <label htmlFor="video-caption" className="block text-xs font-medium text-slate-400 mb-1">
            Caption
          </label>
          <input
            type="text"
            id="video-caption"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
            placeholder="Add a caption for this video..."
          />
        </div>
      )}
      
      {previewUrl ? (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-black/30">
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={previewUrl}
              title="Video preview"
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-lg bg-slate-800/50 flex items-center justify-center h-64">
          <div className="text-center text-slate-400">
            <svg 
              className="w-12 h-12 mx-auto mb-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">Enter a YouTube or Vimeo URL to preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface VideoPreviewProps {
  url: string;
  caption?: string;
  onRemove: () => void;
  onCaptionChange?: (caption: string) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  url,
  caption = '',
  onRemove,
  onCaptionChange,
}) => {
  console.log('VideoPreview rendering with URL:', url);
  
  // Use state for managing UI
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract YouTube video ID directly
  const extractYouTubeVideoId = (videoUrl: string): string | null => {
    try {
      if (videoUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(videoUrl);
        return urlObj.searchParams.get('v');
      } else if (videoUrl.includes('youtu.be/')) {
        const parts = videoUrl.split('youtu.be/');
        if (parts.length > 1) {
          return parts[1].split(/[?#]/)[0];
        }
      }
      return null;
    } catch (err) {
      console.error('Error extracting YouTube ID:', err);
      return null;
    }
  };
  
  // Process URL on component mount or when URL changes
  useEffect(() => {
    try {
      // First try standard method
      const result = getVideoEmbedUrl(url);
      
      if (result) {
        setEmbedUrl(result);
        setError(null);
        console.log('Generated embed URL:', result);
        return;
      }
      
      // If standard method fails, try direct YouTube ID extraction
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
          const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
          setEmbedUrl(youtubeEmbedUrl);
          setError(null);
          console.log('Used fallback YouTube embed URL generation:', youtubeEmbedUrl);
          return;
        }
      }
      
      // If we got here, we couldn't process the URL
      setError('Could not generate embed URL from the provided video link');
      setEmbedUrl(null);
    } catch (err) {
      console.error('Error processing video URL:', err);
      setError('Error processing video URL');
      setEmbedUrl(null);
    }
  }, [url]);
  
  return (
    <div className="relative group border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
      <div className="relative pb-[56.25%] h-0 bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Video preview"
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <svg 
                className="w-12 h-12 mx-auto mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Invalid video URL</p>
              {error && <p className="text-xs mt-2 text-red-400">{error}</p>}
              <p className="text-xs mt-1">Try using direct YouTube or Vimeo links</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hover overlay with actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex justify-end">
          <button
            onClick={onRemove}
            className="p-1 bg-red-500/80 hover:bg-red-500 rounded-full"
            title="Remove video"
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
      
      {/* Caption section */}
      {showDetails && onCaptionChange && (
        <div className="p-3 border-t border-slate-700">
          <label htmlFor="video-caption" className="block text-xs font-medium text-slate-400 mb-1">
            Caption
          </label>
          <input
            type="text"
            id="video-caption"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-sm text-white"
            placeholder="Add a caption..."
          />
        </div>
      )}
      
      {/* URL display */}
      <div className="px-3 py-2 text-xs text-slate-400 truncate border-t border-slate-700">
        {url}
      </div>
    </div>
  );
};

interface VideoUploaderProps {
  videos: Array<{
    id?: string;
    url: string;
    caption?: string;
  }>;
  onAdd: (video: { url: string; caption?: string }) => void;
  onUpdate: (index: number, video: { url: string; caption?: string }) => void;
  onRemove: (index: number) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  videos = [],
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');
  
  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      onAdd({
        url: videoUrl,
        caption: videoCaption,
      });
      setVideoUrl('');
      setVideoCaption('');
    }
  };
  
  return (
    <div className="space-y-6">
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <VideoPreview
              key={video.id || index}
              url={video.url}
              caption={video.caption}
              onRemove={() => onRemove(index)}
              onCaptionChange={(caption) => onUpdate(index, { ...video, caption })}
            />
          ))}
        </div>
      )}
      
      <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
        <h4 className="text-sm font-medium text-white mb-4">Add New Video</h4>
        <VideoInput
          value={videoUrl}
          onChange={setVideoUrl}
          onSubmit={handleAddVideo}
          caption={videoCaption}
          onCaptionChange={setVideoCaption}
        />
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleAddVideo}
            disabled={!videoUrl.trim()}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              ${videoUrl.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
              transition-colors
            `}
          >
            Add Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
