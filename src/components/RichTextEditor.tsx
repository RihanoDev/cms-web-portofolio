import React, { useState, useCallback, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';

interface QuillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<QuillProps> = ({ value, onChange, placeholder = 'Write something...' }) => {
  const editorRef = useRef<any>(null);
  const [quill, setQuill] = React.useState<any>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  useEffect(() => {
    // Dynamically import React Quill to prevent SSR issues
    import('react-quill').then((reactQuill) => {
      const ReactQuill = reactQuill.default;

      // Define toolbar options
      const modules = {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          [{ 'code-block': true }],
          ['clean'],
        ],
      };

      const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'indent',
        'color', 'background',
        'align',
        'link', 'image', 'video',
        'code-block',
      ];

      setQuill({
        ReactQuill,
        modules,
        formats,
      });

      setIsLoaded(true);
    });
  }, []);

  // This effect is for handling the value prop changes
  useEffect(() => {
    if (editorRef.current?.getEditor) {
      const editor = editorRef.current.getEditor();
      if (editor && value !== editor.root.innerHTML) {
        // Only set the value if it's different from the editor's current content
        if (editor.hasFocus()) {
          // If the editor has focus, we should not set the value as it would reset the cursor position
          return;
        }
        editor.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value]);

  if (!isLoaded || !quill) {
    return (
      <div className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-4 min-h-[250px] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading editor...</div>
      </div>
    );
  }

  const { ReactQuill, modules, formats } = quill;

  return (
    <div className={`rich-text-editor rounded-lg ${focused ? 'ring-2 ring-blue-500 border-transparent' : ''}`}>
      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #475569;
          background-color: rgba(51, 65, 85, 0.5);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        
        .rich-text-editor .ql-container.ql-snow {
          border: none;
          min-height: 200px;
          background-color: rgba(30, 41, 59, 0.5);
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 200px;
          color: white;
          font-size: 1rem;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        .rich-text-editor .ql-picker {
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
        }
        
        .rich-text-editor .ql-tooltip {
          background-color: #1e293b;
          border-color: #475569;
          color: white;
        }
        
        .rich-text-editor .ql-tooltip input[type=text] {
          background-color: #0f172a;
          border-color: #475569;
          color: white;
        }
      `}</style>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="bg-slate-700/50 border border-slate-600 rounded-lg text-white"
      />
    </div>
  );
};

export default RichTextEditor;
