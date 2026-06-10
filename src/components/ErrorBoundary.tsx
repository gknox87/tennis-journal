import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Route to navigate to when recovering from an error. */
  recoveryRoute?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

type ErrorBoundaryContentProps = ErrorBoundaryProps & {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
};

class ErrorBoundaryContent extends React.Component<
  ErrorBoundaryContentProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryContentProps) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  recover = (targetPath: string) => {
    this.setState(
      (prev) => ({
        hasError: false,
        error: null,
        resetKey: prev.resetKey + 1,
      }),
      () => {
        if (this.props.location.pathname !== targetPath) {
          this.props.navigate(targetPath, { replace: true });
        }
      }
    );
  };

  handleRetry = () => {
    this.recover(this.props.recoveryRoute ?? "/dashboard");
  };

  handleGoToDashboard = () => {
    this.recover("/dashboard");
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500">
              {this.state.error?.message || "An unexpected error occurred while loading this page."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={this.handleGoToDashboard}
                className="rounded-xl"
              >
                Go to Dashboard
              </Button>
              <Button onClick={this.handleRetry} className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

function ErrorBoundaryWithNavigate(props: ErrorBoundaryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  return <ErrorBoundaryContent {...props} navigate={navigate} location={location} />;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryWithNavigate {...props} />;
}