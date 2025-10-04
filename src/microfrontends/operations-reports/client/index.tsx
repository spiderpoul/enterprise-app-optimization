import type { RouteObject } from 'react-router';

import OperationsReportsLayout from './routes/OperationsReportsLayout';
import ReportDetails from './routes/ReportDetails';
import ReportsList from './routes/ReportsList';

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
