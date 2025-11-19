import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraph } from '../../context/GraphContext';
import { useForceLayout } from '../../engine/useForceLayout';
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, MousePointer2, Square, Dot, Cross } from 'lucide-react';
import { CustomNode } from '@/components/graph/CustomNode';
import { FloatingEdge } from '@/components/graph/FloatingEdge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

function GraphCanvasContent() {
  const { graph, onNodesChange, onEdgesChange, addNode, addEdge, toggleNodeFixed } = useGraph();
  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useForceLayout(graph.nodes, graph.edges, onNodesChange);
  const [mode, setMode] = useState<'default' | 'add-node' | 'add-edge'>('default');
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant | 'none'>('none');
  const [sourceNode, setSourceNode] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    if (graph.nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [graph.nodes.length, reactFlowInstance]);

  const handlePaneClick = (event: React.MouseEvent) => {
    if (mode === 'add-node') {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(position.x, position.y);
      setMode('default');
    }
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (mode === 'add-edge') {
      if (!sourceNode) {
        setSourceNode(node.id);
      } else {
        if (sourceNode !== node.id) {
          addEdge(sourceNode, node.id);
          setSourceNode(null);
          setMode('default');
        }
      }
    } else if (mode === 'default') {
      toggleNodeFixed(node.id);
    }
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        {backgroundVariant !== 'none' && <Background variant={backgroundVariant as BackgroundVariant} />}
        <Controls />
        <MiniMap />

        <Panel position="bottom-center" className="bg-background/80 p-2 rounded shadow backdrop-blur-sm flex gap-2">
          <Button
            variant={mode === 'default' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setMode('default')}
            title="Select / Drag"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'add-node' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setMode('add-node')}
            title="Add Node (Click on canvas)"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant={mode === 'add-edge' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => { setMode('add-edge'); setSourceNode(null); }}
            title="Add Edge (Click source then target)"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setBackgroundVariant('none')}>
                <div className='flex h-4 w-4 items-center justify-center'></div>
                <span>None</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBackgroundVariant(BackgroundVariant.Lines)}>
                <Square className="h-4 w-4" />
                <span>Lines</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBackgroundVariant(BackgroundVariant.Dots)}>
                <Dot className="h-4 w-4" />
                <span>Dots</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBackgroundVariant(BackgroundVariant.Cross)}>
                <Cross className="h-4 w-4" />
                <span>Cross</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Panel>

        <Panel position="top-right" className="bg-background/80 p-2 rounded shadow backdrop-blur-sm">
          <div className="text-xs font-mono">
            <div>Nodes: {graph.nodes.length}</div>
            <div>Edges: {graph.edges.length}</div>
            {mode === 'add-edge' && sourceNode && <div className="text-primary font-bold">Select Target Node</div>}
            {mode === 'add-edge' && !sourceNode && <div className="text-muted-foreground">Select Source Node</div>}
            {mode === 'add-node' && <div className="text-muted-foreground">Click to add node</div>}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasContent />
    </ReactFlowProvider>
  );
};
