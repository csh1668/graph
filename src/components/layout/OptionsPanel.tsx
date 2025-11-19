import { useState } from 'react';
import { useGraph } from '../../context/GraphContext';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bfs } from '../../algorithms/bfs';
import { dijkstra } from '../../algorithms/dijkstra';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toPng } from 'html-to-image';

export default function OptionsPanel() {
  const {
    graph,
    runAlgorithm,
    nextStep,
    prevStep,
    resetAlgorithm,
    isPlaying,
    setIsPlaying,
    currentStepIndex,
    totalSteps,
    algorithmDescription
  } = useGraph();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bfs' | 'dijkstra'>('bfs');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');

  const handleRun = () => {
    if (!startNode) {
      // Default to first node if not specified
      if (graph.nodes.length > 0) {
        setStartNode(graph.nodes[0].id);
        const start = graph.nodes[0].id;
        if (selectedAlgorithm === 'bfs') {
          runAlgorithm(bfs, start, endNode || undefined);
        } else {
          runAlgorithm(dijkstra, start, endNode || undefined);
        }
      }
      return;
    }

    if (selectedAlgorithm === 'bfs') {
      runAlgorithm(bfs, startNode, endNode || undefined);
    } else {
      runAlgorithm(dijkstra, startNode, endNode || undefined);
    }
  };

  return (
    <div className="h-full w-full p-4 bg-background border-l flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Options</h2>

      <div className="flex flex-col gap-2">
        <Label>Algorithm</Label>
        <Select value={selectedAlgorithm} onValueChange={(v: any) => setSelectedAlgorithm(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
            <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Start Node</Label>
        <Input
          value={startNode}
          onChange={(e) => setStartNode(e.target.value)}
          placeholder="e.g. 1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Target Node (Optional)</Label>
        <Input
          value={endNode}
          onChange={(e) => setEndNode(e.target.value)}
          placeholder="e.g. 5"
        />
      </div>

      <Button onClick={handleRun} className="w-full">Run Algorithm</Button>

      {totalSteps > 0 && (
        <div className="flex flex-col gap-2 mt-4 p-2 border rounded bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono">Step: {currentStepIndex + 1} / {totalSteps}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevStep} disabled={currentStepIndex <= 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextStep} disabled={currentStepIndex >= totalSteps - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={resetAlgorithm}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground h-12 overflow-y-auto">
            {algorithmDescription}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Button variant="outline" className="w-full" onClick={async () => {
          const flowElement = document.querySelector('.react-flow') as HTMLElement;
          if (flowElement) {
            try {
              const dataUrl = await toPng(flowElement, { backgroundColor: '#fff' });
              const link = document.createElement('a');
              link.download = 'graph-visualization.png';
              link.href = dataUrl;
              link.click();
            } catch (err) {
              console.error('Failed to export image', err);
            }
          }
        }}>
          Export Image
        </Button>
      </div>
    </div>
  );
};
