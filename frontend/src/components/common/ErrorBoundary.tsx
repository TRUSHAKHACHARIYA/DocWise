"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "../ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm mt-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Something went wrong</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            The application encountered an unexpected error. We've been notified and are working on it.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="gap-2 bg-slate-900 shadow-xl shadow-slate-200"
          >
            <RefreshCw size={18} />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
