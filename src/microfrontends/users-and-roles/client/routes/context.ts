import { useOutletContext } from 'react-router-dom';

import type { UserRecord } from '../types';

export type UsersRouteContext = {
  users: UserRecord[];
  isLoading: boolean;
  error: string | null;
};

export const useUsersRouteContext = (): UsersRouteContext => useOutletContext<UsersRouteContext>();
