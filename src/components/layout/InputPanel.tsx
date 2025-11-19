import React, { useState, useEffect } from 'react';
import { useGraph } from '../../context/GraphContext';

import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const InputPanel: React.FC = () => {
  const { updateInput } = useGraph();
  const [input, setInput] = useState('1 2 3\n2 3 4\n3 1 1');
  const [directed, setDirected] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateInput(input, 'edge-list', directed);
    }, 500);

    return () => clearTimeout(timer);
  }, [input, directed, updateInput]);

  return (
    <div className="h-full w-full p-4 bg-background border-r flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Input</h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="directed" checked={directed} onCheckedChange={(c) => setDirected(!!c)} />
          <Label htmlFor="directed">Directed</Label>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <Label>Graph Data</Label>
        <Textarea
          className="flex-1 font-mono text-sm resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter graph data..."
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Format: u | u v | u v w
      </div>
    </div>
  );
};
