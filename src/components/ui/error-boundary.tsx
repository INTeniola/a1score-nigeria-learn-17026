import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-safe">
          <Card className="w-full max-w-sm md:max-w-md">
            <CardHeader className="text-center space-y-4 p-4 md:p-6">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-destructive" />
              </div>
              <CardTitle className="text-xl md:text-2xl leading-relaxed">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-4 md:p-6 pt-0 md:pt-0">
              {this.state.error && (
                <details className="text-xs md:text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details
                  </summary>
                  <pre className="whitespace-pre-wrap break-words mt-2">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  size="lg"
                  className="w-full min-h-12 md:min-h-11 text-base md:text-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="lg"
                  className="w-full min-h-12 md:min-h-11 text-base md:text-sm"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
