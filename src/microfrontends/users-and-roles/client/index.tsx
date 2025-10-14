import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router';
import { lazy } from 'react';

const UsersAndRolesLayout = lazy(() => import('./routes/UsersAndRolesLayout'));
const UserDetails = lazy(() => import('./routes/UserDetails'));
const UsersList = lazy(() => import('./routes/UsersList'));

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

export default usersAndRolesRouteConfig;
