import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router';

import UsersAndRolesLayout from './routes/UsersAndRolesLayout';
import UserDetails from './routes/UserDetails';
import UsersList from './routes/UsersList';

type MicrofrontendRegistryEntry = {
  default?: RouteObject;
  routeConfig?: RouteObject;
};

declare global {
  interface Window {
    microfrontends?: Record<string, MicrofrontendRegistryEntry | undefined>;
  }
}

export const usersAndRolesRouteConfig: RouteObject = {
  path: '/users',
  Component: UsersAndRolesLayout,
  children: [
    {
      index: true,
      Component: UsersList,
    },
    {
      path: ':userId',
      Component: UserDetails,
    },
    {
      path: '*',
      element: <Navigate to=".." replace />,
    },
  ],
};

if (typeof window !== 'undefined') {
  const registry = (window.microfrontends ??= {});
  const microfrontendId = 'users-and-roles-microfrontend';
  const currentEntry = registry[microfrontendId] ?? {};

  registry[microfrontendId] = {
    ...currentEntry,
    routeConfig: usersAndRolesRouteConfig,
  };
}

export default usersAndRolesRouteConfig;
