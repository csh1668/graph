import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { InputPanel } from './InputPanel';
import { VisualizationPanel } from './VisualizationPanel';
import { OptionsPanel } from './OptionsPanel';

export const MainLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <InputPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={30}>
          <VisualizationPanel />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <OptionsPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
