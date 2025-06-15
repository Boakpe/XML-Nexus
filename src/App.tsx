import { useState } from 'react';
import { Github } from 'lucide-react';
import XMLInput from './components/XMLInput';
import Tabs from './components/Tabs';
import type { Tab } from './components/Tabs';
import GraphView from './components/GraphView';
import TreeView from './components/TreeView';
import { parseXML } from './utils/xmlParser';
import type { ParsedData } from './utils/types';

// A good default example for the user to start with
const defaultXML = `
<root name="My Project">
  <folder name="src">
    <file name="index.js" size="1.2KB" />
    <folder name="components">
      <file name="Button.tsx" />
      <file name="Modal.tsx" />
    </folder>
    <folder name="utils">
      <file name="api.js" />
    </folder>
  </folder>
  <folder name="public">
    <file name="index.html" />
    <file name="favicon.ico" />
  </folder>
  <file name="package.json" />
</root>
`.trim();

function App() {
  const [data, setData] = useState<ParsedData | null>(() => parseXML(defaultXML));
  const [activeTab, setActiveTab] = useState<Tab>('graph');
  const [error, setError] = useState<string | null>(null);

  const handleVisualize = (xml: string) => {
    setError(null);
    const parsed = parseXML(xml);
    if (parsed) {
      setData(parsed);
    } else {
      setData(null);
      setError("Failed to parse XML. Please check the format and try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-secondary font-sans">
      <header className="bg-primary text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">XML Graph Visualizer</h1>
        <a 
          href="https://github.com/your-username/d3-xml-visualizer"
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 text-slate-300 hover:text-accent transition-colors"
        >
          <Github size={20} />
          <span>View on GitHub</span>
        </a>
      </header>
      
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        <div className="w-1/3 flex flex-col">
          <XMLInput onVisualize={handleVisualize} initialValue={defaultXML} />
        </div>
        
        <div className="w-2/3 flex flex-col bg-white rounded-lg shadow-lg p-4">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-grow relative border border-slate-200 rounded-md bg-slate-50 overflow-hidden">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700 p-4 rounded-md">
                <p>{error}</p>
              </div>
            )}
            {!error && data && (
              <>
                {/* Conditionally render the active tab's component.
                    This ensures the inactive component is unmounted, freeing up resources. */}
                {activeTab === 'graph' && <GraphView data={data.graphData} />}
                {activeTab === 'tree' && <TreeView data={data.treeData} />}
              </>
            )}
            {!error && !data && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <p>Enter XML data and click Visualize to begin.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;