import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import orderBy from 'lodash/orderBy';
import { UserAccount } from '@kaspersky/hexa-ui-icons/24';

import type { UserRecord } from '../types';
import { useUsersRouteContext } from './context';
import { statusColors } from './utils';

const { Title, Paragraph, Text } = Typography;

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const { users, isLoading, error } = useUsersRouteContext();

  const sortedUsers = useMemo(() => orderBy(users, (user) => user.lastActive, 'desc'), [users]);

  const columns = useMemo<ColumnsType<UserRecord>>(
    () => [
      {
        title: 'User',
        key: 'name',
        render: (_, user) => (
          <div className="users-roles__table-summary">
            <Text strong>{user.name}</Text>
            <Text type="secondary">{user.email}</Text>
          </div>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role: string) => <Text>{role}</Text>,
      },
      {
        title: 'Teams',
        key: 'teams',
        render: (_, user) => (
          <div className="users-roles__teams">
            {user.teams.map((team) => (
              <Tag key={`${user.id}-${team}`} color="blue">
                {team}
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        render: (_, user) => (
          <Tag color={statusColors[user.status]} className="users-roles__status-tag">
            {user.status}
          </Tag>
        ),
      },
      {
        title: 'Last active',
        key: 'lastActive',
        render: (_, user) => <Text>{moment(user.lastActive).fromNow()}</Text>,
      },
      {
        title: 'Created',
        key: 'createdAt',
        align: 'right',
        render: (_, user) => <Text>{moment(user.createdAt).format('MMM D, YYYY')}</Text>,
      },
    ],
    [],
  );

  return (
    <Space className="users-roles__section" direction="vertical" size="large">
      <div>
        <Title level={2} className="users-roles__title">
          <span className="users-roles__title-icon" aria-hidden="true">
            <UserAccount />
          </span>
          Users and roles
        </Title>
        <Paragraph>
          Review active workspace members, their assigned roles, and team affiliations. Select a
          user to inspect detailed activity, permission scopes, and the most recent audit trail
          entries.
        </Paragraph>
      </div>

      {error ? (
        <Alert type="error" showIcon message="Unable to load users" description={error} />
      ) : null}

      <Table<UserRecord>
        dataSource={sortedUsers}
        columns={columns}
        rowKey={(user) => user.id}
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: isLoading ? 'Loading users…' : 'No workspace members found.',
        }}
        onRow={(user) => ({
          onClick: () => {
            void navigate(user.id);
          },
          className: 'users-roles__table-row',
          style: { cursor: 'pointer' },
        })}
      />
    </Space>
  );
};

export default UsersList;
