import { GripHorizontal } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group
    orientation={orientation}
    className={cn(
      "flex h-full w-full",
      orientation === "vertical" ? "flex-col" : "flex-row",
      className,
    )}
    {...props}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
  orientation?: "horizontal" | "vertical";
}) => (
  <Separator
    className={cn(
      "relative flex items-center justify-center bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      orientation === "vertical"
        ? "h-px w-full cursor-row-resize"
        : "w-px h-full cursor-col-resize",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div
        className={cn(
          "z-10 flex items-center justify-center rounded-sm border bg-border",
          orientation === "vertical" ? "h-3 w-8" : "h-8 w-3",
        )}
      >
        <GripHorizontal
          className={cn(
            "h-2.5 w-2.5",
            orientation === "horizontal" && "rotate-90",
          )}
        />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
