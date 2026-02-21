import React, { Component, ErrorInfo, ReactNode } from 'react';

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
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-col mt-10">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
          <details className="mb-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{this.state.error?.toString()}</p>
            <pre className="mt-2 text-xs overflow-auto bg-gray-200 dark:bg-gray-600 p-2 rounded">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            className="self-start px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
