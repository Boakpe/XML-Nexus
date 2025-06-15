import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, D3GraphNode } from '../utils/types';

interface GraphViewProps {
  data: GraphData;
}

const GraphView: React.FC<GraphViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links } = data;

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.parentElement!.clientWidth;
    const height = svgRef.current.parentElement!.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '));

    // Clear previous render
    svg.selectAll('*').remove();
    
    const container = svg.append('g');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute p-2 text-sm bg-slate-800 text-white rounded-md opacity-0 pointer-events-none transition-opacity')
      .style('transform', 'translate(10px, 10px)');

    // Simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(70))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(0, 0));

    // Links
    const link = container.append('g')
      .attr('stroke', '#94a3b8') // slate-400
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    // Nodes
    const node = container.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', '#38bdf8') // sky-400
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', .9);
        const attrs = Object.entries(d.attributes).map(([k,v]) => `${k}: ${v}`).join('<br/>');
        tooltip.html(`<strong>${d.name}</strong><br/>${attrs}`)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Node Labels
    const labels = container.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -12)
      .attr('class', 'text-xs font-sans fill-primary pointer-events-none')
      .text(d => d.name);

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
    node.call(drag(simulation) as any);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Tick function
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3GraphNode).x!)
        .attr('y1', d => (d.source as D3GraphNode).y!)
        .attr('x2', d => (d.target as D3GraphNode).x!)
        .attr('y2', d => (d.target as D3GraphNode).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
      
      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    return () => {
      // Cleanup tooltip on component unmount
      tooltip.remove();
    };
  }, [nodes, links]);

  return <svg ref={svgRef} className="w-full h-full cursor-grab"></svg>;
};

export default GraphView;