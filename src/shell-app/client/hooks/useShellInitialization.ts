import { useEffect, useMemo, useState } from 'react';

export interface InitializationStep {
  id: string;
  label: string;
  duration: number;
}

export interface UseShellInitializationResult {
  isInitializing: boolean;
  currentStep: InitializationStep | null;
  completedSteps: string[];
  steps: InitializationStep[];
  progress: number;
}

export const useShellInitialization = (): UseShellInitializationResult => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [steps, setSteps] = useState<InitializationStep[]>([]);

  useEffect(() => {
    let isMounted = true;

    const runInitialization = async () => {
      try {
        const planResponse = await fetch('/api/initialization/steps');

        if (!planResponse.ok) {
          throw new Error(`Unable to load shell initialization plan: ${planResponse.status}`);
        }

        const plan = (await planResponse.json()) as InitializationStep[];

        if (!isMounted) {
          return;
        }

        setSteps(plan);
        setCurrentIndex(0);
        setCompletedSteps([]);

        if (plan.length === 0) {
          setIsInitializing(false);
          return;
        }

        for (let index = 0; index < plan.length; index += 1) {
          if (!isMounted) {
            return;
          }

          const step = plan[index];
          setCurrentIndex(index);

          const response = await fetch(
            `/api/initialization/steps/${encodeURIComponent(step.id)}/complete`,
            {
              method: 'POST',
            },
          );

          if (!response.ok) {
            throw new Error(
              `Initialization step "${step.id}" failed with status ${response.status}.`,
            );
          }

          const { step: completedStep } = (await response.json()) as {
            step: InitializationStep;
          };

          if (!isMounted) {
            return;
          }

          setCompletedSteps((previous) => {
            if (previous.includes(completedStep.id)) {
              return previous;
            }

            return [...previous, completedStep.id];
          });
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

  const currentStep = useMemo<InitializationStep | null>(
    () => steps[currentIndex] ?? null,
    [steps, currentIndex],
  );

  const progress = useMemo(() => {
    if (steps.length === 0) {
      return 1;
    }

    return Math.min(completedSteps.length / steps.length, 1);
  }, [completedSteps, steps]);

  return {
    isInitializing,
    currentStep,
    completedSteps,
    steps,
    progress,
  };
};
