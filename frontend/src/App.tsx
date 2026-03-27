import { useCallback, useEffect } from "react";
import { Car, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SceneSelector } from "@/components/SceneSelector";
import { FrameNavigator } from "@/components/FrameNavigator";
import { CameraGrid } from "@/components/CameraGrid";
import { LidarViewer } from "@/components/LidarViewer";
import { QualityBadge } from "@/components/QualityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useSamples } from "@/hooks/useSamples";
import { useSampleDetail } from "@/hooks/useSampleDetail";
import { useAppStore } from "@/store/useAppStore";

function MainContent() {
  const sceneToken = useAppStore((s) => s.selectedSceneToken);
  const sampleToken = useAppStore((s) => s.selectedSampleToken);
  const selectSample = useAppStore((s) => s.selectSample);

  const { data: samples } = useSamples(sceneToken);
  const { data: detail, isLoading, error } = useSampleDetail(sampleToken);

  useEffect(() => {
    if (samples?.length && !sampleToken) {
      selectSample(samples[0].token);
    }
  }, [samples, sampleToken, selectSample]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!detail) return;
      if (e.key === "ArrowLeft" && detail.prev) selectSample(detail.prev);
      if (e.key === "ArrowRight" && detail.next) selectSample(detail.next);
    },
    [detail, selectSample],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!sceneToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Car className="h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Select a scene to begin exploring</p>
        <p className="text-sm">Choose a scene from the sidebar to get started</p>
      </div>
    );
  }

  if (!sampleToken || isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Skeleton top bar */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 flex-1 bg-muted" />
          <Skeleton className="h-9 w-24 bg-muted" />
        </div>
        {/* Skeleton content */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video bg-muted" />
            ))}
          </div>
          <Skeleton className="flex-1 min-h-[200px] bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-fail">
        <Loader2 className="h-8 w-8" />
        <p className="font-medium">Failed to load frame data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top bar: navigation + quality badge */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <FrameNavigator
            sceneToken={sceneToken}
            prev={detail.prev}
            next={detail.next}
          />
        </div>
        <QualityBadge sampleToken={sampleToken} />
      </div>

      {/* Split view: cameras (top) + LiDAR (bottom) */}
      <ResizablePanelGroup orientation="vertical" className="flex-1 min-h-0 rounded-lg border border-border">
        <ResizablePanel defaultSize={50} minSize={200}>
          <div className="h-full overflow-y-auto">
            <CameraGrid sampleToken={sampleToken} sensors={detail.sensors} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle orientation="vertical" />
        <ResizablePanel defaultSize={50} minSize={200}>
          <div className="h-full">
            <ErrorBoundary>
              <LidarViewer sampleToken={sampleToken} />
            </ErrorBoundary>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            nuScenes Inspector
          </h1>
        </div>
      </div>
      <SceneSelector />
    </div>
  );
}

function App() {
  return <Layout sidebar={<Sidebar />} main={<MainContent />} />;
}

export default App;
