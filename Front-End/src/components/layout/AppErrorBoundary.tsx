import React from "react";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App render error:", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-display font-bold">Page failed to render</h2>
          <p className="text-sm text-muted-foreground">
            A runtime error blocked page rendering. Click retry to reload the app.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="h-10 rounded-lg px-4 bg-primary text-primary-foreground text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
