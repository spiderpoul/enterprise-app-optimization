import { useEffect, useState } from 'react';

import {
  BACKGROUND_INITIALIZATION_STEP_IDS,
  runInitializationStep,
} from '../initialization/initializationSteps';
import { waitForBlockingInitialization } from '../initialization/blockingInitialization';

export interface UseShellInitializationResult {
  isInitializing: boolean;
}

export const useShellInitialization = (): UseShellInitializationResult => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runBackgroundSteps = async (): Promise<void> => {
      await Promise.all(
        BACKGROUND_INITIALIZATION_STEP_IDS.map((stepId) =>
          runInitializationStep(stepId).catch((error) => {
            console.error(
              `Background initialization step "${stepId}" failed.`,
              error,
            );
          }),
        ),
      );
    };

    const runInitialization = async () => {
      try {
        await waitForBlockingInitialization();

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
