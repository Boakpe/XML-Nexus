import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from "lucide-react";
import { Github } from 'lucide-react';

// CodeMirror imports
import { EditorView, basicSetup } from "codemirror";
import { xml as xmlLang } from "@codemirror/lang-xml";
import { tags } from '@lezer/highlight';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';

interface XMLInputProps {
  onVisualize: (xml: string) => void;
  initialValue: string;
}

// Custom modern theme for CodeMirror
const modernTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#f8fafc" // bg-slate-50
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: "14px",
  },
  ".cm-gutters": {
    backgroundColor: "#f1f5f9", // bg-slate-100
    borderRight: "1px solid #e2e8f0" // border-slate-200
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-content": {
    caretColor: "#2563eb", // blue-600
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#dbeafe", // blue-100
  },
  ".cm-activeLine": {
    backgroundColor: "#eef2ff", // indigo-50
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#e0e7ff", // indigo-100
  }
});

// Custom syntax highlighting
const modernHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: '#6366f1' }, // indigo-500
    { tag: tags.atom, color: '#1d4ed8' }, // blue-700
    { tag: tags.number, color: '#059669' }, // emerald-600
    { tag: tags.propertyName, color: '#4338ca' }, // indigo-700
    { tag: tags.attributeName, color: '#0f766e' }, // teal-700
    { tag: tags.string, color: '#be123c' }, // rose-700
    { tag: tags.comment, color: '#64748b', fontStyle: 'italic' }, // slate-500
    { tag: tags.meta, color: '#475569' }, // slate-600
    { tag: tags.tagName, color: '#1d4ed8' }, // blue-700
]);


const XMLInput: React.FC<XMLInputProps> = ({ onVisualize, initialValue }) => {
  const [xml, setXml] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (editorRef.current && !editorViewRef.current) {
      const view = new EditorView({
        doc: initialValue,
        extensions: [
          basicSetup,
          xmlLang(),
          modernTheme,
          syntaxHighlighting(modernHighlightStyle),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setXml(update.state.doc.toString());
            }
          }),
        ],
        parent: editorRef.current,
      });
      editorViewRef.current = view;
    }
    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
        editorViewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorViewRef.current && initialValue !== editorViewRef.current.state.doc.toString()) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: initialValue,
        },
      });
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVisualize(xml);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full bg-white rounded2-xl shadow2-sm border border-slate-200"
    >
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">XML Data Input</h2>
         <a
          href="https://github.com/Boakpe/XML-Nexus"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-blue-500 transition-colors"
          aria-label="View on GitHub"
        >
          <Github size={24} />
        </a>
      </div>
      
      <div
        ref={editorRef}
        className="flex-grow w-full overflow-auto focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 rounded2-b-xl transition-shadow2"
        style={{ minHeight: "200px" }}
      />
      <div className="p-4 border-t border-slate-200">
        <button
          type="submit"
          className="w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold py-2.5 px-4 rounded2-lg shadow2-sm hover:shadow2-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Visualize
        </button>
      </div>
    </form>
  );
};

export default XMLInput;