import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-8 shadow-2xl border border-red-500/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <FaExclamationTriangle className="text-3xl text-red-400" />
              </div>
              <div>
              <h1 className="text-2xl font-bold text-red-400">An error occurred</h1>
              <p className="text-gray-400 mt-1">The application crashed unexpectedly</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <h2 className="text-sm font-semibold text-red-400 mb-2">Error details:</h2>
                <p className="text-sm text-red-300 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-red-200 mt-2 overflow-auto max-h-60 bg-red-900/30 p-3 rounded border border-red-500/20">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30 font-semibold"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-400/30 font-semibold"
              >
                Refresh page
              </button>
            </div>

            {process.env.NODE_ENV === 'production' && (
              <p className="text-xs text-gray-500 mt-6">
                If the problem persists, please contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
