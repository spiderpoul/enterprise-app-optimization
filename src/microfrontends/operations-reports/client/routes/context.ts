import { useOutletContext } from 'react-router-dom';

import type { OperationsReport } from '../types';

export type ReportsRouteContext = {
  reports: OperationsReport[];
  isLoading: boolean;
  error: string | null;
};

export const useReportsRouteContext = (): ReportsRouteContext =>
  useOutletContext<ReportsRouteContext>();
