import React, { useState, useEffect } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  maxTags = 10,
}) => {
  const [input, setInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Filter suggestions based on input
  useEffect(() => {
    if (input.trim() !== '') {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, suggestions, value]);
  
  // Add a tag to the list
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
    }
    
    setInput('');
  };
  
  // Remove a tag from the list
  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };
  
  // Handle keyboard events in the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsEditMode(false);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      const firstSuggestion = document.querySelector('.tag-suggestion');
      if (firstSuggestion) {
        (firstSuggestion as HTMLElement).focus();
      }
    }
  };
  
  // Handle keyboard events in the suggestion buttons
  const handleSuggestionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, suggestion: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(suggestion);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevSibling = e.currentTarget.previousElementSibling;
      if (prevSibling) {
        (prevSibling as HTMLElement).focus();
      } else {
        document.getElementById('tag-input')?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextSibling = e.currentTarget.nextElementSibling;
      if (nextSibling) {
        (nextSibling as HTMLElement).focus();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      document.getElementById('tag-input')?.focus();
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      // Focus the input when entering edit mode
      setTimeout(() => {
        document.getElementById('tag-input')?.focus();
      }, 100);
    }
  };
  
  return (
    <div className="relative">
      {/* Compact view when not in edit mode */}
      {!isEditMode && (
        <button 
          type="button"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer flex items-center justify-between"
          onClick={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleEditMode();
            }
          }}
          aria-label={value.length > 0 ? `Edit ${value.length} tags` : "Add tags"}
        >
          <div className="flex-1 truncate text-left">
            {value.length > 0 ? (
              <span>
                {value.length} {value.length === 1 ? 'tag' : 'tags'} added
              </span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          <svg 
            className="w-5 h-5 text-slate-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </button>
      )}
      
      {/* Show tag summary when not in edit mode */}
      {!isEditMode && value.length > 0 && (
        <div className="mt-2 text-sm text-slate-400">
          <span className="text-blue-400">{value.join(", ")}</span>
        </div>
      )}
      
      {/* Detailed edit mode */}
      {isEditMode && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          {/* Header with close button */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-medium text-white">Edit Tags</h3>
            <button
              type="button"
              onClick={toggleEditMode}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Selected tags */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {value.length > 0 ? (
                value.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-blue-600/70 hover:bg-blue-600 text-white text-sm rounded-md px-2 py-1 gap-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white/70 hover:text-white focus:outline-none"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm">No tags added yet</div>
              )}
            </div>
            
            {value.length >= maxTags && (
              <div className="text-xs text-amber-400">
                Maximum tags limit reached ({maxTags})
              </div>
            )}
          </div>
          
          {/* Tag input */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex">
              <input
                id="tag-input"
                type="text"
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-l-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type a tag and press Enter..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                onBlur={handleInputBlur}
                disabled={value.length >= maxTags}
              />
              <button
                type="button"
                onClick={() => input.trim() !== '' && addTag(input)}
                disabled={input.trim() === '' || value.length >= maxTags}
                className={`px-4 py-2 rounded-r-lg ${
                  input.trim() === '' || value.length >= maxTags
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Add
              </button>
            </div>
            
            {/* Suggestions */}
            {showSuggestions && (
              <ul className="mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="tag-suggestion block w-full text-left px-4 py-2 cursor-pointer hover:bg-slate-600 focus:bg-slate-600 focus:outline-none border-b border-slate-600 last:border-b-0"
                    onClick={() => addTag(suggestion)}
                    onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </ul>
            )}
          </div>
          
          {/* Common suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4">
              <div className="text-xs font-medium text-slate-400 mb-2">Suggested Tags:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions
                  .filter(tag => !value.includes(tag))
                  .slice(0, 10)
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={value.length >= maxTags}
                      className={`text-sm rounded-md px-2 py-1 ${
                        value.length >= maxTags
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;
