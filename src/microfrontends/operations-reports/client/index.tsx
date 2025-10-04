import type { RouteObject } from 'react-router';

import OperationsReportsLayout from './routes/OperationsReportsLayout';
import ReportDetails from './routes/ReportDetails';
import ReportsList from './routes/ReportsList';

type MicrofrontendRegistryEntry = {
  default?: RouteObject;
  routeConfig?: RouteObject;
};

declare global {
  interface Window {
    microfrontends?: Record<string, MicrofrontendRegistryEntry | undefined>;
  }
}

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

if (typeof window !== 'undefined') {
  const registry = (window.microfrontends ??= {});
  const microfrontendId = 'reports-microfrontend';
  const currentEntry = registry[microfrontendId] ?? {};

  registry[microfrontendId] = {
    ...currentEntry,
    routeConfig: operationsReportsRouteConfig,
  };
}

export default operationsReportsRouteConfig;
