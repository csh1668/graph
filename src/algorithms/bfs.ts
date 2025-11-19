import type { Graph } from '../engine/GraphModel';
import type { AlgorithmStep, AlgorithmGenerator } from './types';

export const bfs: AlgorithmGenerator = (graph: Graph, startNode: string, endNode?: string) => {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  const parent = new Map<string, string>();
  const visitedEdges: string[] = [];

  visited.add(startNode);

  steps.push({
    visitedNodes: [startNode],
    visitedEdges: [],
    currentNode: startNode,
    description: `Start BFS from node ${startNode}`,
  });

  while (queue.length > 0) {
    const u = queue.shift()!;

    steps.push({
      visitedNodes: Array.from(visited),
      visitedEdges: [...visitedEdges],
      currentNode: u,
      description: `Visiting node ${u}`,
    });

    if (u === endNode) {
      steps.push({
        visitedNodes: Array.from(visited),
        visitedEdges: [...visitedEdges],
        currentNode: u,
        description: `Found target node ${endNode}`,
        path: reconstructPath(parent, startNode, endNode),
      });
      break;
    }

    const neighbors = graph.adjacencyList.get(u) || [];
    for (const { node: v } of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        parent.set(v, u);
        queue.push(v);

        const edge = graph.edges.find(e =>
          (e.source === u && e.target === v) ||
          (!graph.isDirected && e.source === v && e.target === u)
        );
        if (edge) visitedEdges.push(edge.id);

        steps.push({
          visitedNodes: Array.from(visited),
          visitedEdges: [...visitedEdges],
          currentNode: v,
          description: `Discovered neighbor ${v}`,
        });
      }
    }
  }

  // Final step to indicate algorithm finished and ensure all visited nodes are marked (blue)
  steps.push({
    visitedNodes: Array.from(visited),
    visitedEdges: [...visitedEdges],
    currentNode: undefined,
    description: 'Algorithm Finished',
  });

  return steps;
};

const reconstructPath = (parent: Map<string, string>, start: string, end: string): string[] => {
  const path: string[] = [end];
  let curr = end;
  while (curr !== start) {
    const p = parent.get(curr);
    if (!p) break;
    path.unshift(p);
    curr = p;
  }
  return path;
};
