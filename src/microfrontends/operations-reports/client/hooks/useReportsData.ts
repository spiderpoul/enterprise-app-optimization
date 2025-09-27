import { useEffect, useMemo, useState } from 'react';
import { OperationsReport } from '../types';

interface ReportsState {
  reports: OperationsReport[];
  isLoading: boolean;
  error: string | null;
}

const mapReport = (report: OperationsReport): OperationsReport => ({
  ...report,
  timeline: [...report.timeline],
  distribution: [...report.distribution],
  metrics: [...report.metrics],
  tags: [...report.tags],
  highlights: [...report.highlights],
});

export const useReportsData = (): ReportsState => {
  const [reports, setReports] = useState<OperationsReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/reports');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload: OperationsReport[] = await response.json();

        if (!isMounted) {
          return;
        }

        setReports(payload.map(mapReport));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Unable to load reports';
        setError(message);
        setReports([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const memoizedReports = useMemo(() => reports, [reports]);

  return {
    reports: memoizedReports,
    isLoading,
    error,
  };
};

export default useReportsData;
