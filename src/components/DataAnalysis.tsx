import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/config';

interface ApiResponse {
  id: number;
  title: string;
  description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  metadata: Record<string, any>;
}


export const DataAnalysis: React.FC = () => {
  const [sampleData, setSampleData] = useState<ApiResponse | null>(null);
  const [selectedContent, setSelectedContent] = useState<'articles' | 'projects' | 'experiences'>('articles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch real data from API
  const fetchRealData = async (contentType: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/${contentType}?limit=1`);
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setSampleData(data.items[0]);
      } else {
        // Fallback to mock data if no real data
        setMockData();
      }
    } catch (err) {
      
      setMockData();
    }
    setLoading(false);
  };

  const setMockData = () => {
    const mockResponse: ApiResponse = {
      id: 1,
      title: "Sample Article Title",
      description: "This is a sample description",
      categories: [
        { id: 1, name: "Technology", slug: "technology" },
        { id: 2, name: "Programming", slug: "programming" }
      ],
      tags: [
        { id: 1, name: "React", slug: "react" },
        { id: 2, name: "TypeScript", slug: "typescript" },
        { id: 3, name: "Frontend", slug: "frontend" }
      ],
      metadata: {
        readTime: "5 minutes",
        difficulty: "intermediate",
        lastUpdated: "2025-01-10",
        author: {
          bio: "Full-stack developer",
          socialMedia: {
            twitter: "@johndoe",
            github: "johndoe"
          }
        },
        seo: {
          metaTitle: "Complete Guide to React",
          metaDescription: "Learn React from scratch",
          keywords: ["react", "javascript", "frontend"]
        },
        customFields: {
          featured: true,
          priority: "high",
          version: "1.2.0"
        }
      }
    };
    setSampleData(mockResponse);
  };

  useEffect(() => {
    fetchRealData(selectedContent);
  }, [selectedContent]);

  if (!sampleData) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading data analysis...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Architecture Analysis</h2>
            <p className="text-gray-600">
              Understand how your content data is structured between relational database tables and JSON metadata
            </p>
          </div>
          <button
            onClick={() => fetchRealData(selectedContent)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="flex space-x-4">
        {(['articles', 'projects', 'experiences'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedContent(type)}
            className={`px-4 py-2 rounded-md font-medium capitalize ${selectedContent === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Data Structure Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relational Data */}
        <div className="bg-white border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Relational Data</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🏷️ Categories (Many-to-Many)</h4>
              <p className="text-sm text-green-700 mb-3">
                Stored in separate table with junction table for relationships
              </p>
              <div className="space-y-2">
                {sampleData.categories.map((cat) => (
                  <div key={cat.id} className="bg-white p-2 rounded border border-green-200">
                    <span className="font-medium">ID: {cat.id}</span> |
                    <span className="ml-1">Name: {cat.name}</span> |
                    <span className="ml-1">Slug: {cat.slug}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔖 Tags (Many-to-Many)</h4>
              <p className="text-sm text-green-700 mb-3">
                Stored in separate table with junction table for relationships
              </p>
              <div className="space-y-2">
                {sampleData.tags.map((tag) => (
                  <div key={tag.id} className="bg-white p-2 rounded border border-green-200">
                    <span className="font-medium">ID: {tag.id}</span> |
                    <span className="ml-1">Name: {tag.name}</span> |
                    <span className="ml-1">Slug: {tag.slug}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-100 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">✅ Why Relational?</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Fast filtering and searching</li>
                <li>• Data integrity and constraints</li>
                <li>• Efficient joins and queries</li>
                <li>• Normalized structure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* JSON Metadata */}
        <div className="bg-white border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">JSON Metadata</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📊 Flexible Fields</h4>
              <p className="text-sm text-blue-700 mb-3">
                Stored as JSONB in PostgreSQL for flexible, schema-less data
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(sampleData.metadata, null, 2)}</pre>
              </div>
            </div>

            <div className="bg-blue-100 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">✅ Why JSON Metadata?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Schema flexibility</li>
                <li>• Easy to add new fields</li>
                <li>• Complex nested data</li>
                <li>• No database migrations needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Use Relational For:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Categories and Tags (filtering)</li>
              <li>• User relationships</li>
              <li>• Status and publish dates</li>
              <li>• Data that needs indexing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Use JSON Metadata For:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• SEO fields</li>
              <li>• Custom content-specific data</li>
              <li>• Media URLs and captions</li>
              <li>• Configuration settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
