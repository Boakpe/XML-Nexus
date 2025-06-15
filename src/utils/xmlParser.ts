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

    const traverse = (element: Element, parentId: string | null, level: number): D3TreeNode => {
      const currentId = `node-${nodeIdCounter++}`;
      
      const nodeAttributes = getAttributes(element);
      const childElements = Array.from(element.children);

      // Determine node type based on element characteristics
      let nodeType: D3GraphNode['type'] = 'element';
      if (level === 0) nodeType = 'root';
      else if (childElements.length === 0) nodeType = 'leaf';
      else if (childElements.length > 3) nodeType = 'container';

      // Create node label
      let label = element.tagName;
      const attributeStrings = Object.entries(nodeAttributes).map(([k, v]) => `${k}="${v}"`);
      if (attributeStrings.length > 0) {
        label += `\n[${attributeStrings.join(', ')}]`;
      }
      
      const textContent = Array.from(element.childNodes)
        .filter(child => child.nodeType === Node.TEXT_NODE)
        .map(child => child.textContent?.trim())
        .filter(text => text && text.length > 0)
        .join(' ');
        
      if (textContent && childElements.length === 0) {
        const truncatedText = textContent.length > 50 
          ? textContent.substring(0, 47) + '...' 
          : textContent;
        label += `\n"${truncatedText}"`;
      }
      
      // For flat graph data
      const graphNode: D3GraphNode = {
        id: currentId,
        label: label,
        tagName: element.tagName,
        type: nodeType,
        level: level,
        attributes: nodeAttributes,
      };
      nodes.push(graphNode);

      if (parentId) {
        links.push({ source: parentId, target: currentId });
      }

      // For hierarchical tree data
      const treeNode: D3TreeNode = {
        name: element.tagName,
        attributes: nodeAttributes,
        children: childElements.map(child => traverse(child, currentId, level + 1)),
      };

      // If there are no element children, add text content as a child for the tree view
      if (textContent && childElements.length === 0) {
        treeNode.children?.push({ name: `"${textContent}"`, attributes: {}, children: [] });
      }

      return treeNode;
    };

    const treeData = traverse(rootElement, null, 0);
    const graphData: GraphData = { nodes, links };

    return { treeData, graphData };

  } catch (error) {
    console.error("XML parsing failed:", error);
    return null;
  }
};