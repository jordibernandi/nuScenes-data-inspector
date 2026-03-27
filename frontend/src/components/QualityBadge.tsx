import { CircleCheck, CircleAlert, CircleX } from "lucide-react";
import { useQuality } from "@/hooks/useQuality";
import type { QualityStatus } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<QualityStatus, string> = {
  PASS: "bg-pass/20 text-pass border-pass/40 hover:bg-pass/30",
  WARNING: "bg-warning/20 text-warning border-warning/40 hover:bg-warning/30",
  FAIL: "bg-fail/20 text-fail border-fail/40 hover:bg-fail/30",
};

const STATUS_ICON: Record<QualityStatus, typeof CircleCheck> = {
  PASS: CircleCheck,
  WARNING: CircleAlert,
  FAIL: CircleX,
};

const CHECK_DOT: Record<QualityStatus, string> = {
  PASS: "bg-pass",
  WARNING: "bg-warning",
  FAIL: "bg-fail",
};

interface QualityBadgeProps {
  sampleToken: string | null;
}

export function QualityBadge({ sampleToken }: QualityBadgeProps) {
  const { data, isLoading } = useQuality(sampleToken);

  if (!sampleToken || isLoading || !data) {
    return <Skeleton className="w-24 h-8 shrink-0 bg-muted" />;
  }

  const Icon = STATUS_ICON[data.status];

  return (
    <div className="shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer gap-1.5 px-3 py-1 text-sm font-medium",
              STATUS_STYLES[data.status]
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {data.status}
          </Badge>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 bg-panel border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Quality Checks
          </h4>
          <ul className="space-y-2.5">
            {data.checks.map((check) => (
              <li key={check.name} className="text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      CHECK_DOT[check.status]
                    )}
                  />
                  <span className="text-gray-200 font-medium">
                    {check.label}
                  </span>
                </div>
                <p className="text-muted-foreground ml-4 mt-0.5">{check.detail}</p>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
