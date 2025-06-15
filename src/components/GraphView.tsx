// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, D3GraphNode } from '../utils/types';

interface GraphViewProps {
  data: GraphData;
}

const legendData = [
  { type: 'root', label: 'Root Element', color: '#e74c3c' },
  { type: 'container', label: 'Container (4+ children)', color: '#3498db' },
  { type: 'element', label: 'Element', color: '#2ecc71' },
  { type: 'leaf', label: 'Leaf (no children)', color: '#f39c12' }
];

const GraphView: React.FC<GraphViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links } = data;

  useEffect(() => {
    if (!svgRef.current || !nodes || nodes.length === 0) return;

    const parentEl = svgRef.current.parentElement!;
    const width = parentEl.clientWidth;
    const height = parentEl.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height].join(' '));

    // Clear previous render
    svg.selectAll('*').remove();
    
    // Color scale for different node types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(legendData.map(d => d.type))
      .range(legendData.map(d => d.color));
      
    const container = svg.append('g');

    // Simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => {
        const node = d as D3GraphNode;
        if (node.type === 'root') return 25;
        if (node.type === 'container') return 20;
        return 18;
      }));

    // Links
    const link = container.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // Drag behavior
    const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {
      function dragstarted(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: d3.D3DragEvent<any, any, any>, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<any, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }

    // Nodes
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => {
        if (d.type === 'root') return 20;
        if (d.type === 'container') return 15;
        if (d.type === 'leaf') return 10;
        return 12;
      })
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels to nodes
    const text = node.append('text')
      .attr('font-size', '9px')
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .style('pointer-events', 'none');
      
    text.each(function (d) {
      const lines = d.label.split('\n');
      const textNode = d3.select(this);
      const lineHeight = 1.2; // ems
      const startY = `-${(lines.length - 1) / 2 * lineHeight}em`;
      
      lines.forEach((line, i) => {
        textNode.append('tspan')
          .attr('x', 0)
          .attr('dy', i === 0 ? startY : `${lineHeight}em`)
          .text(line);
      });
    });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Add legend (not affected by zoom)
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(20, 20)');

    const legendItem = legend.selectAll('.legend-item')
      .data(legendData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItem.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.color);

    legendItem.append('text')
      .attr('x', 15)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('font-family', 'sans-serif')
      .text(d => d.label);

    // Tick function
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3GraphNode).x!)
        .attr('y1', d => (d.source as D3GraphNode).y!)
        .attr('x2', d => (d.target as D3GraphNode).x!)
        .attr('y2', d => (d.target as D3GraphNode).y!);

      node
        .attr('transform', d => `translate(${d.x!}, ${d.y!})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return <svg ref={svgRef} className="w-full h-full cursor-grab"></svg>;
};

export default GraphView;