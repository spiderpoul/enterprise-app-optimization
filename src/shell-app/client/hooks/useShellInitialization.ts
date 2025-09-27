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

const initializationPlan: InitializationStep[] = [
  {
    id: 'services-bootstrap',
    label: 'Bootstrapping shared telemetry and notification services…',
    duration: 650,
  },
  {
    id: 'user-settings',
    label: 'Retrieving operator workspace preferences…',
    duration: 820,
  },
  {
    id: 'catalog-sync',
    label: 'Synchronising automation catalog metadata…',
    duration: 780,
  },
  {
    id: 'permissions',
    label: 'Resolving permission boundaries and access policies…',
    duration: 640,
  },
  {
    id: 'final-handshake',
    label: 'Finalising service handshakes and secure channels…',
    duration: 520,
  },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const useShellInitialization = (): UseShellInitializationResult => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runInitialization = async () => {
      for (let index = 0; index < initializationPlan.length; index += 1) {
        if (!isMounted) {
          return;
        }

        setCurrentIndex(index);
        const step = initializationPlan[index];
        await wait(step.duration);

        if (!isMounted) {
          return;
        }

        setCompletedSteps((previous) =>
          previous.includes(step.id) ? previous : [...previous, step.id],
        );

        if (step.id === 'catalog-sync') {
          await wait(460);
        }

        if (step.id === 'permissions') {
          await Promise.all([wait(220), wait(180)]);
        }
      }

      if (!isMounted) {
        return;
      }

      await wait(350);
      setIsInitializing(false);
    };

    void runInitialization();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentStep = useMemo<InitializationStep | null>(
    () => initializationPlan[currentIndex] ?? null,
    [currentIndex],
  );

  const progress = useMemo(() => {
    if (initializationPlan.length === 0) {
      return 1;
    }

    return Math.min(completedSteps.length / initializationPlan.length, 1);
  }, [completedSteps]);

  return {
    isInitializing,
    currentStep,
    completedSteps,
    steps: initializationPlan,
    progress,
  };
};
