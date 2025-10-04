import React, { useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router-dom';

import 'antd/dist/reset.css';

import useReportsData from '../hooks/useReportsData';
import '../styles/index.css';
import type { ReportsRouteContext } from './context';

const markPerformance = (label: string) => {
  if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
    return;
  }

  performance.mark(label);
};

markPerformance('operations-reports:start-js-parsing');

const OperationsReportsLayout: React.FC = () => {
  const hasMarkedRender = useRef(false);

  if (!hasMarkedRender.current) {
    markPerformance('operations-reports:start-react-render');
    hasMarkedRender.current = true;
  }

  const { reports, isLoading, error } = useReportsData();

  useEffect(() => {
    markPerformance('operations-reports:end-react-render');
  }, []);

  const contextValue = useMemo<ReportsRouteContext>(
    () => ({ reports, isLoading, error }),
    [reports, isLoading, error],
  );

  return (
    <div className="operations-reports__content">
      <Outlet context={contextValue} />
    </div>
  );
};

export default OperationsReportsLayout;
