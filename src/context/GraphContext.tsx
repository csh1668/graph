import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { parseInput } from '../engine/Parser';
import { MarkerType } from 'reactflow';
import type { Graph, GraphNode, GraphEdge } from '../engine/GraphModel';
import type { InputFormat } from '../engine/Parser';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { NodeChange, EdgeChange } from 'reactflow';
import type { AlgorithmStep } from '../algorithms/types';

interface GraphContextType {
  graph: Graph;
  setGraph: (graph: Graph) => void;
  updateInput: (input: string, format: InputFormat, directed: boolean) => void;
  addNode: (x: number, y: number) => void;
  addEdge: (source: string, target: string) => void;
  toggleNodeFixed: (nodeId: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;

  // Algorithm Control
  runAlgorithm: (algorithm: (g: Graph, start: string, end?: string) => AlgorithmStep[], startNode: string, endNode?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetAlgorithm: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentStepIndex: number;
  totalSteps: number;
  algorithmDescription: string;
}

const defaultGraph: Graph = {
  nodes: [],
  edges: [],
  adjacencyList: new Map(),
  isDirected: true,
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graph, setGraph] = useState<Graph>(defaultGraph);
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithmDescription, setAlgorithmDescription] = useState('');

  const resetAlgorithm = useCallback(() => {
    setAlgorithmSteps([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setAlgorithmDescription('');
    // Reset graph styles
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => ({ ...n, style: undefined, data: { ...n.data, isVisited: false, isCurrent: false, distance: undefined } })),
      edges: prev.edges.map(e => ({ ...e, style: undefined, animated: false, data: { ...e.data, isTraversed: false } })),
    }));
  }, []);

  const updateInput = useCallback((input: string, format: InputFormat, directed: boolean) => {
    const newGraph = parseInput(input, format, directed);
    setGraph(newGraph);
    resetAlgorithm();
  }, [resetAlgorithm]);

  const addNode = useCallback((x: number, y: number) => {
    setGraph((prev) => {
      const id = (prev.nodes.length + 1).toString(); // Simple ID generation
      // Check if ID exists, if so increment
      let finalId = id;
      let counter = 1;
      while (prev.nodes.find(n => n.id === finalId)) {
        counter++;
        finalId = (prev.nodes.length + counter).toString();
      }

      const newNode: GraphNode = {
        id: finalId,
        position: { x, y },
        data: { label: finalId },
        type: 'custom',
      };

      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
        adjacencyList: new Map(prev.adjacencyList).set(finalId, []),
      };
    });
    resetAlgorithm();
  }, [resetAlgorithm]);

  const addEdge = useCallback((source: string, target: string) => {
    setGraph((prev) => {
      const newEdge: GraphEdge = {
        id: `e${source}-${target}-${Date.now()}`,
        source,
        target,
        type: 'floating',
        markerEnd: prev.isDirected ? { type: MarkerType.ArrowClosed } : undefined,
        data: { weight: 1 },
      };

      // Update adjacency list
      const newAdjacencyList = new Map(prev.adjacencyList);
      const sourceNeighbors = newAdjacencyList.get(source) || [];
      sourceNeighbors.push({ node: target, weight: 1 });
      newAdjacencyList.set(source, sourceNeighbors);

      if (!prev.isDirected) {
        const targetNeighbors = newAdjacencyList.get(target) || [];
        targetNeighbors.push({ node: source, weight: 1 });
        newAdjacencyList.set(target, targetNeighbors);
      }

      return {
        ...prev,
        edges: [...prev.edges, newEdge],
        adjacencyList: newAdjacencyList,
      };
    });
    resetAlgorithm();
  }, [resetAlgorithm]);

  const toggleNodeFixed = useCallback((nodeId: string) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, isFixed: !n.data.isFixed } }
          : n
      ),
    }));
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setGraph((prev) => ({
      ...prev,
      nodes: applyNodeChanges(changes, prev.nodes) as GraphNode[],
    }));

    // Only reset if structural changes occur (remove, reset)
    // Position, dimensions, select should not reset the algorithm
    const hasStructuralChanges = changes.some(c => c.type === 'remove' || c.type === 'reset');
    if (hasStructuralChanges) {
      resetAlgorithm();
    }
  }, [resetAlgorithm]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setGraph((prev) => ({
      ...prev,
      edges: applyEdgeChanges(changes, prev.edges) as GraphEdge[],
    }));

    const hasStructuralChanges = changes.some(c => c.type === 'remove' || c.type === 'reset');
    if (hasStructuralChanges) {
      resetAlgorithm();
    }
  }, [resetAlgorithm]);

  const applyStep = useCallback((step: AlgorithmStep, g: Graph): Graph => {
    const newNodes = g.nodes.map(n => {
      const isVisited = step.visitedNodes.includes(n.id);
      const isCurrent = step.currentNode === n.id;
      // const isPath = step.path?.includes(n.id);
      const distance = step.distances ? step.distances[n.id] : undefined;

      const style = {};
      // For custom nodes, we pass style via data or handle it in the component.
      // But React Flow nodes also accept 'style' prop.
      // Our CustomNode uses 'data.isVisited' etc.

      return {
        ...n,
        style,
        data: { ...n.data, isVisited, isCurrent, distance },
      };
    });

    const newEdges = g.edges.map(e => {
      const isTraversed = step.visitedEdges.includes(e.id);
      // Check if edge is part of path
      let isPath = false;
      if (step.path && step.path.length > 1) {
        for (let i = 0; i < step.path.length - 1; i++) {
          const u = step.path[i];
          const v = step.path[i + 1];
          if ((e.source === u && e.target === v) || (!g.isDirected && e.source === v && e.target === u)) {
            isPath = true;
            break;
          }
        }
      }

      let style = {};
      if (isPath) style = { stroke: '#22c55e', strokeWidth: 3 };
      else if (isTraversed) style = { stroke: '#3b82f6', strokeWidth: 2 };

      return {
        ...e,
        style,
        animated: isTraversed || isPath,
        data: { ...e.data, isTraversed },
      };
    });

    return { ...g, nodes: newNodes, edges: newEdges };
  }, []);

  const runAlgorithm = useCallback((algorithm: (g: Graph, start: string, end?: string) => AlgorithmStep[], startNode: string, endNode?: string) => {
    resetAlgorithm();
    const steps = algorithm(graph, startNode, endNode);
    setAlgorithmSteps(steps);
    setCurrentStepIndex(0);
    if (steps.length > 0) {
      setGraph(prev => applyStep(steps[0], prev));
      setAlgorithmDescription(steps[0].description || '');
    } else {
      setAlgorithmDescription('No steps generated for this algorithm.');
    }
  }, [graph, resetAlgorithm, applyStep]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < algorithmSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setGraph(prev => applyStep(algorithmSteps[nextIndex], prev));
      setAlgorithmDescription(algorithmSteps[nextIndex].description || '');
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, algorithmSteps, applyStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setGraph(prev => applyStep(algorithmSteps[prevIndex], prev));
      setAlgorithmDescription(algorithmSteps[prevIndex].description || '');
    }
  }, [currentStepIndex, algorithmSteps, applyStep]);

  // Auto-play effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        nextStep();
      }, 500); // 500ms delay
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextStep]);

  return (
    <GraphContext.Provider value={{
      graph,
      setGraph,
      updateInput,
      addNode,
      addEdge,
      toggleNodeFixed,
      onNodesChange,
      onEdgesChange,
      runAlgorithm,
      nextStep,
      prevStep,
      resetAlgorithm,
      isPlaying,
      setIsPlaying,
      currentStepIndex,
      totalSteps: algorithmSteps.length,
      algorithmDescription,
    }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};
