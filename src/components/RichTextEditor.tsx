import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);

  // Keep onChange ref up to date without re-initializing Quill
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Quill once
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      if (quillRef.current) return;

      // Create editor div inside the container
      const editorEl = document.createElement('div');
      containerRef.current.appendChild(editorEl);

      const quill = new Quill(editorEl, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['code-block'],
            ['clean'],
          ],
        },
        formats: [
          'header',
          'bold', 'italic', 'underline', 'strike', 'blockquote',
          'list', 'indent',
          'color', 'background',
          'align',
          'link', 'image', 'video',
          'code-block',
        ],
      });

      // Set initial value
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      // Listen for text changes
      quill.on('text-change', () => {
        isInternalChange.current = true;
        const html = quill.getSemanticHTML();
        onChangeRef.current(html);
        isInternalChange.current = false;
      });

      quill.on('selection-change', (range: any) => {
        setFocused(range !== null);
      });

      quillRef.current = quill;
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to initialize Quill:', err);
      setError('Failed to load editor. Please refresh the page.');
    }

    // Cleanup on unmount
    return () => {
      if (containerRef.current) {
        // Remove the toolbar and editor that Quill added
        containerRef.current.innerHTML = '';
      }
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into Quill (only when not typing inside)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || isInternalChange.current) return;

    const currentHtml = quill.getSemanticHTML();
    if (currentHtml !== value && !quill.hasFocus()) {
      quill.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  if (error) {
    return (
      <div className="w-full bg-red-900/20 border border-red-500/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor rounded-lg overflow-hidden border ${focused ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-600'}`}>
      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #475569;
          background-color: rgba(51, 65, 85, 0.7);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }

        .rich-text-editor .ql-container.ql-snow {
          border: none;
          min-height: 200px;
          background-color: rgba(30, 41, 59, 0.7);
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        .rich-text-editor .ql-editor {
          min-height: 200px;
          color: #e2e8f0;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #64748b;
          font-style: normal;
        }

        .rich-text-editor .ql-picker,
        .rich-text-editor .ql-picker-label {
          color: #cbd5e1;
        }

        .rich-text-editor .ql-stroke {
          stroke: #cbd5e1;
        }

        .rich-text-editor .ql-fill {
          fill: #cbd5e1;
        }

        .rich-text-editor .ql-picker-options {
          background-color: #1e293b;
          border-color: #475569 !important;
          color: #e2e8f0;
        }

        .rich-text-editor .ql-tooltip {
          background-color: #1e293b;
          border-color: #475569;
          color: #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          z-index: 100;
        }

        .rich-text-editor .ql-tooltip input[type=text] {
          background-color: #0f172a;
          border-color: #475569;
          color: #e2e8f0;
        }

        .rich-text-editor button:hover .ql-stroke,
        .rich-text-editor button.ql-active .ql-stroke {
          stroke: #60a5fa;
        }

        .rich-text-editor button:hover .ql-fill,
        .rich-text-editor button.ql-active .ql-fill {
          fill: #60a5fa;
        }

        .rich-text-editor button:hover,
        .rich-text-editor button.ql-active {
          color: #60a5fa;
        }

        .rich-text-editor .ql-picker-label:hover,
        .rich-text-editor .ql-picker-item:hover {
          color: #60a5fa;
        }

        .rich-text-editor .ql-picker-label.ql-active,
        .rich-text-editor .ql-picker-item.ql-selected {
          color: #60a5fa;
        }
      `}</style>

      {!isLoaded && (
        <div className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-4 min-h-[250px] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading editor...</div>
        </div>
      )}

      {/* Quill mounts its toolbar + editor into this div */}
      <div
        ref={containerRef}
        className={!isLoaded ? 'absolute h-0 overflow-hidden opacity-0 pointer-events-none' : ''}
      />
    </div>
  );
};

export default RichTextEditor;
