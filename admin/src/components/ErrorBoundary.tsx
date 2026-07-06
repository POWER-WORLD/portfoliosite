import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught Error in Admin Dashboard:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', backgroundColor: '#080710', color: '#fff' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.15)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#f87171', fontSize: '1.75rem' }}>
              <FaExclamationTriangle />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Dashboard Encountered an Error</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              An unhandled exception occurred in the content engine workspace.
            </p>

            {this.state.error && (
              <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#fca5a5', textAlign: 'left', overflowX: 'auto', marginBottom: '1.5rem', maxHeight: '120px' }}>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', justifyContent: 'center' }}
            >
              <FaRedo /> Reload Admin Panel
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
