import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { LoadedMicrofrontend, MicrofrontendManifest } from './types';

const createLazyComponent = (entryUrl: string) =>
  React.lazy(async () => {
    const module = await import(/* webpackIgnore: true */ entryUrl);
    const Component = module?.default ?? module?.Microfrontend ?? module?.Component;

    if (!Component) {
      throw new Error(`Microfrontend at ${entryUrl} does not provide a default export.`);
    }

    return { default: Component };
  });

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

        const payload = (await response.json()) as MicrofrontendManifest[];

        if (isMounted) {
          setManifests(payload);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message ?? 'Unable to retrieve microfrontends.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchManifests();

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
    [manifests]
  );

  return {
    microfrontends,
    isLoading,
    error,
  };
};
