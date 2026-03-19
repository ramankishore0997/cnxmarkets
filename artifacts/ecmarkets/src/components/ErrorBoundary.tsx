import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, info);
  }
  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ color: '#EFF2F5', fontWeight: 800, fontSize: 20 }}>Something went wrong</h2>
          <p style={{ color: '#848E9C', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })} style={{ padding: '10px 24px', background: '#00C274', color: '#000', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
