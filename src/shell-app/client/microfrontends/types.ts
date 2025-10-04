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

export interface MicrofrontendRouteObject extends RouteObject {
  path: string;
}

export interface LoadedMicrofrontend extends MicrofrontendManifest {
  routeConfig: MicrofrontendRouteObject;
}

export interface MicrofrontendApiProxyConfig {
  prefix: string;
  target: string;
  pathRewrite: string;
}
