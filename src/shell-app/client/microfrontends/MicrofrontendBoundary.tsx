import React from 'react';

interface MicrofrontendBoundaryProps {
  name: string;
  children: React.ReactNode;
}

interface MicrofrontendBoundaryState {
  hasError: boolean;
  message?: string;
}

export class MicrofrontendBoundary extends React.Component<
  MicrofrontendBoundaryProps,
  MicrofrontendBoundaryState
> {
  state: MicrofrontendBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): MicrofrontendBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error(`Microfrontend \"${this.props.name}\" failed to render.`, error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className="microfrontend-error">
          <h2>Unable to load {this.props.name}</h2>
          <p>{this.state.message ?? 'The microfrontend failed to render. Check the browser console for details.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MicrofrontendBoundary;
