import { createNode, createEdge } from './GraphModel';
import type { Graph, GraphNode, GraphEdge } from './GraphModel';

export type InputFormat = 'edge-list';

export const parseInput = (
  input: string,
  format: InputFormat,
  directed: boolean
): Graph => {
  const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const adjacencyList = new Map<string, { node: string; weight: number }[]>();

  const ensureNode = (id: string) => {
    if (!nodesMap.has(id)) {
      // Center position initially, physics will fix it
      const node = createNode(id, id, 0, 0);
      nodesMap.set(id, node);
      adjacencyList.set(id, []);
    }
  };

  if (format === 'edge-list') {
    lines.forEach(line => {
      const parts = line.split(/\s+/).filter(p => p.length > 0);
      
      if (parts.length === 1) {
        // 정점만 생성
        const u = parts[0];
        ensureNode(u);
      } else if (parts.length === 2) {
        // 가중치 없는 간선
        const u = parts[0];
        const v = parts[1];
        
        ensureNode(u);
        ensureNode(v);
        
        edges.push(createEdge(u, v, undefined, directed));
        adjacencyList.get(u)?.push({ node: v, weight: 1 });
        
        if (!directed) {
          adjacencyList.get(v)?.push({ node: u, weight: 1 });
        }
      } else if (parts.length === 3) {
        // 가중치 있는 간선
        const u = parts[0];
        const v = parts[1];
        const w = parseFloat(parts[2]);
        const weightForCalc = isNaN(w) ? 1 : w;
        
        ensureNode(u);
        ensureNode(v);
        
        edges.push(createEdge(u, v, w, directed));
        adjacencyList.get(u)?.push({ node: v, weight: weightForCalc });
        
        if (!directed) {
          adjacencyList.get(v)?.push({ node: u, weight: weightForCalc });
        }
      }
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
    adjacencyList,
    isDirected: directed,
  };
};
