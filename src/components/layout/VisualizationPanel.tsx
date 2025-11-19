import React from 'react';
import { GraphCanvas } from '../graph/GraphCanvas';

export const VisualizationPanel: React.FC = () => {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <GraphCanvas />
    </div>
  );
};
