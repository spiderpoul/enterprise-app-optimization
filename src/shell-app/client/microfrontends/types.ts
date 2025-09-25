import type React from 'react';

export interface MicrofrontendManifest {
  id: string;
  name: string;
  menuLabel: string;
  routePath: string;
  entryUrl: string;
  description?: string;
  lastAcknowledgedAt?: string;
  manifestUrl?: string | null;
}

export interface LoadedMicrofrontend extends MicrofrontendManifest {
  Component: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>;
}
