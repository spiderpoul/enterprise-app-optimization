import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { LoadedMicrofrontend, MicrofrontendManifest } from './types';

type MicrofrontendModule = {
  default?: React.ComponentType<Record<string, unknown>>;
  Microfrontend?: React.ComponentType<Record<string, unknown>>;
  Component?: React.ComponentType<Record<string, unknown>>;
};

const createLazyComponent = (entryUrl: string) =>
  React.lazy(async () => {
    const module = (await import(/* webpackIgnore: true */ entryUrl)) as MicrofrontendModule;
    const Component = module.default ?? module.Microfrontend ?? module.Component;

    if (!Component) {
      throw new Error(`Microfrontend at ${entryUrl} does not provide a default export.`);
    }

    return { default: Component };
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isMicrofrontendManifest = (value: unknown): value is MicrofrontendManifest => {
  if (!isRecord(value)) {
    return false;
  }

  const { id, name, menuLabel, routePath, entryUrl } = value;

  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    typeof menuLabel === 'string' &&
    typeof routePath === 'string' &&
    typeof entryUrl === 'string'
  );
};

const parseMicrofrontends = (input: unknown): MicrofrontendManifest[] => {
  if (!Array.isArray(input)) {
    throw new Error('Malformed microfrontend manifest payload received from server');
  }

  return input.filter(isMicrofrontendManifest);
};

export interface UseMicrofrontendsResult {
  microfrontends: LoadedMicrofrontend[];
  isLoading: boolean;
  error: string | null;
}

export const useMicrofrontends = (): UseMicrofrontendsResult => {
  const [manifests, setManifests] = useState<MicrofrontendManifest[]>([]);
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

        if (isMounted) {
          setManifests(payload);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unable to retrieve microfrontends.';
          setError(message);
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

  const microfrontends = useMemo<LoadedMicrofrontend[]>(
    () =>
      manifests.map((manifest) => ({
        ...manifest,
        Component: createLazyComponent(manifest.entryUrl),
      })),
    [manifests],
  );

  return {
    microfrontends,
    isLoading,
    error,
  };
};
