import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { LoadedMicrofrontend, MicrofrontendApiProxyConfig, MicrofrontendManifest } from './types';

type MicrofrontendComponent = ComponentType<Record<string, unknown>>;

type MicrofrontendModule = {
  default?: MicrofrontendComponent;
  Microfrontend?: MicrofrontendComponent;
  Component?: MicrofrontendComponent;
};

// Centralized resolver so we can switch between eager and lazy strategies without touching callers.
const resolveMicrofrontendComponent = async (entryUrl: string): Promise<MicrofrontendComponent> => {
  const module = (await import(/* webpackIgnore: true */ entryUrl)) as MicrofrontendModule;
  const Component = module.default ?? module.Microfrontend ?? module.Component;

  if (!Component) {
    throw new Error(`Microfrontend at ${entryUrl} does not provide a component export.`);
  }

  return Component;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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
          payload.map(async (manifest) => ({
            ...manifest,
            Component: await resolveMicrofrontendComponent(manifest.entryUrl),
          })),
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
