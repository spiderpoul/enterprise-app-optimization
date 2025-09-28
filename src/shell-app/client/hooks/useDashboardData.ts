import { useEffect, useMemo, useState } from 'react';

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  owner: string;
  eta: string;
  state: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface UseDashboardDataResult {
  metrics: DashboardMetric[];
  optimizationTasks: DashboardTask[];
  activityFeed: DashboardActivity[];
  isLoading: boolean;
  error: string | null;
}

type DashboardApiResponse = {
  metrics?: DashboardMetric[];
  optimizationTasks?: DashboardTask[];
  activityFeed?: DashboardActivity[];
};

const createSafeArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

export const useDashboardData = (): UseDashboardDataResult => {
  const [payload, setPayload] = useState<DashboardApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/dashboard');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as DashboardApiResponse;

        if (!isMounted) {
          return;
        }

        setPayload(data);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Unable to load dashboard insights at this time.';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => createSafeArray(payload?.metrics), [payload]);
  const optimizationTasks = useMemo(() => createSafeArray(payload?.optimizationTasks), [payload]);
  const activityFeed = useMemo(() => createSafeArray(payload?.activityFeed), [payload]);

  return {
    metrics,
    optimizationTasks,
    activityFeed,
    isLoading,
    error,
  };
};
