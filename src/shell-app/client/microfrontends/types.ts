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
  apiProxy?: MicrofrontendApiProxyConfig | null;
}

export interface LoadedMicrofrontend extends MicrofrontendManifest {
  Component: React.ComponentType<Record<string, unknown>>;
}

export interface MicrofrontendApiProxyConfig {
  prefix: string;
  target: string;
  pathRewrite: string;
}
