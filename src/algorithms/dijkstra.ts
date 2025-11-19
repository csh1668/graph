import type { Graph } from '../engine/GraphModel';
import type { AlgorithmStep, AlgorithmGenerator } from './types';

export const dijkstra: AlgorithmGenerator = (graph: Graph, startNode: string, endNode?: string) => {
  const steps: AlgorithmStep[] = [];
  const distances: Record<string, number> = {};
  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const visitedEdges: string[] = [];
  const pq: { node: string; dist: number }[] = [];

  // Initialize distances
  graph.nodes.forEach(n => {
    distances[n.id] = Infinity;
  });
  distances[startNode] = 0;
  pq.push({ node: startNode, dist: 0 });

  steps.push({
    visitedNodes: [],
    visitedEdges: [],
    currentNode: startNode,
    distances: { ...distances },
    description: `Start Dijkstra from node ${startNode}`,
  });


  while (pq.length > 0) {
    // Sort priority queue (naive)
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = pq.shift()!;

    if (d > distances[u]) continue;
    if (visited.has(u)) continue;
    visited.add(u);

    steps.push({
      visitedNodes: Array.from(visited),
      visitedEdges: [...visitedEdges],
      currentNode: u,
      distances: { ...distances },
      description: `Visiting node ${u} with distance ${d}`,
    });

    if (u === endNode) {
      steps.push({
        visitedNodes: Array.from(visited),
        visitedEdges: [...visitedEdges],
        currentNode: u,
        distances: { ...distances },
        description: `Visiting node ${u} with distance ${d}`,
      });
    }


    for (const { node: v, weight } of graph.adjacencyList.get(u)!) {
      const newDist = d + weight;
      if (newDist < distances[v]) {
        distances[v] = newDist;
        parent.set(v, u);
        pq.push({ node: v, dist: newDist });

        const edge = graph.edges.find(e =>
          (e.source === u && e.target === v) ||
          (!graph.isDirected && e.source === v && e.target === u)
        );
        if (edge && !visitedEdges.includes(edge.id)) visitedEdges.push(edge.id);

        steps.push({
          visitedNodes: Array.from(visited),
          visitedEdges: [...visitedEdges],
          currentNode: v,
          distances: { ...distances },
          description: `Updated distance for ${v} to ${newDist}`,
        });
      }
    }
  }

  // Final step to indicate algorithm finished and ensure all visited nodes are marked
  steps.push({
    visitedNodes: Array.from(visited),
    visitedEdges: [...visitedEdges],
    currentNode: undefined,
    distances: { ...distances },
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
