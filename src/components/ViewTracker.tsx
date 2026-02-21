import React, { useEffect, useState } from 'react';
import { trackContentView, getContentViews } from '../services/analytics';

interface ViewTrackerProps {
  contentId: string | number;
  contentType: 'article' | 'project' | 'page';
  trackOnMount?: boolean;
  showCount?: boolean;
  className?: string;
}

const ViewTracker: React.FC<ViewTrackerProps> = ({
  contentId,
  contentType,
  trackOnMount = true,
  showCount = true,
  className = '',
}) => {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track view on component mount if enabled
  useEffect(() => {
    if (trackOnMount && contentId) {
      const track = async () => {
        try {
          await trackContentView({
            contentId,
            contentType,
            visitorIp: '', // Will be detected on server
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          });
        } catch (err) {
          console.error('Failed to track view:', err);
          // Don't show error to user for tracking failures
        }
      };

      track();
    }
  }, [contentId, contentType, trackOnMount]);

  // Fetch view count if showing count
  useEffect(() => {
    if (showCount && contentId) {
      const fetchViewCount = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const count = await getContentViews(contentId, contentType);
          setViewCount(count);
        } catch (err) {
          console.error('Failed to fetch view count:', err);
          setError('Failed to load view count');
        } finally {
          setIsLoading(false);
        }
      };

      fetchViewCount();
    }
  }, [contentId, contentType, showCount]);

  // If not showing count, return null
  if (!showCount) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <svg 
        className="w-4 h-4" 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path 
          fillRule="evenodd" 
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" 
          clipRule="evenodd" 
        />
      </svg>
      
      {isLoading ? (
        <span className="text-sm opacity-70">...</span>
      ) : error ? (
        <span className="text-sm text-red-400">Error</span>
      ) : (
        <span className="text-sm">{viewCount?.toLocaleString() || '0'} views</span>
      )}
    </div>
  );
};

export default ViewTracker;
