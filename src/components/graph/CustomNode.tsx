import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { cn } from "@/lib/utils";
import type { GraphNode } from '../../engine/GraphModel';

export function CustomNode({ data, selected }: NodeProps<GraphNode>) {
  return (
    <div className={cn(
      "rounded-full border-2 bg-background flex items-center justify-center shadow-sm transition-all",
      "w-12 h-12", // Fixed size for now, or dynamic? User said "Circular".
      selected ? "border-primary ring-2 ring-primary/30" : "border-border",
      data.isFixed ? "border-black border-4" : "",
      data.isCurrent && "bg-red-500 border-red-600 text-white",
      data.isVisited && !data.isCurrent && "bg-blue-500 border-blue-600 text-white",
      // data.distance !== undefined && "after:content-[attr(data-dist)] after:absolute after:-top-6 after:text-xs after:font-bold after:text-foreground"
    )}>
      {/* We need handles for React Flow to work, even if we calculate edge positions manually. 
          Placing them in the center is a common trick for floating edges. */}
      <Handle type="target" position={Position.Top} className="opacity-0 w-0 h-0" />
      <Handle type="source" position={Position.Top} className="opacity-0 w-0 h-0" />

      <div className="text-sm font-bold pointer-events-none">
        {data.label}
      </div>

      {data.distance !== undefined && data.distance !== Infinity && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-background/80 px-1 rounded border text-foreground">
          {data.distance}
        </div>
      )}
    </div>
  );
}
