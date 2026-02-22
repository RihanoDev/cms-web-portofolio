import React, { useState } from 'react';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface MetadataViewerProps {
  metadata?: Record<string, any>;
  relationalData?: {
    categories?: Category[];
    tags?: Tag[];
    technologies?: Tag[];
  };
  mediaData?: {
    images?: Array<{
      id?: string;
      url: string;
      caption?: string;
      sortOrder?: number;
    }>;
    videos?: Array<{
      id?: string;
      url: string;
      caption?: string;
      sortOrder?: number;
    }>;
  };
  features?: string[];
  title?: string;
  className?: string;
}

export const MetadataViewer: React.FC<MetadataViewerProps> = ({
  metadata = {},
  relationalData,
  mediaData,
  features,
  title = "Data Overview",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMetadata = metadata && Object.keys(metadata).length > 0;
  const hasRelationalData = relationalData && (
    relationalData.categories?.length ||
    relationalData.tags?.length ||
    relationalData.technologies?.length
  );
  const hasMediaData = mediaData && (mediaData.images?.length || mediaData.videos?.length);
  const hasFeatures = features && features.length > 0;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderMetadataItem = (key: string, value: any, depth = 0) => {
    const indent = depth * 20;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div key={key} className="mb-2" style={{ marginLeft: `${indent}px` }}>
          <div className="font-medium text-gray-700 mb-1">{key}:</div>
          <div className="border-l-2 border-gray-200 pl-3">
            {Object.entries(value).map(([subKey, subValue]) =>
              renderMetadataItem(subKey, subValue, depth + 1)
            )}
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-2" style={{ marginLeft: `${indent}px` }}>
          <div className="font-medium text-gray-700 mb-1">{key}:</div>
          <div className="border-l-2 border-gray-200 pl-3">
            {value.map((item, index) => (
              <div key={index} className="mb-1">
                {typeof item === 'object' ? (
                  <div className="bg-gray-50 p-2 rounded border">
                    {Object.entries(item).map(([subKey, subValue]) =>
                      renderMetadataItem(subKey, subValue, 0)
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">{formatValue(item)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="mb-2 flex" style={{ marginLeft: `${indent}px` }}>
        <span className="font-medium text-gray-700 min-w-32">{key}:</span>
        <span className="text-gray-600 ml-2 break-words text-sm">{formatValue(value)}</span>
      </div>
    );
  };

  // Extract some commonly interesting metadata for quick view
  const quickViewItems = [];
  if (metadata?.version) quickViewItems.push(['Version', metadata.version]);
  if (metadata?.lastUpdated) quickViewItems.push(['Last Updated', new Date(metadata.lastUpdated).toLocaleString()]);
  if (metadata?.originalId) quickViewItems.push(['Original ID', metadata.originalId]);
  if (metadata?.technologies && Array.isArray(metadata.technologies)) {
    quickViewItems.push(['Technologies Count', metadata.technologies.length]);
  }
  if (metadata?.images && Array.isArray(metadata.images)) {
    quickViewItems.push(['Images Count', metadata.images.length]);
  }
  if (metadata?.videos && Array.isArray(metadata.videos)) {
    quickViewItems.push(['Videos Count', metadata.videos.length]);
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Quick view - always visible */}
      {quickViewItems.length > 0 && (
        <div className="mb-3 p-3 bg-white rounded border">
          <div className="text-sm font-medium text-gray-600 mb-2">Quick Info:</div>
          {quickViewItems.map(([key, value]) => (
            <div key={key} className="text-xs text-gray-500 flex justify-between">
              <span>{key}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full metadata - expandable */}
      {isExpanded && (
        <div className="bg-white p-3 rounded border">
          <div className="text-sm font-medium text-gray-600 mb-3">Full Metadata:</div>
          <div className="max-h-64 overflow-y-auto">
            {metadata && Object.entries(metadata).map(([key, value]) =>
              renderMetadataItem(key, value)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataViewer;
