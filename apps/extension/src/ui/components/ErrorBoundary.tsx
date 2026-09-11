import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h1 className="font-bold">Something went wrong.</h1>
          <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap">{this.state.error?.message}</pre>
          <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
