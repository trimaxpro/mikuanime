import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed');

      if (isChunkError) {
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-accent-primary stroke-[1.5]" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary">New Version Available</h3>
            <p className="text-text-secondary text-sm mt-1 max-w-xs">
              We just deployed an update. Refresh to load the latest version.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 shadow-glow-sm hover:shadow-glow"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-accent-rose stroke-[1.5] mb-3" />
          <h3 className="font-display font-semibold text-lg text-text-primary">Something went wrong</h3>
          <p className="text-text-secondary text-sm mt-1 max-w-xs">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
