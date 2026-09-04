import React from 'react';
import Home from './pages/Home';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PaymentGuard React Error Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#E9E9E9] flex items-center justify-center p-6 text-[#151515]">
          <div className="bg-white rounded-3xl border-2 border-red-300 p-8 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
                ⚠️
              </span>
              <div>
                <h2 className="font-display font-black text-xl text-red-600 uppercase">
                  Runtime Error Caught
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>
            </div>
            <pre className="p-4 bg-slate-900 text-red-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
              {this.state.errorInfo?.componentStack || this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#FF6A00] text-white font-mono font-bold text-xs uppercase"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Home />
      </div>
    </ErrorBoundary>
  );
}

export default App;
