import { MarkerType } from 'reactflow';
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export type GraphNode = ReactFlowNode & {
  data: {
    label: string;
    color?: string;
    isVisited?: boolean;
    isCurrent?: boolean;
    isFixed?: boolean;
    distance?: number;
  };
};

export type GraphEdge = ReactFlowEdge & {
  data?: {
    weight?: number;
    isTraversed?: boolean;
    [key: string]: any;
  };
  type?: string;
};

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacencyList: Map<string, { node: string; weight: number }[]>;
  isDirected: boolean;
}

export const createNode = (id: string, label: string, x: number, y: number): GraphNode => ({
  id,
  position: { x, y },
  data: { label },
  type: 'custom',
});

export const createEdge = (source: string, target: string, weight?: number, directed: boolean = false): GraphEdge => ({
  id: `e${source}-${target}`,
  source,
  target,
  animated: false,
  type: 'floating',
  markerEnd: directed ? { type: MarkerType.ArrowClosed } : undefined,
  label: weight !== undefined ? weight.toString() : undefined,
  data: { weight },
});
