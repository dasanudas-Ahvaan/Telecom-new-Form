import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error internally for debugging (e.g., to an error tracking service)
    console.error("Uncaught app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Clean fallback UI matching your Tailwind styling
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="max-w-md w-full bg-gray-50 shadow-sm rounded-xl p-8 border border-gray-200 text-center space-y-4">
            <div className="text-amber-600 text-4xl font-bold">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900">Unexpected Error</h2>
            <p className="text-sm text-gray-600">
              Something went wrong in this section. We have logged the issue and are working to fix it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}