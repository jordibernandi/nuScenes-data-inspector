import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-fail" />
            <p className="text-fail font-medium">Something went wrong</p>
            <p className="text-sm">{this.state.error?.message}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
