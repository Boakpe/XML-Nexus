// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { D3TreeNode } from '../utils/types';

interface TreeViewProps {
  data: D3TreeNode;
}

const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<d3.HierarchyNode<D3TreeNode> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const parentEl = svgRef.current.parentElement!;
    const width = parentEl.clientWidth || 800;
    const height = parentEl.clientHeight || 600;

    const dx = 25; // Vertical separation
    const dy = width / 4; // Horizontal separation

    const tree = d3.tree<D3TreeNode>().nodeSize([dx, dy]);
    const root = d3.hierarchy(data);
    rootRef.current = root;

    root.x0 = 0; // Center vertically
    root.y0 = 0; // Start from left

    // Assign unique IDs and collapse ALL nodes except root
    let i = 0;
    root.descendants().forEach(d => {
      d.id = ++i;
      // @ts-ignore - attaching _children for collapse/expand
      d._children = d.children;
      // Collapse all nodes except the root (depth 0)
      if (d.depth > 0) {
        d.children = null;
      }
    });

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      // Center vertically: set y to -(height/2 - dx) so root is near the top
      .attr('viewBox', [-dy / 3, -(height / 2) + dx, width, height].join(' '))
      .style('font', '12px sans-serif');

    // Clear previous render
    svg.selectAll('*').remove();

    const gLink = svg.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    const gNode = svg.append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all');

    // Tooltip setup
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute p-2 text-sm bg-slate-800 text-white rounded2-md opacity-0 pointer-events-none transition-opacity')
      .style('transform', 'translate(15px, -15px)');

    function update(source: d3.HierarchyNode<D3TreeNode>) {
      const duration = (d3.event && d3.event.altKey) ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x!) left = node;
        if (node.x > right.x!) right = node;
      });

      const transition = svg.transition()
        .duration(duration)
        .attr('viewBox', [-dy / 3, left.x! - dx, width, height].join(' '))
        .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

      // Update the nodes…
      const node = gNode.selectAll('g')
        .data(nodes, d => (d as any).id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('transform', d => `translate(${(source as any).y0},${(source as any).x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
          // Only allow clicking if the node has children to expand/collapse
          if ((d as any)._children || d.children) {
            d.children = d.children ? null : (d as any)._children;
            update(d);
          }
        })
        .on('mouseover', (event, d) => {
          tooltip.transition().duration(200).style('opacity', .9);
          const attrs = Object.entries(d.data.attributes)
            .map(([k,v]) => `<li><strong>${k}:</strong> ${v}</li>`)
            .join('');
          tooltip.html(`
            <div class="font-bold text-base">${d.data.name}</div>
            ${attrs.length > 0 ? `<ul class="list-disc list-inside mt-1">${attrs}</ul>` : ''}
          `);
        })
        .on('mousemove', (event) => {
          tooltip.style('left', (event.pageX) + 'px').style('top', (event.pageY) + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      // Create different visual indicators for different node states
      nodeEnter.append('circle')
        .attr('r', d => {
          // Larger circle for nodes with children
          return (d as any)._children || d.children ? 8 : 6;
        })
        .attr('stroke-width', 2)
        .attr('fill', d => {
          if ((d as any)._children) {
            // Collapsed node (has hidden children) - solid dark
            return '#1e293b';
          } else if (d.children) {
            // Expanded node (showing children) - hollow blue
            return '#ffffff';
          } else {
            // Leaf node (no children) - solid blue
            return '#38bdf8';
          }
        })
        .attr('stroke', d => {
          if ((d as any)._children) {
            // Collapsed node - dark border
            return '#1e293b';
          } else if (d.children) {
            // Expanded node - blue border
            return '#38bdf8';
          } else {
            // Leaf node - blue border
            return '#38bdf8';
          }
        });

      // Add expand/collapse indicator for nodes with children
      nodeEnter.append('text')
        .attr('class', 'expand-indicator')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', d => {
          if ((d as any)._children) {
            return '#ffffff'; // White plus on dark background
          } else if (d.children) {
            return '#38bdf8'; // Blue minus on white background
          } else {
            return 'transparent'; // No indicator for leaf nodes
          }
        })
        .text(d => {
          if ((d as any)._children) {
            return '+'; // Collapsed - show plus
          } else if (d.children) {
            return '−'; // Expanded - show minus
          } else {
            return ''; // Leaf node - no indicator
          }
        });

      nodeEnter.append('text')
        .attr('class', 'node-label')
        .attr('dy', '0.31em')
        .attr('x', d => d.children || (d as any)._children ? -15 : 15)
        .attr('text-anchor', d => d.children || (d as any)._children ? 'end' : 'start')
        .text(d => d.data.name)
        .clone(true).lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white');

      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);
      
      // Update circle appearance
      nodeUpdate.select('circle')
        .attr('r', d => {
          return (d as any)._children || d.children ? 8 : 6;
        })
        .attr('fill', d => {
          if ((d as any)._children) {
            return '#1e293b';
          } else if (d.children) {
            return '#ffffff';
          } else {
            return '#38bdf8';
          }
        })
        .attr('stroke', d => {
          if ((d as any)._children) {
            return '#1e293b';
          } else if (d.children) {
            return '#38bdf8';
          } else {
            return '#38bdf8';
          }
        });

      // Update expand/collapse indicator
      nodeUpdate.select('.expand-indicator')
        .attr('fill', d => {
          if ((d as any)._children) {
            return '#ffffff';
          } else if (d.children) {
            return '#38bdf8';
          } else {
            return 'transparent';
          }
        })
        .text(d => {
          if ((d as any)._children) {
            return '+';
          } else if (d.children) {
            return '−';
          } else {
            return '';
          }
        });

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit().transition(transition).remove()
        .attr('transform', d => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);

      // Update the links…
      const link = gLink.selectAll('path')
        .data(links, d => (d.target as any).id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append('path')
        .attr('d', d => {
          const o = { x: (source as any).x0, y: (source as any).y0 };
          return d3.linkHorizontal()({ source: o, target: o } as any);
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition)
        .attr('d', d3.linkHorizontal<any, d3.HierarchyPointNode<D3TreeNode>>()
          .x(d => d.y)
          .y(d => d.x));

      // Transition exiting nodes to the parent's new position.
      link.exit().transition(transition).remove()
        .attr('d', d => {
          const o = { x: source.x!, y: source.y! };
          return d3.linkHorizontal()({ source: o, target: o } as any);
        });

      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        gNode.attr('transform', event.transform);
        gLink.attr('transform', event.transform);
      });
    
    // Center the tree on initial render (move root to top center)
    svg.call(zoom).call(
      zoom.transform,
      d3.zoomIdentity.translate(dy / 3, dx) // dx instead of height/2
    );

    return () => {
      // Cleanup tooltip on component unmount
      tooltip.remove();
    };
  }, [data]);

  return <svg ref={svgRef} className="w-full h-full cursor-grab" />;
};

export default TreeView;