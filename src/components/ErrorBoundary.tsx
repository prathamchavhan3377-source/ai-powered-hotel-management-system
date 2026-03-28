import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirestoreError = false;

      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
          isFirestoreError = true;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-red-100 p-10 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-red-600 shadow-lg shadow-red-900/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Something went wrong</h2>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed break-words">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                <RefreshCcw className="w-5 h-5" />
                Reload Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>

            {isFirestoreError && (
              <p className="mt-8 text-xs text-slate-400 font-medium leading-relaxed">
                If this is a permission error, please ensure you have the correct role assigned in the database.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
