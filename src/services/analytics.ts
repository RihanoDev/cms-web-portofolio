// Implement view tracking functionality
import { api } from './api';

// Type alias for content types
type ContentType = 'article' | 'project' | 'page';

interface TrackViewParams {
  contentId: number | string; // Article or Project ID
  contentType: ContentType;
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Track a view for a specific content item
 */
export const trackContentView = async (params: TrackViewParams): Promise<boolean> => {
  try {
    console.log('Tracking content view:', params);
    await api.post('/views/track', params);
    console.log('View tracked successfully');
    return true;
  } catch (error) {
    console.error('Failed to track content view:', error);
    return false;
  }
};

/**
 * Get view count for a specific content item
 */
export const getContentViews = async (
  contentId: number | string,
  contentType: ContentType
): Promise<number> => {
  try {
    console.log(`Fetching view count for ${contentType} with ID ${contentId}`);
    const response = await api.get(`/views/count?contentId=${contentId}&contentType=${contentType}`);
    console.log('View count response:', response.data);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error('Failed to get content views:', error);
    return 0;
  }
};

/**
 * Get view analytics data for content (by day/week/month)
 */
export const getViewsAnalytics = async (
  contentId: number | string,
  contentType: ContentType,
  period: 'day' | 'week' | 'month' = 'day',
  limit: number = 30
): Promise<{ date: string; count: number }[]> => {
  try {
    const url = `/views/analytics?contentId=${contentId}&contentType=${contentType}&period=${period}&limit=${limit}`;
    const response = await api.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to get views analytics:', error);
    return [];
  }
};

/**
 * Generate an SEO-friendly search query based on article content
 * This helps in creating relevant search terms for articles
 */
export const generateSearchQuery = (content: string, title: string = '', maxTerms: number = 5): string => {
  if (!content) return title;

  // Remove HTML tags if present
  const plainText = content.replace(/<[^>]+>/g, ' ');

  // Remove special characters, extra spaces, etc.
  const cleanText = plainText
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Get all words
  const words = cleanText.split(' ');

  // Remove common stop words (common English words)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'to', 'of', 'in', 'on', 'for', 'with', 'by', 'at', 'this', 'that',
    'these', 'those', 'it', 'its', 'from', 'as', 'be', 'been', 'being'
  ]);

  // Filter out stop words and short words, convert to lowercase
  const significantWords = words
    .filter(word => !stopWords.has(word.toLowerCase()) && word.length > 3)
    .map(word => word.toLowerCase());

  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  significantWords.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  // Sort words by frequency
  const sortedWords = Object.keys(wordFrequency).sort((a, b) => {
    return wordFrequency[b] - wordFrequency[a];
  });

  // Take top N most frequent words
  const topTerms = sortedWords.slice(0, maxTerms);

  // If title is provided, include it in the query
  const queryTerms = title ? [title, ...topTerms] : topTerms;

  // Join terms with space for a search query
  return queryTerms.join(' ');
};

export default {
  trackContentView,
  getContentViews,
  getViewsAnalytics,
  generateSearchQuery
};
