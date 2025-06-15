import React, { useState } from "react";
import { HardDriveUpload } from "lucide-react";

interface XMLInputProps {
  onVisualize: (xml: string) => void;
  initialValue: string;
}

const XMLInput: React.FC<XMLInputProps> = ({ onVisualize, initialValue }) => {
  const [xml, setXml] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVisualize(xml);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-primary mb-4">XML Data</h2>

      <textarea
        value={xml}
        onChange={(e) => setXml(e.target.value)}
        className="flex-grow w-full p-3 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-accent focus:outline-none font-mono text-sm bg-slate-50"
        placeholder="Paste your XML here..."
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
