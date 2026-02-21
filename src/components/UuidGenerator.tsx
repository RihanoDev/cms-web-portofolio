import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UuidGeneratorProps {
  value: string;
  onChange: (value: string) => void;
  regenerate?: boolean;
}

const UuidGenerator: React.FC<UuidGeneratorProps> = ({ 
  value, 
  onChange,
  regenerate = true 
}) => {
  const [copied, setCopied] = useState(false);
  
  const generateUuid = () => {
    const newUuid = uuidv4();
    onChange(newUuid);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Generate UUID on initial render if none provided
  React.useEffect(() => {
    if (!value && regenerate) {
      generateUuid();
    }
  }, [value, regenerate]);
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 font-mono text-sm"
        />
        
        <button
          type="button"
          onClick={copyToClipboard}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
          )}
        </button>
        
        {regenerate && (
          <button
            type="button"
            onClick={generateUuid}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
            title="Generate new UUID"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        )}
      </div>
      
      <p className="text-xs text-slate-400">
        This UUID will be used as the unique identifier for this content.
      </p>
    </div>
  );
};

export default UuidGenerator;
