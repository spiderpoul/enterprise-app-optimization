import type React from 'react';
import type { RouteObject } from 'react-router';

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

export type MicrofrontendComponent = React.ComponentType<Record<string, unknown>>;

export type LazyMicrofrontendComponent = React.LazyExoticComponent<MicrofrontendComponent>;

export interface MicrofrontendRouteConfig extends Pick<RouteObject, 'path'> {
  Component: MicrofrontendComponent;
}

export interface LoadedMicrofrontend extends MicrofrontendManifest {
  Component: MicrofrontendComponent;
  LazyComponent: LazyMicrofrontendComponent;
  routeConfig: MicrofrontendRouteConfig;
}

export interface MicrofrontendApiProxyConfig {
  prefix: string;
  target: string;
  pathRewrite: string;
}
