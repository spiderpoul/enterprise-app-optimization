import { useEffect, useState } from 'react';

const BLOCKING_INITIALIZATION_STEP_IDS = ['services-bootstrap', 'permissions'];

const BACKGROUND_INITIALIZATION_STEP_IDS = [
  'user-settings',
  'catalog-sync',
  'final-handshake',
];

export interface UseShellInitializationResult {
  isInitializing: boolean;
}

export const useShellInitialization = (): UseShellInitializationResult => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runInitializationStep = async (stepId: string): Promise<void> => {
      if (!isMounted) {
        return;
      }

      const response = await fetch(
        `/api/initialization/steps/${encodeURIComponent(stepId)}`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error(
          `Initialization step "${stepId}" failed with status ${response.status}.`,
        );
      }
    };

    const runBackgroundSteps = async (): Promise<void> => {
      for (const stepId of BACKGROUND_INITIALIZATION_STEP_IDS) {
        if (!isMounted) {
          return;
        }

        try {
          await runInitializationStep(stepId);
        } catch (error) {
          console.error(
            `Background initialization step "${stepId}" failed.`,
            error,
          );
        }
      }
    };

    const runInitialization = async () => {
      try {
        await Promise.all(
          BLOCKING_INITIALIZATION_STEP_IDS.map((stepId) =>
            runInitializationStep(stepId),
          ),
        );

        if (!isMounted) {
          return;
        }

        setIsInitializing(false);

        void runBackgroundSteps();
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
