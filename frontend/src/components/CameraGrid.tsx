import { Camera } from "lucide-react";
import { cameraImageUrl } from "@/api/client";
import { CAMERA_CHANNELS } from "@/types/api";
import type { SampleDetail } from "@/types/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  CAM_FRONT: "Front",
  CAM_FRONT_LEFT: "Front Left",
  CAM_FRONT_RIGHT: "Front Right",
  CAM_BACK: "Back",
  CAM_BACK_LEFT: "Back Left",
  CAM_BACK_RIGHT: "Back Right",
};

interface CameraGridProps {
  sampleToken: string;
  sensors: SampleDetail["sensors"];
}

export function CameraGrid({ sampleToken, sensors }: CameraGridProps) {
  return (
    <div className="flex items-center justify-center h-full w-full p-2 overflow-hidden">
      <div
        className="grid grid-cols-3 grid-rows-2 gap-2 max-h-full max-w-full"
        style={{ aspectRatio: `${(16 / 9) * 3} / 2` }}
      >
        {CAMERA_CHANNELS.map((channel) => {
          const available = channel in sensors;
          return (
            <Card
              key={channel}
              className="relative overflow-hidden border-border bg-card p-0"
            >
              {available ? (
                <img
                  src={cameraImageUrl(sampleToken, channel)}
                  alt={channel}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Camera className="h-5 w-5 opacity-40" />
                  <span className="text-xs">No data</span>
                </div>
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-1.5 left-1.5 bg-black/70 text-gray-300 border-0 text-xs px-1.5 py-0.5"
              >
                {LABELS[channel] ?? channel}
              </Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
