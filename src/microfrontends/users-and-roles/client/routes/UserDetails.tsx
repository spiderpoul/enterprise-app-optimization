import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivityMonitor, ShieldOkSolid } from '@kaspersky/hexa-ui-icons/24';
import { Button, Card, Descriptions, Space, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

import UserEngagementChart from '../components/UserEngagementChart';
import type { UserAuditEntry } from '../types';
import { useUsersRouteContext } from './context';
import { statusColors } from './utils';

const { Title, Paragraph, Text } = Typography;

const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const { users, isLoading } = useUsersRouteContext();
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

      <Card
        title={
          <span className="users-roles__card-title">
            <ShieldOkSolid aria-hidden="true" />
            Permission scope
          </span>
        }
      >
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

      <Card
        title={
          <span className="users-roles__card-title">
            <ActivityMonitor aria-hidden="true" />
            Recent access audits
          </span>
        }
      >
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

export default UserDetails;
