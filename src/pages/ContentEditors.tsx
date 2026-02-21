import React, { useState } from 'react'
import TagsManager from './TagsManager'
import CategoriesManager from './CategoriesManager'
import DataAnalysis from '../components/DataAnalysis'
import ErrorBoundary from '../components/ErrorBoundary'

type ContentTab = 'tags' | 'categories' | 'data-analysis';

export default function ContentEditors() {
  const [activeTab, setActiveTab] = useState<ContentTab>('data-analysis');

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'tags':
        return <TagsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'data-analysis':
        return <DataAnalysis />;
      default:
        return <DataAnalysis />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto" aria-label="Content Tabs">
          <button
            onClick={() => setActiveTab('data-analysis')}
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'data-analysis'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
          >
            📊 Data Analysis
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 dark:text-gray-400 dark:hover:border-gray-600'
            }`}
          >
            Categories
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="py-2">
        <ErrorBoundary>
          {renderActiveComponent()}
        </ErrorBoundary>
      </div>
    </div>
  )
}
