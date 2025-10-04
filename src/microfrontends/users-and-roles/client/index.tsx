import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router';

import UsersAndRolesLayout from './routes/UsersAndRolesLayout';
import UserDetails from './routes/UserDetails';
import UsersList from './routes/UsersList';

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
