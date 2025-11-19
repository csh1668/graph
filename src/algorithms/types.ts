import type { Graph } from '../engine/GraphModel';

export interface AlgorithmStep {
  visitedNodes: string[];
  visitedEdges: string[];
  currentNode?: string;
  path?: string[];
  distances?: Record<string, number>;
  description: string;
}

export type AlgorithmGenerator = (graph: Graph, startNode: string, endNode?: string) => AlgorithmStep[];
