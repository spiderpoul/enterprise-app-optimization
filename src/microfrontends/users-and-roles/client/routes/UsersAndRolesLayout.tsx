import React, { useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router-dom';

import 'antd/dist/reset.css';

import useUsersData from '../hooks/useUsersData';
import '../styles/index.css';
import type { UsersRouteContext } from './context';

const markPerformance = (label: string) => {
  if (typeof performance === 'undefined' || typeof performance.mark !== 'function') {
    return;
  }

  performance.mark(label);
};

markPerformance('users-and-roles:start-js-parsing');

const UsersAndRolesLayout: React.FC = () => {
  const hasMarkedRender = useRef(false);

  if (!hasMarkedRender.current) {
    markPerformance('users-and-roles:start-react-render');
    hasMarkedRender.current = true;
  }

  const { users, isLoading, error } = useUsersData();

  useEffect(() => {
    markPerformance('users-and-roles:end-react-render');
  }, []);

  const contextValue = useMemo<UsersRouteContext>(
    () => ({ users, isLoading, error }),
    [users, isLoading, error],
  );

  return (
    <div className="users-roles__content">
      <Outlet context={contextValue} />
    </div>
  );
};

export default UsersAndRolesLayout;
