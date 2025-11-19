import { useEffect, useRef } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force';
import type { Simulation } from 'd3-force';
import type { GraphNode, GraphEdge } from './GraphModel';
import type { NodeChange } from 'reactflow';

export const useForceLayout = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  onNodesChange: (changes: NodeChange[]) => void
) => {
  const simulation = useRef<Simulation<any, any> | null>(null);

  useEffect(() => {
    if (!nodes.length) return;

    // Initialize simulation if not exists
    if (!simulation.current) {
      simulation.current = forceSimulation()
        .force('charge', forceManyBody().strength(-100))
        .force('center', forceCenter(0, 0).strength(1))
        .force('x', forceX(0).strength(0.01)) // Keep centered loosely
        .force('y', forceY(0).strength(0.01));
    }

    const sim = simulation.current;

    // Update nodes and links
    // We need to map React Flow nodes/edges to D3 format
    // D3 modifies the objects in place, so we need to be careful not to mutate state directly if it's immutable
    // But React Flow nodes are objects.
    
    // For D3, we need mutable objects.
    // We can use the existing nodes if we don't mind D3 adding x, y, vx, vy properties.
    // React Flow nodes have position.x and position.y. D3 uses x and y.
    
    const d3Nodes = nodes.map(n => ({
      ...n,
      x: n.position.x,
      y: n.position.y,
      fx: n.data.isFixed ? n.position.x : undefined,
      fy: n.data.isFixed ? n.position.y : undefined,
    }));

    const d3Links = edges.map(e => ({
      ...e,
      source: e.source,
      target: e.target,
    }));

    sim.nodes(d3Nodes);
    sim.force('link', forceLink(d3Links).id((d: any) => d.id).distance(100).strength(0.1));

    sim.on('tick', () => {
      // Broadcast changes to React Flow
      const changes: NodeChange[] = d3Nodes.map(node => {
        // Only update if moved significantly to save renders?
        // Or just update.
        return {
          id: node.id,
          type: 'position',
          position: { x: node.x, y: node.y },
        };
      });

      onNodesChange(changes);
    });

    sim.alpha(1).restart();

    return () => {
      sim.stop();
    };
  }, [nodes.length, edges.length]); // Re-run when graph topology changes

  const onNodeDragStart = (_: any, node: GraphNode) => {
    if (!simulation.current) return;
    const sim = simulation.current;
    sim.alphaTarget(0.3).restart();
    const d3Node = sim.nodes().find((n: any) => n.id === node.id);
    if (d3Node) {
      d3Node.fx = node.position.x;
      d3Node.fy = node.position.y;
    }
  };

  const onNodeDrag = (_: any, node: GraphNode) => {
    if (!simulation.current) return;
    const sim = simulation.current;
    const d3Node = sim.nodes().find((n: any) => n.id === node.id);
    if (d3Node) {
      d3Node.fx = node.position.x;
      d3Node.fy = node.position.y;
    }
  };

  const onNodeDragStop = (_: any, node: GraphNode) => {
    if (!simulation.current) return;
    const sim = simulation.current;
    sim.alphaTarget(0);
    const d3Node = sim.nodes().find((n: any) => n.id === node.id);
    if (d3Node) {
      // Only keep fixed if it was explicitly fixed by user
      if (node.data.isFixed) {
        d3Node.fx = node.position.x;
        d3Node.fy = node.position.y;
      } else {
        d3Node.fx = null;
        d3Node.fy = null;
      }
    }
  };

  return { onNodeDragStart, onNodeDrag, onNodeDragStop };
};
