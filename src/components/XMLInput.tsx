import React, { useState, useRef, useEffect } from 'react';
import { HardDriveUpload } from "lucide-react";
import { Github } from 'lucide-react';

// CodeMirror imports
import { EditorView, basicSetup } from "codemirror";
import { xml as xmlLang } from "@codemirror/lang-xml";

interface XMLInputProps {
  onVisualize: (xml: string) => void;
  initialValue: string;
}

const XMLInput: React.FC<XMLInputProps> = ({ onVisualize, initialValue }) => {
  // This state will hold the editor's content. It's kept in sync by the editor's listener.
  const [xml, setXml] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  // --- EFFECT 1: Create the editor instance (runs only once) ---
  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const view = new EditorView({
        doc: initialValue, // Use initialValue for the very first creation
        extensions: [
          basicSetup,
          xmlLang(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              // When the user types, update the React state
              const newValue = update.state.doc.toString();
              setXml(newValue);
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%",
            },
            ".cm-scroller": {
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: "14px",
            },
            ".cm-focused": {
              outline: "2px solid rgb(14 165 233)",
              outlineOffset: "2px",
            },
          }),
        ],
        parent: editorRef.current,
      });

      editorViewRef.current = view;
    }

    // Cleanup function to destroy the editor when the component unmounts
    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    };
    // The empty dependency array [] ensures this effect runs ONLY ONCE on mount.
  }, []); 

  // --- EFFECT 2: Sync external changes (from props) to the editor ---
  useEffect(() => {
    // Check if the editor instance exists and if the prop value is different from the editor's current content
    if (editorViewRef.current && initialValue !== editorViewRef.current.state.doc.toString()) {
      // If they are different, dispatch a transaction to update the editor's content
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: initialValue,
        },
      });
    }
    // This effect runs whenever the `initialValue` prop changes.
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVisualize(xml);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">XML Data</h2>
        <a 
          href="https://github.com/your-username/d3-xml-visualizer"
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 text-slate-600 hover:text-accent transition-colors"
        >
          <Github size={20} />
          <span>View on GitHub</span>
        </a>
      </div>
      
      <div
        ref={editorRef}
        className="flex-grow w-full border border-slate-300 rounded-md overflow-auto bg-slate-50"
        style={{ minHeight: "200px" }}
      />
      <button
        type="submit"
        className="mt-4 w-full flex items-center justify-center bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-sky-500 bg-sky-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        <HardDriveUpload className="mr-2 h-5 w-5" />
        Visualize
      </button>
    </form>
  );
};

export default XMLInput;