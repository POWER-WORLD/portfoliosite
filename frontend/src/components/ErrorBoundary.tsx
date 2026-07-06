import { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Frontend Component Tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#050816] text-white">
          <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-lg w-full text-center space-y-6 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 text-3xl">
              <FaExclamationTriangle className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
                Interface Distort Encountered
              </h2>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                An unforeseen rendering error occurred while loading this section.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-red-300 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent to-secondary text-bg-dark font-bold tracking-wider hover:shadow-[0_0_25px_rgba(108,99,255,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRedo className="text-sm" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
