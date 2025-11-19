import { Position } from 'reactflow';
import type { Node } from 'reactflow';

// Get the center of a node
function getNodeCenter(node: Node) {
  return {
    x: node.position.x + (node.width || 0) / 2,
    y: node.position.y + (node.height || 0) / 2,
  };
}

// Calculate the intersection point between the line (source-target) and the node border
function getHandlePosition(node: Node, targetNode: Node) {
  const sourceCenter = getNodeCenter(node);
  const targetCenter = getNodeCenter(targetNode);

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  
  const angle = Math.atan2(dy, dx);
  
  // Assuming circular node with radius = width / 2
  // We can use a fixed radius if width is not yet available, but usually it is.
  // Let's assume a default radius if width is missing (e.g. 50px width -> 25px radius)
  const radius = (node.width || 50) / 2;

  const x = sourceCenter.x + Math.cos(angle) * radius;
  const y = sourceCenter.y + Math.sin(angle) * radius;

  return { x, y };
}

export function getEdgeParams(source: Node, target: Node) {
  const sourceIntersection = getHandlePosition(source, target);
  const targetIntersection = getHandlePosition(target, source);

  return {
    sx: sourceIntersection.x,
    sy: sourceIntersection.y,
    tx: targetIntersection.x,
    ty: targetIntersection.y,
    sourcePos: Position.Top, // Irrelevant for floating edge but required by type
    targetPos: Position.Top,
  };
}
