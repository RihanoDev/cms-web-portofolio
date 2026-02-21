import React, { useState } from 'react';

interface CategorySelectorProps {
  categories: { id: string | number; name: string }[];
  selectedCategories: (string | number)[];
  onChange: (categories: (string | number)[]) => void;
  maxSelections?: number;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategories,
  onChange,
  maxSelections = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const filteredCategories = categories.filter(
    (category) => category?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
  );
  
  const handleToggleCategory = (categoryId: string | number) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((id) => id !== categoryId));
    } else if (selectedCategories.length < maxSelections) {
      onChange([...selectedCategories, categoryId]);
    }
  };
  
  const isCategorySelected = (categoryId: string | number) => {
    return selectedCategories.includes(categoryId);
  };
  
  // Get selected category names
  const selectedCategoryNames = categories
    .filter(category => selectedCategories.includes(category.id))
    .map(category => category.name);
  
  return (
    <div className="w-full">
      <div className="relative">
        {/* Selection display field - shows count and opens dropdown */}
        <div 
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer flex items-center justify-between"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex-1 truncate">
            {selectedCategoryNames.length > 0 ? (
              <span>
                {selectedCategoryNames.length} {selectedCategoryNames.length === 1 ? 'category' : 'categories'} selected
              </span>
            ) : (
              <span className="text-slate-400">Select categories...</span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {/* Dropdown with search and selection options */}
        {isDropdownOpen && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
            {/* Search field */}
            <div className="p-3 border-b border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-slate-700/70 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // Prevent click from closing dropdown
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                    }}
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Selected categories summary */}
            {selectedCategoryNames.length > 0 && (
              <div className="px-3 py-2 border-b border-slate-700">
                <div className="text-xs font-medium text-slate-400 mb-2">Selected Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter((category) => selectedCategories.includes(category.id))
                    .map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCategory(category.id);
                        }}
                        className="bg-blue-600 text-white text-sm rounded-lg px-3 py-1 flex items-center gap-1"
                      >
                        <span>{category.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    ))}
                </div>
              </div>
            )}
            
            {/* Max selection warning */}
            {selectedCategories.length >= maxSelections && (
              <div className="px-3 py-2 text-xs text-amber-400 border-b border-slate-700">
                Maximum category limit reached ({maxSelections})
              </div>
            )}
            
            {/* Categories list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategory(category.id);
                    }}
                    className={`w-full text-left px-4 py-2 border-b border-slate-700 last:border-b-0 hover:bg-slate-700 transition-colors ${
                      isCategorySelected(category.id)
                        ? 'bg-slate-700 text-blue-400'
                        : 'text-white'
                    }`}
                    disabled={selectedCategories.length >= maxSelections && !isCategorySelected(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {isCategorySelected(category.id) && (
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-slate-400 px-4 py-3 text-center">No categories found</div>
              )}
            </div>
            
            {/* Close button */}
            <div className="p-3 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Display selected count when dropdown is closed */}
      {!isDropdownOpen && selectedCategoryNames.length > 0 && (
        <div className="mt-2 text-sm text-slate-400">
          Selected: <span className="text-blue-400">{selectedCategoryNames.join(", ")}</span>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
