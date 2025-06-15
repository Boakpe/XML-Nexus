import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Define the types
interface D3TreeNode {
  name: string;
  children?: D3TreeNode[];
}

interface TreeViewProps {
  data: D3TreeNode;
}

const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const parentEl = svgRef.current.parentElement!;
    const width = parentEl.clientWidth || 800;
    const height = parentEl.clientHeight || 600;

    // Create hierarchy
    const root = d3.hierarchy(data);
    
    // Set up tree layout
    const dx = 30;
    const dy = width / (root.height + 1);
    const tree = d3.tree<D3TreeNode>().nodeSize([dx, dy]);
    
    // Apply tree layout
    tree(root);

    // Calculate bounds
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    // Set up SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, x0 - dx, width, x1 - x0 + dx * 2].join(' '));

    // Clear previous render
    svg.selectAll('*').remove();

    // Main group
    const g = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .attr('transform', `translate(${dy / 3}, ${dx - x0})`);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${dy / 3}, ${dx - x0}) ${event.transform}`);
      });

    svg.call(zoom);

    // Add links
    g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<D3TreeNode>, d3.HierarchyPointNode<D3TreeNode>>()
        .x(d => d.y)
        .y(d => d.x));

    // Add nodes
    const node = g.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 2)
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Add circles
    node.append('circle')
      .attr('fill', d => d.children ? '#0f172a' : '#38bdf8')
      .attr('stroke', '#fff')
      .attr('r', 5);

    // Add labels with better styling
    node.append('text')
      .attr('dy', '0.35em')
      .attr('x', d => d.children ? -10 : 10)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('fill', '#1f2937')
      .attr('font-weight', 'bold')
      .attr('font-size', '11px')
      .text(d => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

  }, [data]);

  return <svg ref={svgRef} className="w-full h-full cursor-grab" />;
};

export default TreeView;