// src/App.tsx

import { useState, useMemo } from "react";
import { CodeXml, AlertTriangle } from "lucide-react";
import XMLInput from "./components/XMLInput";
import Tabs from "./components/Tabs";
import type { Tab } from "./components/Tabs";
import GraphView from "./components/GraphView";
import TreeView from "./components/TreeView";
import { parseXML } from "./utils/xmlParser";
import type { ParsedData } from "./utils/types";

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
  const [xmlString, setXmlString] = useState<string>(defaultXML);
  const [activeTab, setActiveTab] = useState<Tab>("graph");
  const [error, setError] = useState<string | null>(null);

  // Memoize parsing to avoid re-calculating on every render
  const data = useMemo<ParsedData | null>(() => {
    try {
      const parsed = parseXML(xmlString);
      if (parsed) {
        setError(null);
        return parsed;
      }
      setError("Failed to parse XML. Please check the format.");
      return null;
    } catch (e) {
      setError("An unexpected error occurred during XML parsing.");
      return null;
    }
  }, [xmlString]);

  // The onVisualize function now just updates the string, triggering the memoized parser
  const handleVisualize = (xml: string) => {
    setXmlString(xml);
  };

  const stats = useMemo(() => {
    if (!data) return null;
    const { nodes, links } = data.graphData;
    return {
      totalNodes: nodes.length,
      totalEdges: links.length,
      maxDepth: Math.max(0, ...nodes.map((node) => node.level)),
      leafNodes: nodes.filter(
        (node) => !links.some((link) => link.source === node.id)
      ).length,
    };
  }, [data]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
      <main className="flex-grow flex p-4 gap-4 overflow-hidden">
        {/* Left Column */}
        <div className="w-1/3 flex flex-col gap-4 min-w-[350px]">
          <div className="flex-grow flex flex-col min-h-0">
            <XMLInput onVisualize={handleVisualize} initialValue={defaultXML} />
          </div>

          {stats && (
            <div className="bg-white rounded2-xl shadow2-sm border border-slate-200 p-4">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded2-lg p-3">
                  <p className="text-sm text-slate-500">Total Nodes</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.totalNodes}
                  </p>
                </div>
                <div className="rounded2-lg p-3">
                  <p className="text-sm text-slate-500">Total Edges</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.totalEdges}
                  </p>
                </div>
                <div className="rounded2-lg p-3">
                  <p className="text-sm text-slate-500">Max Depth</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.maxDepth}
                  </p>
                </div>
                <div className="rounded2-lg p-3">
                  <p className="text-sm text-slate-500">Leaf Nodes</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {stats.leafNodes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-2/3 flex flex-col bg-white rounded2-xl shadow2-sm border border-slate-200 p-4">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-grow relative bg-slate-100/70 rounded2-lg overflow-hidden">
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-600 p-4">
                <AlertTriangle className="h-8 w-8" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            {!error && data && (
              <>
                {activeTab === "graph" && <GraphView data={data.graphData} />}
                {activeTab === "tree" && <TreeView data={data.treeData} />}
              </>
            )}
            {!error && !data && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                <CodeXml className="h-8 w-8" />
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
