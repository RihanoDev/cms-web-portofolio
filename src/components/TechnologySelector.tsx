import React, { useState } from 'react';

// Simple technology item component for the selected technologies
interface TechnologyItemProps {
  name: string;
  onRemove: () => void;
}

const TechnologyItem: React.FC<TechnologyItemProps> = ({ name, onRemove }) => {
  return (
    <div className="flex items-center bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg px-3 py-2 gap-2">
      <span className="text-sm">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-purple-400 hover:text-white focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// Two interfaces for compatibility
interface StringTechnologySelectorProps {
  technologies: string[];
  selectedTechnologies: string[];
  onChange: (technologies: string[]) => void;
}

interface ObjectTechnologySelectorProps {
  technologies: { id: string | number; name: string; icon?: string }[];
  selectedTechnologies: (string | number)[];
  onChange: (technologies: (string | number)[]) => void;
}

type TechnologySelectorProps = StringTechnologySelectorProps | ObjectTechnologySelectorProps;

const TechnologySelector: React.FC<TechnologySelectorProps> = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Determine if we're working with string array or object array
  const isStringArray = Array.isArray(props.technologies) &&
    (props.technologies.length === 0 || typeof props.technologies[0] === 'string');

  // Handle string arrays
  if (isStringArray) {
    const { technologies, selectedTechnologies, onChange } = props as StringTechnologySelectorProps;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredTechnologies = technologies.filter(
      (tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTechnologies.includes(tech)
    );

    const handleSelectTechnology = (tech: string) => {
      onChange([...selectedTechnologies, tech]);
      setSearchTerm('');
    };

    const handleRemoveTechnology = (tech: string) => {
      onChange(selectedTechnologies.filter((t) => t !== tech));
    };

    return (
      <div className="w-full">
        {/* Main selection field */}
        <div
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer flex items-center justify-between"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex-1 truncate">
            {selectedTechnologies.length > 0 ? (
              <span>
                {selectedTechnologies.length} {selectedTechnologies.length === 1 ? 'technology' : 'technologies'} selected
              </span>
            ) : (
              <span className="text-slate-400">Select technologies...</span>
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

        {/* Display selected items summary when dropdown is closed */}
        {!isDropdownOpen && selectedTechnologies.length > 0 && (
          <div className="mt-2 text-sm text-slate-400">
            Selected: <span className="text-purple-300">{selectedTechnologies.join(", ")}</span>
          </div>
        )}

        {/* Dropdown panel */}
        {isDropdownOpen && (
          <div className="mt-1 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-30">
            {/* Search field */}
            <div className="p-3 border-b border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-slate-700/70 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Selected technologies */}
            {selectedTechnologies.length > 0 && (
              <div className="px-3 py-2 border-b border-slate-700">
                <div className="text-xs font-medium text-slate-400 mb-2">Selected Technologies:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTechnologies.map((tech) => (
                    <TechnologyItem
                      key={tech}
                      name={tech}
                      onRemove={() => handleRemoveTechnology(tech)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Technologies list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredTechnologies.length > 0 ? (
                filteredTechnologies.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center justify-between border-b border-slate-700 last:border-b-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTechnology(tech);
                    }}
                  >
                    <span>{tech}</span>
                    <svg
                      className="w-5 h-5 text-green-500 opacity-0 hover:opacity-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                ))
              ) : searchTerm.trim() !== '' ? (
                <div className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTechnology(searchTerm.trim());
                    }}
                    className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg py-2 text-sm border border-dashed border-purple-500/50 transition-all font-medium"
                  >
                    + Add new technology: "{searchTerm}"
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-slate-400">
                  No matching technologies found
                </div>
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
    );
  }

  // Handle object arrays (original implementation)
  const { technologies, selectedTechnologies, onChange } = props as ObjectTechnologySelectorProps;

  const filteredTechnologies = technologies.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTechnologies.includes(tech.id)
  );

  const handleSelectTechnology = (techId: string | number) => {
    onChange([...selectedTechnologies, techId]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveTechnology = (techId: string | number) => {
    onChange(selectedTechnologies.filter((id) => id !== techId));
  };

  const selectedTechItems = technologies
    .filter((tech) => selectedTechnologies.includes(tech.id))
    .map((tech) => ({
      id: tech.id,
      name: tech.name,
      icon: tech.icon,
    }));

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTechItems.length > 0 ? (
          selectedTechItems.map((tech) => (
            <TechnologyItem
              key={tech.id.toString()}
              name={tech.name}
              onRemove={() => handleRemoveTechnology(tech.id)}
            />
          ))
        ) : (
          <div className="text-slate-400 text-sm py-2">No technologies selected</div>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search technologies..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay hiding dropdown to allow clicks to register
            setTimeout(() => setShowDropdown(false), 200);
          }}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            onClick={() => {
              setSearchTerm('');
              setShowDropdown(false);
            }}
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map((tech) => (
                <button
                  key={tech.id.toString()}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-slate-700 flex items-center gap-2 border-b border-slate-700 last:border-b-0"
                  onClick={() => handleSelectTechnology(tech.id)}
                >
                  {tech.icon && (
                    <img src={tech.icon} alt={`${tech.name} icon`} className="w-5 h-5" />
                  )}
                  <span>{tech.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-slate-400">
                No matching technologies found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnologySelector;
