// For the Tree Layout (hierarchical)
export interface D3TreeNode {
  name: string;
  attributes: { [key: string]: string };
  children?: D3TreeNode[];
}

// For the Force-Directed Graph (flat)
export interface D3GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  attributes: { [key: string]: string };
}

export interface D3GraphLink extends d3.SimulationLinkDatum<D3GraphNode> {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: D3GraphNode[];
  links: D3GraphLink[];
}

// Combined result from the parser
export interface ParsedData {
  treeData: D3TreeNode;
  graphData: GraphData;
}

