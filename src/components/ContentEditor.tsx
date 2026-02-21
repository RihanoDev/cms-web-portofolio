import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import { api } from '../services/api';
import { API_BASE_URL } from '../services/config';

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

interface ContentFormData {
  title: string;
  slug: string;
  description: string;
  content: string;
  status: 'draft' | 'published' | 'private';
  categoryIds: number[];
  tagIds: number[];
  metadata: Record<string, any>;
  images: Array<{
    url: string;
    caption?: string;
    sortOrder?: number;
  }>;
  videos: Array<{
    url: string;
    caption?: string;
    sortOrder?: number;
  }>;
}

interface ContentEditorProps {
  contentType: 'article' | 'project' | 'experience';
  initialData?: Partial<ContentFormData>;
  onSave: (data: ContentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  contentType,
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    status: 'draft',
    categoryIds: [],
    tagIds: [],
    metadata: {},
    images: [],
    videos: [],
    ...initialData
  });

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [metadataInput, setMetadataInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Load categories and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setAvailableCategories(categoriesData.data?.data || categoriesData.data || []);
        }

        // Fetch tags
        const tagsResponse = await fetch(`${API_BASE_URL}/tags`);
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setAvailableTags(tagsData.data?.data || tagsData.data || []);
        }
      } catch (error) {
        console.error('Error loading categories and tags:', error);
      }
    };

    loadData();
  }, []);

  // Initialize metadata input
  useEffect(() => {
    setMetadataInput(JSON.stringify(formData.metadata, null, 2));
  }, []);

  const handleMetadataChange = (value: string) => {
    setMetadataInput(value);
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({ ...prev, metadata: parsed }));
    } catch (error) {
      // Invalid JSON, keep the input but don't update formData
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, {
          url: newImageUrl.trim(),
          sortOrder: prev.images.length
        }]
      }));
      setNewImageUrl('');
    }
  };

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, {
          url: newVideoUrl.trim(),
          sortOrder: prev.videos.length
        }]
      }));
      setNewVideoUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit' : 'Create'} {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Relational Data Section */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-4">
            📊 Relational Data (Indexed & Searchable)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded p-2">
                {availableCategories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            categoryIds: [...prev.categoryIds, category.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            categoryIds: prev.categoryIds.filter(id => id !== category.id)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded p-2">
                {availableTags.map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            tagIds: [...prev.tagIds, tag.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            tagIds: prev.tagIds.filter(id => id !== tag.id)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                status: e.target.value as 'draft' | 'published' | 'private'
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-lg font-medium text-purple-800 mb-4">
            🎨 Media Files
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-xs truncate flex-1">{image.url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Videos
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Video URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-xs truncate flex-1">{video.url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-4">
            🗂️ Flexible Metadata (JSON)
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom metadata (JSON format)
            </label>
            <textarea
              value={metadataInput}
              onChange={(e) => handleMetadataChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='{"customField": "value", "features": ["feature1", "feature2"]}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter valid JSON for flexible metadata fields
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
