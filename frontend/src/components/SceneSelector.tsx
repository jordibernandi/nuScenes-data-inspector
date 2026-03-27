import { Film, AlertCircle } from "lucide-react";
import { useScenes } from "@/hooks/useScenes";
import { useAppStore } from "@/store/useAppStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function SceneSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-muted" />
      ))}
    </div>
  );
}

export function SceneSelector() {
  const { data: scenes, isLoading, error } = useScenes();
  const selectedSceneToken = useAppStore((s) => s.selectedSceneToken);
  const selectScene = useAppStore((s) => s.selectScene);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isLoading) return <SceneSkeleton />;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-fail">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Failed to load scenes
      </div>
    );
  }

  if (!scenes?.length) {
    return <p className="text-sm text-muted-foreground p-4">No scenes available</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Scenes
      </h2>
      <ul className="space-y-1">
        {scenes.map((scene) => {
          const description = scene.description || `${scene.nbr_samples} frames`;
          const active = scene.token === selectedSceneToken;
          return (
            <li key={scene.token}>
              <Tooltip open={isDesktop ? undefined : false}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectScene(scene.token)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-start gap-2.5 overflow-hidden",
                      active
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-gray-300 hover:bg-accent"
                    )}
                  >
                    <Film className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block truncate">{scene.name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                        {description}
                      </span>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="max-w-72">
                  <p className="font-medium">{scene.name}</p>
                  <p className="text-muted-foreground">{description}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
