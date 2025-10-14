import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const OperationsReportsLayout = lazy(() => import('./routes/OperationsReportsLayout'));
const ReportDetails = lazy(() => import('./routes/ReportDetails'));
const ReportsList = lazy(() => import('./routes/ReportsList'));

export const operationsReportsRouteConfig: RouteObject = {
  path: '/reports',
  Component: OperationsReportsLayout,
  children: [
    {
      index: true,
      Component: ReportsList,
    },
    {
      path: ':reportId',
      Component: ReportDetails,
    },
  ],
};

export default operationsReportsRouteConfig;
