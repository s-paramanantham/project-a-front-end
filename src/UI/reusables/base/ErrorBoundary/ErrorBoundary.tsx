import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogIn, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.state = { ...this.state, errorInfo };
    try {
      this.setState({ errorInfo });
    } catch {
      // Handled in environments without active DOM render tree
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Also log to console in development
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    const nextState: ErrorBoundaryState = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
    this.state = nextState;
    try {
      this.setState(nextState);
    } catch {
      // Handled in environments without active DOM render tree
    }
  };

  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { fallback, children } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback({ error, resetErrorBoundary: this.resetErrorBoundary });
      }

      if (fallback) {
        return fallback;
      }

      // Default White + Orange themed Fallback UI
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-center items-center px-4 py-8 selection:bg-orange-100"
        >
          <div className="w-full max-w-lg">
            <Card className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                <AlertTriangle size={28} strokeWidth={2.2} />
              </div>

              {/* Title & Message */}
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                An unexpected application error occurred. We have captured the event and you can safely reload or return to the authentication flow.
              </p>

              {/* Error Summary Banner */}
              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl text-left text-xs text-red-700 mb-6 font-mono break-all">
                {error.name}: {error.message || 'Unknown runtime error'}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={this.resetErrorBoundary}
                  leftIcon={<RefreshCw size={15} />}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    this.resetErrorBoundary();
                    window.location.href = '/login';
                  }}
                  leftIcon={<LogIn size={15} />}
                  className="w-full sm:w-auto"
                >
                  Back to Login
                </Button>
              </div>

              {/* Collapsible Technical Details */}
              {errorInfo && (
                <div className="mt-4 pt-4 border-t border-neutral-100 text-left">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium transition-colors"
                  >
                    <span>{showDetails ? 'Hide technical trace' : 'View technical trace'}</span>
                    {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showDetails && (
                    <pre className="mt-2.5 p-3 bg-neutral-900 text-neutral-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                      {error.stack}
                      {'\n\nComponent Stack:'}
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      );
    }

    return children;
  }
}
