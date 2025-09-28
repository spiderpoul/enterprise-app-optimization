import { useEffect, useMemo, useState } from 'react';
import { OperationsReport } from '../types';
import manifest from '../../manifest.json';

interface ReportsState {
  reports: OperationsReport[];
  isLoading: boolean;
  error: string | null;
}

interface ManifestWithApiPrefix {
  api?: {
    prefix?: string | null;
  } | null;
}

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const normalizeApiPrefix = (prefix: string | null | undefined, fallback: string) => {
  if (typeof prefix !== 'string') {
    return fallback;
  }

  const trimmed = prefix.trim();

  if (!trimmed) {
    return fallback;
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash || fallback;
};

const manifestApiPrefix = (manifest as ManifestWithApiPrefix).api?.prefix ?? null;
const API_PREFIX = normalizeApiPrefix(manifestApiPrefix, '/api/mf/reports');

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalizedPath}`;
};

const mapReport = (report: OperationsReport): OperationsReport => ({
  ...report,
  timeline: [...report.timeline],
  distribution: [...report.distribution],
  metrics: [...report.metrics],
  tags: [...report.tags],
  highlights: [...report.highlights],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOperationsReport = (value: unknown): value is OperationsReport => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    name,
    owner,
    status,
    healthScore,
    lastUpdated,
    summary,
    category,
    tags,
    metrics,
    timeline,
    distribution,
    highlights,
  } = value;

  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    typeof owner === 'string' &&
    typeof status === 'string' &&
    typeof healthScore === 'number' &&
    typeof lastUpdated === 'string' &&
    typeof summary === 'string' &&
    typeof category === 'string' &&
    Array.isArray(tags) &&
    Array.isArray(metrics) &&
    Array.isArray(timeline) &&
    Array.isArray(distribution) &&
    Array.isArray(highlights)
  );
};

const parseReports = (input: unknown): OperationsReport[] => {
  if (!Array.isArray(input)) {
    throw new Error('Malformed reports payload received from server');
  }

  return input.filter(isOperationsReport).map(mapReport);
};

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
        const response = await fetch(buildApiUrl('/reports'));

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const rawPayload = (await response.json()) as unknown;
        const parsed = parseReports(rawPayload);

        if (!isMounted) {
          return;
        }

        setReports(parsed);
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

    void loadReports();

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
