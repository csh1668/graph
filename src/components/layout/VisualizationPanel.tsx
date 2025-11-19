import { GraphCanvas } from '../graph/GraphCanvas';

export default function VisualizationPanel() {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      <GraphCanvas />
    </div>
  );
};
