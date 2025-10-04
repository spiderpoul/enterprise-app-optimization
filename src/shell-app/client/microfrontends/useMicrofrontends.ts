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

declare global {
  interface Window {
    microfrontends?: Record<string, MicrofrontendModule | undefined>;
  }
}

const scriptPromises = new Map<string, Promise<void>>();

const loadScript = (entryUrl: string): Promise<void> => {
  if (scriptPromises.has(entryUrl)) {
    return scriptPromises.get(entryUrl)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error(`Cannot load script ${entryUrl} outside of a browser environment.`));
      return;
    }

    const existingScript = Array.from(document.querySelectorAll<HTMLScriptElement>('script')).find(
      (element) => {
        if (element.getAttribute('data-microfrontend-entry') === entryUrl) {
          return true;
        }

        if (!element.src) {
          return false;
        }

        try {
          const elementUrl = new URL(element.src, document.baseURI).href;
          const requestedUrl = new URL(entryUrl, document.baseURI).href;

          return elementUrl === requestedUrl;
        } catch (error) {
          console.warn('Unable to normalize microfrontend script URL', error);
          return false;
        }
      },
    );

    if (existingScript) {
      existingScript.setAttribute('data-microfrontend-entry', entryUrl);

      if (
        existingScript.dataset.microfrontendLoaded === 'true' ||
        existingScript.readyState === 'complete'
      ) {
        resolve();
        return;
      }

      const handleError = () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
        reject(new Error(`Failed to load microfrontend from ${entryUrl}.`));
      };

      const handleLoad = () => {
        existingScript.dataset.microfrontendLoaded = 'true';
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
        resolve();
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = entryUrl;
    script.setAttribute('data-microfrontend-entry', entryUrl);

    const handleLoad = () => {
      script.dataset.microfrontendLoaded = 'true';
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      resolve();
    };

    const handleError = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      script.remove();
      reject(new Error(`Failed to load microfrontend from ${entryUrl}.`));
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    document.head.appendChild(script);
  });

  scriptPromises.set(entryUrl, promise);

  promise.catch(() => {
    scriptPromises.delete(entryUrl);
  });

  return promise;
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
            await loadScript(manifest.entryUrl);

            const registry = window.microfrontends;

            if (!registry) {
              throw new Error(
                `Microfrontend registry is unavailable after loading ${manifest.entryUrl}.`,
              );
            }

            const module = registry[manifest.id];

            if (!module) {
              throw new Error(
                `Microfrontend ${manifest.id} did not register itself on window.microfrontends.`,
              );
            }

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
