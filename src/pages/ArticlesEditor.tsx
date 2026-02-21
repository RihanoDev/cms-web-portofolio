import React, { useState, useEffect } from 'react';
import { ContentStore, Article, Category, Tag } from '../services/content';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import CategorySelector from '../components/CategorySelector';
import MediaUploader from '../components/MediaUploader';
import VideoUploader from '../components/VideoUploader';
import UuidGenerator from '../components/UuidGenerator';
import ViewTracker from '../components/ViewTracker';
import MetadataViewer from '../components/MetadataViewer';
import { getContentViews, generateSearchQuery } from '../services/analytics';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

// Card component for consistent UI
const Card = ({ title, children }: { title?: string, children: React.ReactNode }) => (
  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700/50">
    {title && (
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="font-semibold text-white m-0">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

// The main article editor component
export default function ArticlesEditor() {
  // State management for articles and UI
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null); // per-article save
  const [savedIndex, setSavedIndex] = useState<number | null>(null);   // per-article success flash
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articleViews, setArticleViews] = useState<Record<string, number>>({});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    // Load articles
    const loadArticles = async () => {
      try {
        const loadedArticles = await ContentStore.getArticles();
        const articlesArray = Array.isArray(loadedArticles) ? loadedArticles : [];
        setArticles(articlesArray);

        // Load view counts for published articles
        const viewsData: Record<string, number> = {};
        for (const article of articlesArray) {
          if (article.id && article.status === 'published') {
            try {
              const views = await getContentViews(article.id, 'article');
              viewsData[article.id] = views;
            } catch (error) {
              console.error(`Failed to fetch view count for article ${article.id}:`, error);
            }
          }
        }
        setArticleViews(viewsData);
      } catch (error) {
        console.error("Error loading articles:", error);
        setArticles([]);
      }
    };

    loadArticles();

    // Load categories
    ContentStore.getCategories()
      .then(loadedCategories => {
        setCategories(Array.isArray(loadedCategories) ? loadedCategories : []);
      })
      .catch(error => {
        console.error("Error loading categories:", error);
        setCategories([]);
      });

    // Load tags
    ContentStore.getTags()
      .then(loadedTags => {
        setTags(Array.isArray(loadedTags) ? loadedTags : []);
      })
      .catch(error => {
        console.error("Error loading tags:", error);
        setTags([]);
      });
  }, []);

  // Create a new article with defaults
  const addNewArticle = () => {
    const newArticle: Article = {
      id: '', // Will be set by UuidGenerator
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      categories: [],
      tags: [],
      images: [],
      videos: []
    };

    setArticles(prev => [...prev, newArticle]);
    // Focus the new article by setting it as the editing article
    setEditingIndex(articles.length); // articles.length = index of the newly added item
  };

  // Save a single article by its array index
  const saveOneArticle = async (index: number) => {
    const article = articles[index];
    if (!article) return;

    if (!article.title?.trim()) {
      setError('Article must have a title before saving.');
      return;
    }

    const token = localStorage.getItem('cms_token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
      return;
    }

    setSavingIndex(index);
    setError(null);
    try {
      const [saved] = await ContentStore.saveArticles([article]);
      setArticles(prev => prev.map((a, i) => i === index ? { ...saved } : a));
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 3000);
    } catch (err: any) {
      console.error('Error saving article:', err);
      setError(`Failed to save "${article.title}": ${err?.message || 'Unknown error'}`);
    } finally {
      setSavingIndex(null);
    }
  };

  // Save all articles
  const saveArticles = async () => {
    setSaving(true);
    setError(null); // Clear any previous errors

    const currentArticles = Array.isArray(articles) ? articles : [];

    try {
      // Check if user is logged in first
      const token = localStorage.getItem('cms_token');
      if (!token) {
        alert("You need to log in first. Redirecting to login page...");
        window.location.href = '/login';
        return;
      }

      await ContentStore.saveArticles(currentArticles);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error saving articles:", error);

      // Enhanced error handling with better user feedback
      if (error?.message?.includes('Authentication required')) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem('cms_token'); // Clear invalid token
          window.location.href = '/login';
        }, 2000);
      } else if (error?.message?.includes('401')) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem('cms_token'); // Clear invalid token
          window.location.href = '/login';
        }, 2000);
      } else if (error?.message?.includes('400')) {
        // Bad request - likely validation errors
        setError(`Invalid article data: ${error.message.replace('Error 400: ', '')}`);
      } else if (error?.message?.includes('500')) {
        // Server error
        setError(`Server error while saving article. Technical details: ${error.message.replace('Error 500: ', '')}`);
      } else {
        // Generic error with more details if available
        const errorMsg = error.message || "Unknown error";
        setError(`There was a problem saving your articles: ${errorMsg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Update a field on a specific article
  const updateArticleField = (index: number, field: keyof Article, value: any) => {
    setArticles(prev => prev.map((article, i) =>
      i === index ? { ...article, [field]: value } : article
    ));
  };

  // Generate search query based on article content
  const generateArticleSearchQuery = (index: number) => {
    const article = articles[index];
    if (!article?.content) return;

    const query = generateSearchQuery(article.content, article.title, 8);

    // We can store this as a hidden field or use it for tags
    console.log(`Generated search query for "${article.title}": ${query}`);

    // Auto-generate tags from the query if the user wants
    if (window.confirm(`Generate tags from the content? Suggested keywords: ${query}`)) {
      const keywordArray = query
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 5); // Take top 5 keywords

      const newTags = keywordArray.map(keyword => {
        const existingTag = tags.find(t => t.name.toLowerCase() === keyword.toLowerCase());
        if (existingTag) return existingTag;
        return {
          id: -Date.now() - Math.floor(Math.random() * 1000), // Temporary negative ID to indicate it's new
          name: keyword,
          slug: generateSlug(keyword)
        };
      });

      // Merge with existing tags if any
      const existingTags = article.tags || [];
      const mergedTags = [...existingTags];

      // Add new tags that don't already exist
      newTags.forEach(newTag => {
        const tagExists = existingTags.some(t => t.name.toLowerCase() === newTag.name.toLowerCase());
        if (!tagExists) {
          mergedTags.push(newTag);
        }
      });

      updateArticleField(index, 'tags', mergedTags);
    }
  };

  // Remove an article (Triggers Modal)
  const removeArticle = (index: number) => {
    setDeleteTargetIndex(index);
    setDeleteModalOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (deleteTargetIndex === null) return;

    const article = articles[deleteTargetIndex];

    // If it's saved in backend, call delete API
    if (article.id && !article.id.startsWith("temp-")) {
      setIsDeleting(true);
      try {
        await ContentStore.deleteArticle(article.id);
      } catch (err: any) {
        console.error("Failed to delete article:", err);
        setError("Failed to delete article. Please try again.");
        setIsDeleting(false);
        setDeleteModalOpen(false);
        setDeleteTargetIndex(null);
        return;
      }
      setIsDeleting(false);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 3000);
    }

    // Remove from local state
    setArticles(prev => prev.filter((_, i) => i !== deleteTargetIndex));
    if (editingIndex === deleteTargetIndex) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > deleteTargetIndex) {
      setEditingIndex(editingIndex - 1);
    }

    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  // Generate a slug from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .trim();
  };

  // Handle title change with automatic slug generation
  const handleTitleChange = (index: number, value: string) => {
    updateArticleField(index, 'title', value);

    // Auto-generate slug from title if slug is empty or matches the previous title's slug
    const article = articles[index];
    const currentSlug = article.slug || '';
    const previousTitle = article.title || '';
    const previousSlug = generateSlug(previousTitle);

    if (!currentSlug || currentSlug === previousSlug) {
      updateArticleField(index, 'slug', generateSlug(value));
    }
  };

  // Filter articles based on search
  // Ensure articles is always an array before filtering
  const articlesArray = Array.isArray(articles) ? articles : [];
  const filteredArticles = searchTerm.trim() === ''
    ? articlesArray
    : articlesArray.filter(article =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Render an article card in the list
  const renderArticleCard = (article: Article, index: number) => {
    const isEditing = editingIndex === index;

    return (
      <div
        key={article.id || index}
        className={`bg-slate-800/90 rounded-xl overflow-hidden border transition-all shadow-lg ${isEditing
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-slate-700/70 hover:border-slate-600'
          }`}
      >
        <div className="p-5">
          {/* Article header with title and actions */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <input
                id={`article-title-${index}`}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-lg font-medium placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Article Title"
                value={article.title || ''}
                onChange={e => handleTitleChange(index, e.target.value)}
              />
            </div>
            <div className="flex items-center ml-4 space-x-2">
              <button
                onClick={() => setEditingIndex(isEditing ? null : index)}
                className={`p-2 ${isEditing ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} rounded-lg transition-colors`}
                aria-label={isEditing ? "Collapse editor" : "Expand editor"}
                title={isEditing ? "Collapse editor" : "Expand editor"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isEditing ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                  ></path>
                </svg>
              </button>
              <button
                className="p-2 bg-red-500/70 hover:bg-red-500 rounded-lg transition-colors"
                onClick={() => removeArticle(index)}
                aria-label="Delete article"
                title="Delete article"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick info when collapsed */}
          {!isEditing && (
            <>
              {article.excerpt && (
                <div className="mt-3 text-slate-300 text-sm line-clamp-2">
                  {article.excerpt}
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {article.categories?.map(cat => (
                  <span
                    key={cat.id}
                    className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-lg"
                  >
                    {cat.name}
                  </span>
                ))}

                {article.tags?.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 bg-slate-600/50 text-slate-300 text-xs rounded-lg"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div className="mt-3 text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <div className="px-2 py-0.5 bg-slate-700/70 rounded-md">
                  {article.status || 'draft'}
                </div>
                {article.publishedAt && (
                  <div>
                    Published: {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                )}
                <div>
                  ID: {article.id ? article.id.substring(0, 8) : 'Not set'}
                </div>
                {article.status === 'published' && article.id && (
                  <ViewTracker
                    contentId={article.id}
                    contentType="article"
                    trackOnMount={false}
                    className="px-2 py-0.5 bg-green-800/30 text-green-300 rounded-md"
                  />
                )}
              </div>
            </>
          )}

          {/* Detailed editor when expanded */}
          {isEditing && (
            <div className="mt-5 space-y-6">
              {/* UUID Generator */}
              <div>
                <label htmlFor={`article-uuid-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Article ID
                </label>
                <UuidGenerator
                  value={article.id || ''}
                  onChange={(value) => updateArticleField(index, 'id', value)}
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor={`article-slug-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Slug (URL Path)
                </label>
                <div className="flex items-center">
                  <div className="bg-slate-600/50 px-3 py-2 rounded-l-lg text-slate-400 text-sm">
                    article/
                  </div>
                  <input
                    id={`article-slug-${index}`}
                    type="text"
                    className="flex-1 bg-slate-700/50 border-y border-r border-slate-600 rounded-r-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="article-url-slug"
                    value={article.slug || ''}
                    onChange={(e) => updateArticleField(index, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  />
                </div>
              </div>

              {/* Status and Publication Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`article-status-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    id={`article-status-${index}`}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={article.status || 'draft'}
                    onChange={(e) => updateArticleField(index, 'status', e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`article-date-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                    Publication Date
                  </label>
                  <input
                    id={`article-date-${index}`}
                    type="datetime-local"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateArticleField(index, 'publishedAt', e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label htmlFor={`article-featured-image-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Categories
                </label>
                <CategorySelector
                  categories={categories}
                  selectedCategories={article.categories?.map(cat => cat.id) || []}
                  onChange={(selectedIds) => {
                    const selectedCategories = categories.filter(cat =>
                      selectedIds.includes(cat.id)
                    );
                    updateArticleField(index, 'categories', selectedCategories);
                  }}
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor={`article-images-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Tags
                </label>
                <TagInput
                  value={article.tags?.map(tag => tag.name) || []}
                  onChange={(tagNames) => {
                    // Convert tag names to tag objects
                    const articleTags = tagNames.map(name => {
                      const existingTag = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
                      if (existingTag) return existingTag;
                      return {
                        id: -Date.now() - Math.floor(Math.random() * 1000),
                        name,
                        slug: generateSlug(name)
                      };
                    });
                    updateArticleField(index, 'tags', articleTags);
                  }}
                  suggestions={tags.map(tag => tag.name)}
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor={`article-excerpt-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Excerpt / Summary
                </label>
                <textarea
                  id={`article-excerpt-${index}`}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                  placeholder="Brief summary of the article..."
                  value={article.excerpt || ''}
                  onChange={(e) => updateArticleField(index, 'excerpt', e.target.value)}
                />
              </div>

              {/* Featured Image */}
              <div>
                <label htmlFor={`article-videos-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Featured Image
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {article.featuredImageUrl ? (
                    <div className="w-full sm:w-1/3 relative group">
                      <img
                        src={article.featuredImageUrl}
                        alt="Featured"
                        className="w-full h-40 object-cover rounded-lg border border-slate-700"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => updateArticleField(index, 'featuredImageUrl', '')}
                          className="p-2 bg-red-500 rounded-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full sm:w-1/3">
                      <MediaUploader
                        folder={`articles/${article.id}`}
                        images={[]}
                        onAdd={(image) => updateArticleField(index, 'featuredImageUrl', image.url)}
                        onUpdate={() => { }}
                        onRemove={() => { }}
                      />
                    </div>
                  )}

                  <div className="w-full sm:w-2/3">
                    <input
                      type="text"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                      placeholder="Or enter image URL directly"
                      value={article.featuredImageUrl || ''}
                      onChange={(e) => updateArticleField(index, 'featuredImageUrl', e.target.value)}
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      This image will be used as the main image for the article in listings and social shares
                    </p>
                  </div>
                </div>
              </div>

              {/* Rich Text Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={`article-content-${index}`} className="block text-xs font-medium text-slate-400" id={`article-content-label-${index}`}>
                    Content
                  </label>
                  <button
                    type="button"
                    onClick={() => generateArticleSearchQuery(index)}
                    disabled={!article.content}
                    className={`text-xs px-2 py-1 rounded ${article.content
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    aria-label="Generate tags from content"
                    title="Generate tags from content"
                  >
                    Auto-Generate Tags
                  </button>
                </div>
                <RichTextEditor
                  value={article.content || ''}
                  onChange={(value) => updateArticleField(index, 'content', value)}
                  placeholder="Write your article content here..."
                  aria-labelledby={`article-content-label-${index}`}
                />
              </div>

              {/* Article Images */}
              <div>
                <label htmlFor={`article-metadata-${index}`} className="block text-xs font-medium text-slate-400 mb-2">
                  Article Images
                </label>
                <MediaUploader
                  folder={`articles/${article.id}`}
                  images={article.images || []}
                  onAdd={(image) => {
                    const images = [...(article.images || []), image];
                    updateArticleField(index, 'images', images);
                  }}
                  onUpdate={(imageIndex, updatedImage) => {
                    if (!article.images) return;
                    const images = [...article.images];
                    images[imageIndex] = updatedImage;
                    updateArticleField(index, 'images', images);
                  }}
                  onRemove={(imageIndex) => {
                    if (!article.images) return;
                    const images = article.images.filter((_, i) => i !== imageIndex);
                    updateArticleField(index, 'images', images);
                  }}
                />
              </div>

              {/* Article Videos */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Article Videos
                </label>
                <VideoUploader
                  videos={article.videos || []}
                  onAdd={(video) => {
                    const videos = [...(article.videos || []), video];
                    updateArticleField(index, 'videos', videos);
                  }}
                  onUpdate={(videoIndex, updatedVideo) => {
                    if (!article.videos) return;
                    const videos = [...article.videos];
                    videos[videoIndex] = updatedVideo;
                    updateArticleField(index, 'videos', videos);
                  }}
                  onRemove={(videoIndex) => {
                    if (!article.videos) return;
                    const videos = article.videos.filter((_, i) => i !== videoIndex);
                    updateArticleField(index, 'videos', videos);
                  }}
                />
              </div>

              {/* Metadata Viewer - Show what data is preserved */}
              <div>
                <MetadataViewer
                  metadata={{
                    articleData: {
                      id: article.id,
                      title: article.title,
                      slug: article.slug,
                      status: article.status,
                      publishedAt: article.publishedAt
                    },
                    content: {
                      excerpt: article.excerpt,
                      featuredImageUrl: article.featuredImageUrl
                    },
                    categorization: {
                      categories: article.categories || [],
                      tags: article.tags || []
                    },
                    media: {
                      images: article.images || [],
                      videos: article.videos || []
                    }
                  }}
                  title="Article Metadata Preview"
                  className="mt-4"
                />
                {/* Bottom Save Button */}
                <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    ✕ Collapse
                  </button>

                  <div className="flex items-center gap-3">
                    {savedIndex === index && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Tersimpan!
                      </span>
                    )}
                    <button
                      onClick={() => saveOneArticle(index)}
                      disabled={savingIndex === index}
                      className={`px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${savingIndex === index
                        ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                        }`}
                    >
                      {savingIndex === index ? (
                        <>
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          {!article.id || article.id.startsWith('temp-') || article.id === '' ? 'Simpan Artikel Baru' : 'Simpan Perubahan'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Animated delete success toast ── */}
      <div
        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-sm transition-all duration-500 ease-out ${showDeleteSuccess
          ? 'opacity-100 translate-y-0 bg-red-900/90 border-red-500/60 text-red-300'
          : 'opacity-0 -translate-y-4 pointer-events-none bg-red-900/90 border-red-500/60 text-red-300'
          }`}
      >
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm">Artikel berhasil dihapus!</p>
          <p className="text-xs text-red-400/70">Data telah dihapus dari sistem.</p>
        </div>
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-red-500/50 rounded-b-xl"
          style={{
            width: showDeleteSuccess ? '0%' : '100%',
            transition: showDeleteSuccess ? 'width 3s linear' : 'none',
          }}
        />
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Articles saved successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Article Actions */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Article Management</h3>
                <p className="text-slate-400 text-sm">
                  Add, edit and manage your published articles and blog content.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={addNewArticle}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Article
                </button>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <div className="text-sm font-medium text-slate-400 mb-3">Articles Statistics</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{articlesArray.length}</div>
                    <div className="text-xs text-slate-400">Total Articles</div>
                  </div>
                  <div className="bg-slate-700/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {articles.filter(a => a.status === 'published').length}
                    </div>
                    <div className="text-xs text-slate-400">Published</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Article List */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredArticles.length === 0 && (
              <div className="bg-slate-800 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                {searchTerm ? (
                  <>
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-slate-300">No matching articles</h3>
                    <p className="text-slate-400 mt-1">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-slate-300">No articles yet</h3>
                    <p className="text-slate-400 mt-1">Click the "Add New Article" button to get started</p>
                  </>
                )}
              </div>
            )}

            {filteredArticles.map((article, index) => renderArticleCard(article, index))}
          </div>

          {filteredArticles.length > 0 && (
            <div className="mt-4 text-sm text-slate-400">
              Showing {filteredArticles.length} of {articlesArray.length} articles
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Article"
        itemName={deleteTargetIndex !== null && articles[deleteTargetIndex] ? articles[deleteTargetIndex].title || 'Untitled Article' : ''}
        onConfirm={confirmDeleteArticle}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTargetIndex(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
