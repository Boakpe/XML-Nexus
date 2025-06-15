import type { D3TreeNode, GraphData, D3GraphNode, D3GraphLink, ParsedData } from './types';

// Helper to extract attributes from an XML element
const getAttributes = (element: Element): { [key: string]: string } => {
  const attrs: { [key: string]: string } = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs[attr.name] = attr.value;
  }
  return attrs;
};

export const parseXML = (xmlString: string): ParsedData | null => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length) {
      console.error("Error parsing XML");
      throw new Error("Invalid XML format");
    }

    const rootElement = xmlDoc.documentElement;
    if (!rootElement) return null;

    let nodeIdCounter = 0;
    const nodes: D3GraphNode[] = [];
    const links: D3GraphLink[] = [];

    const traverse = (element: Element, parentId?: string): D3TreeNode => {
      const currentId = `node-${nodeIdCounter++}`;
      
      const nodeAttributes = getAttributes(element);

      // For hierarchical tree data
      const treeNode: D3TreeNode = {
        name: element.tagName,
        attributes: nodeAttributes,
        children: [],
      };

      // For flat graph data
      const graphNode: D3GraphNode = {
        id: currentId,
        name: element.tagName,
        attributes: nodeAttributes,
      };
      nodes.push(graphNode);

      if (parentId) {
        links.push({ source: parentId, target: currentId });
      }

      const children = Array.from(element.children);
      if (children.length > 0) {
        treeNode.children = children.map(child => traverse(child, currentId));
      } else {
        // If there are no element children, check for text content
        const textContent = element.textContent?.trim();
        if (textContent) {
          treeNode.children = [{ name: `"${textContent}"`, attributes: {}, children: [] }];
        }
      }

      return treeNode;
    };

    const treeData = traverse(rootElement);
    const graphData: GraphData = { nodes, links };

    return { treeData, graphData };

  } catch (error) {
    console.error("XML parsing failed:", error);
    return null;
  }
};