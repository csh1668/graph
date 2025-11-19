import { useReactFlow, getStraightPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { getEdgeParams } from './utils';
import type { GraphEdge } from '../../engine/GraphModel';

export function FloatingEdge({ id, source, target, markerEnd, style, data }: EdgeProps<GraphEdge>) {
  const reactFlowInstance = useReactFlow();
  const sourceNode = reactFlowInstance.getNode(source);
  const targetNode = reactFlowInstance.getNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {data?.weight !== undefined && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-background rounded px-1 text-xs font-medium"
          >
            {data.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
