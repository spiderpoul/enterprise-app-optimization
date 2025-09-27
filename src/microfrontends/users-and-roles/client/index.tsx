import React, { useMemo } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import 'antd/dist/reset.css';
import { Alert, Button, Card, Descriptions, Space, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import orderBy from 'lodash/orderBy';

import UserEngagementChart from './components/UserEngagementChart';
import useUsersData from './hooks/useUsersData';
import { UserAuditEntry, UserRecord, UserStatus } from './types';
import './styles/index.css';

const { Title, Paragraph, Text } = Typography;

const statusColors: Record<UserStatus, string> = {
  Active: 'green',
  Invited: 'geekblue',
  Suspended: 'volcano',
};

interface UsersListProps {
  users: UserRecord[];
  isLoading: boolean;
  error: string | null;
}

const UsersList: React.FC<UsersListProps> = ({ users, isLoading, error }) => {
  const navigate = useNavigate();

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
        <Title level={2}>Users and roles</Title>
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
          emptyText: isLoading ? 'Loading users…' : 'No users registered yet.',
        }}
        onRow={(user) => ({
          onClick: () => {
            void navigate(user.id);
          },
          style: { cursor: 'pointer' },
        })}
      />
    </Space>
  );
};

interface UserDetailsProps {
  users: UserRecord[];
  isLoading: boolean;
}

const UserDetails: React.FC<UserDetailsProps> = ({ users, isLoading }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const user = useMemo(() => users.find((item) => item.id === userId), [users, userId]);

  if (isLoading) {
    return (
      <div className="users-roles__loading">
        <Spin tip="Loading user details" />
      </div>
    );
  }

  if (!user) {
    return (
      <Space className="users-roles__section" direction="vertical" size="large">
        <Button
          type="link"
          className="users-roles__back-button"
          onClick={() => {
            void navigate('..');
          }}
        >
          Back to all users
        </Button>
        <Card>
          <Space direction="vertical" size="small">
            <Title level={4}>User unavailable</Title>
            <Paragraph>
              The requested user record could not be located. It may have been removed or renamed.
            </Paragraph>
          </Space>
        </Card>
      </Space>
    );
  }

  const auditColumns: ColumnsType<UserAuditEntry> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'When',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      render: (value: string) => <Text>{moment(value).format('MMM D, YYYY • HH:mm')}</Text>,
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
    },
  ];

  return (
    <Space className="users-roles__section" direction="vertical" size="large">
      <Button
        type="link"
        className="users-roles__back-button"
        onClick={() => {
          void navigate('..');
        }}
      >
        Back to all users
      </Button>

      <Card>
        <Space direction="vertical" size="small">
          <Title level={2}>{user.name}</Title>
          <Paragraph>
            {user.role} • {user.location}
          </Paragraph>
          <div className="users-roles__teams">
            <Tag color={statusColors[user.status]} className="users-roles__status-tag">
              {user.status}
            </Tag>
            {user.teams.map((team) => (
              <Tag key={`${user.id}-team-${team}`} color="blue">
                {team}
              </Tag>
            ))}
          </div>
        </Space>
      </Card>

      <div className="users-roles__detail-grid">
        <Card title="Engagement trend" className="users-roles__chart-card">
          <UserEngagementChart data={user.activity} />
        </Card>
        <Card title="Account overview">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Timezone">{user.timezone}</Descriptions.Item>
            <Descriptions.Item label="Last active">
              {moment(user.lastActive).format('MMM D, YYYY • HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Member since">
              {moment(user.createdAt).format('MMM D, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Last login IP">{user.lastLoginIp}</Descriptions.Item>
            <Descriptions.Item label="Direct reports">{user.directReports}</Descriptions.Item>
            {user.phone ? <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item> : null}
          </Descriptions>
        </Card>
      </div>

      <Card title="Permission scope">
        <Paragraph type="secondary">
          Permissions reflect the automation catalog operations and governance actions available to
          this user.
        </Paragraph>
        <div className="users-roles__permissions">
          {user.permissions.map((permission) => (
            <Tag key={`${user.id}-permission-${permission}`} color="geekblue">
              {permission}
            </Tag>
          ))}
        </div>
      </Card>

      <Card title="Recent access audits">
        <Table<UserAuditEntry>
          className="users-roles__audit-table"
          columns={auditColumns}
          dataSource={user.auditLog}
          rowKey={(entry) => entry.id}
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};

const UsersAndRolesApp: React.FC = () => {
  const { users, isLoading, error } = useUsersData();

  return (
    <div className="users-roles__content">
      <Routes>
        <Route index element={<UsersList users={users} isLoading={isLoading} error={error} />} />
        <Route path=":userId" element={<UserDetails users={users} isLoading={isLoading} />} />
        <Route path="*" element={<Navigate to=".." replace />} />
      </Routes>
    </div>
  );
};

export default UsersAndRolesApp;
