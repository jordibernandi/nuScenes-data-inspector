import type { ReactNode } from "react";
import { Car, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function Layout({ sidebar, main }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-surface text-gray-200">
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center gap-3 px-3 py-2 border-b border-border bg-panel shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-panel border-border">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-panel border-border">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            {sidebar}
          </SheetContent>
        </Sheet>
        <Car className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold text-foreground">nuScenes Inspector</span>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:block h-full w-72 shrink-0 border-r border-border bg-panel overflow-hidden">
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4">{main}</main>
    </div>
  );
}
