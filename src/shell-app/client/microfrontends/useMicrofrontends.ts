import { useEffect, useState } from 'react';
import type { RouteObject } from 'react-router';
import {
  LoadedMicrofrontend,
  MicrofrontendApiProxyConfig,
  MicrofrontendManifest,
  MicrofrontendRouteObject,
} from './types';

type MicrofrontendModule = {
  default?: RouteObject;
  routeConfig?: RouteObject;
};

type RemoteContainer = {
  init: (shareScope: unknown) => Promise<void>;
  get: (module: string) => Promise<() => unknown>;
};

const ROUTES_MODULE_ID = './routes';

const isRemoteContainer = (value: unknown): value is RemoteContainer =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as RemoteContainer).init === 'function' &&
  typeof (value as RemoteContainer).get === 'function';

const loadMicrofrontendModule = async (
  manifest: MicrofrontendManifest,
): Promise<MicrofrontendModule> => {
  if (typeof __webpack_init_sharing__ === 'function') {
    await __webpack_init_sharing__('default');
  }

  const containerModule = (await import(/* webpackIgnore: true */ manifest.entryUrl)) as unknown;

  if (!isRemoteContainer(containerModule)) {
    throw new Error(`Remote at ${manifest.entryUrl} is not a valid module federation container.`);
  }

  const shareScope =
    typeof __webpack_share_scopes__ === 'object' && __webpack_share_scopes__ !== null
      ? (__webpack_share_scopes__.default ?? {})
      : {};
  await containerModule.init(shareScope);
  const factory = await containerModule.get(ROUTES_MODULE_ID);
  const module = await factory();

  return module as MicrofrontendModule;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const ensureLeadingSlash = (path: string): string => {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, '');

  return trimmed === '' ? '/' : trimmed;
};

const resolveMicrofrontendRouteConfig = (
  module: MicrofrontendModule,
  entryUrl: string,
): MicrofrontendRouteObject => {
  const routeConfig = module.routeConfig ?? module.default;

  if (!routeConfig || !isRecord(routeConfig)) {
    throw new Error(`Microfrontend at ${entryUrl} does not provide a route configuration.`);
  }

  if (typeof routeConfig.path !== 'string' || routeConfig.path.trim() === '') {
    throw new Error(`Microfrontend at ${entryUrl} must define a string path on its route config.`);
  }

  const normalizedPath = ensureLeadingSlash(routeConfig.path);

  return {
    ...routeConfig,
    path: normalizedPath,
  } as MicrofrontendRouteObject;
};

const isMicrofrontendApiProxyConfig = (value: unknown): value is MicrofrontendApiProxyConfig => {
  if (!isRecord(value)) {
    return false;
  }

  const { prefix, target, pathRewrite } = value;

  return (
    typeof prefix === 'string' && typeof target === 'string' && typeof pathRewrite === 'string'
  );
};

const toMicrofrontendManifest = (value: unknown): MicrofrontendManifest | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { id, name, menuLabel, routePath, entryUrl } = value;

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof menuLabel !== 'string' ||
    typeof routePath !== 'string' ||
    typeof entryUrl !== 'string'
  ) {
    return null;
  }

  const base: MicrofrontendManifest = {
    id,
    name,
    menuLabel,
    routePath,
    entryUrl,
    description: typeof value.description === 'string' ? value.description : undefined,
    lastAcknowledgedAt:
      typeof value.lastAcknowledgedAt === 'string' ? value.lastAcknowledgedAt : undefined,
    manifestUrl:
      typeof value.manifestUrl === 'string' || value.manifestUrl === null
        ? (value.manifestUrl ?? null)
        : undefined,
    apiProxy: null,
  };

  if (value.apiProxy && isMicrofrontendApiProxyConfig(value.apiProxy)) {
    base.apiProxy = value.apiProxy;
  }

  return base;
};

const parseMicrofrontends = (input: unknown): MicrofrontendManifest[] => {
  if (!Array.isArray(input)) {
    throw new Error('Malformed microfrontend manifest payload received from server');
  }

  return input
    .map(toMicrofrontendManifest)
    .filter((manifest): manifest is MicrofrontendManifest => manifest !== null);
};

export interface UseMicrofrontendsResult {
  microfrontends: LoadedMicrofrontend[];
  isLoading: boolean;
  error: string | null;
}

export const useMicrofrontends = (): UseMicrofrontendsResult => {
  const [microfrontends, setMicrofrontends] = useState<LoadedMicrofrontend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchManifests = async () => {
      try {
        const response = await fetch('/api/microfrontends');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = parseMicrofrontends((await response.json()) as unknown);
        const loadedMicrofrontends = await Promise.all(
          payload.map(async (manifest) => {
            const module = await loadMicrofrontendModule(manifest);
            const routeConfig = resolveMicrofrontendRouteConfig(module, manifest.entryUrl);

            return {
              ...manifest,
              routeConfig,
            } satisfies LoadedMicrofrontend;
          }),
        );

        if (isMounted) {
          setMicrofrontends(loadedMicrofrontends);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load microfrontends', err);
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unable to retrieve microfrontends.';
          setError(message);
          setMicrofrontends([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchManifests();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    microfrontends,
    isLoading,
    error,
  };
};
