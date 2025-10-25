import { useEffect, useState } from 'react';

const INITIALIZATION_STEP_IDS = [
  'services-bootstrap',
  'user-settings',
  'catalog-sync',
  'permissions',
  'final-handshake',
];

export interface UseShellInitializationResult {
  isInitializing: boolean;
}

export const useShellInitialization = (): UseShellInitializationResult => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runInitialization = async () => {
      try {
        for (const stepId of INITIALIZATION_STEP_IDS) {
          if (!isMounted) {
            return;
          }

          const response = await fetch(`/api/initialization/steps/${encodeURIComponent(stepId)}`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error(
              `Initialization step "${stepId}" failed with status ${response.status}.`,
            );
          }
        }

        if (!isMounted) {
          return;
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Shell initialization failed.', error);

        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    void runInitialization();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isInitializing,
  };
};
