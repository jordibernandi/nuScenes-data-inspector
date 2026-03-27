import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSamples } from "@/hooks/useSamples";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FrameNavigatorProps {
  sceneToken: string;
  prev: string | null;
  next: string | null;
}

export function FrameNavigator({ sceneToken, prev, next }: FrameNavigatorProps) {
  const { data: samples } = useSamples(sceneToken);
  const selectedSampleToken = useAppStore((s) => s.selectedSampleToken);
  const selectSample = useAppStore((s) => s.selectSample);

  const currentIndex = useMemo(() => {
    if (!samples || !selectedSampleToken) return -1;
    return samples.findIndex((s) => s.token === selectedSampleToken);
  }, [samples, selectedSampleToken]);

  const total = samples?.length ?? 0;

  return (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => prev && selectSample(prev)}
            disabled={!prev}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
        </TooltipTrigger>
        <TooltipContent>Previous frame (Left arrow)</TooltipContent>
      </Tooltip>

      {/* Slider — always rendered to prevent layout shift */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Slider
          min={0}
          max={total > 1 ? total - 1 : 0}
          step={1}
          value={[currentIndex >= 0 ? currentIndex : 0]}
          disabled={total <= 1}
          onValueChange={([idx]) => {
            if (samples?.[idx]) {
              selectSample(samples[idx].token);
            }
          }}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {currentIndex >= 0 ? currentIndex + 1 : "\u2014"} / {total || "\u2014"}
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => next && selectSample(next)}
            disabled={!next}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next frame (Right arrow)</TooltipContent>
      </Tooltip>
    </div>
  );
}
