import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import InputPanel from '@/components/layout/InputPanel';
import VisualizationPanel from '@/components/layout/VisualizationPanel';
import OptionsPanel from '@/components/layout/OptionsPanel';
import Header from '@/components/layout/Header';

export default function MainLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">

      <Header />

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
