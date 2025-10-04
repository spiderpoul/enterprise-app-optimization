import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Analytics } from '@kaspersky/hexa-ui-icons/24';

import type { OperationsReport } from '../types';
import { useReportsRouteContext } from './context';
import { formatUpdatedAt, getStatusColor } from './utils';

const { Title, Paragraph, Text } = Typography;

const ReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { reports, isLoading, error } = useReportsRouteContext();

  const columns: ColumnsType<OperationsReport> = useMemo(
    () => [
      {
        key: 'overview',
        title: 'Report overview',
        render: (_, report) => (
          <div className="operations-reports__table-overview">
            <div className="operations-reports__table-summary">
              <Text strong>{report.name}</Text>
              <Tag color={getStatusColor(report.status)} className="operations-reports__status-tag">
                {report.status}
              </Tag>
            </div>
            <Paragraph className="operations-reports__table-description">
              {report.summary}
            </Paragraph>
            <div className="operations-reports__tags" aria-label="report tags">
              {report.tags.map((tag) => (
                <Tag
                  key={`${report.id}-${tag}`}
                  color="geekblue"
                  className="operations-reports__tag"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        ),
      },
      {
        key: 'owner',
        title: 'Owner',
        render: (_value, report) => (
          <div>
            <Text strong>{report.owner}</Text>
            <Paragraph className="operations-reports__table-description">
              {report.category}
            </Paragraph>
          </div>
        ),
      },
      {
        key: 'healthScore',
        title: 'Health score',
        align: 'right',
        render: (_value, report) => (
          <div className="operations-reports__health-score" aria-label="report health score">
            {report.healthScore.toFixed(0)}
            <span>Composite index</span>
          </div>
        ),
      },
      {
        key: 'lastUpdated',
        title: 'Last updated',
        align: 'right',
        render: (_value, report) => <span>{formatUpdatedAt(report.lastUpdated)}</span>,
      },
    ],
    [],
  );

  return (
    <Space direction="vertical" size="large" className="operations-reports__section">
      <div>
        <Title level={2} className="operations-reports__title">
          <span className="operations-reports__title-icon" aria-hidden="true">
            <Analytics />
          </span>
          Enterprise operations reports
        </Title>
        <Paragraph className="operations-reports__header-summary">
          Each report aggregates telemetry from automation pipelines, incident command logs, and
          cloud infrastructure metrics. Select a report to inspect the detailed timeline, key
          metrics, and automation maturity breakdowns served directly from the microfrontend
          service.
        </Paragraph>
      </div>

      {error ? (
        <Alert type="error" showIcon message="Unable to load reports" description={error} />
      ) : null}

      <Table<OperationsReport>
        dataSource={reports}
        columns={columns}
        rowKey={(report) => report.id}
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: isLoading ? 'Loading reports…' : 'No published reports available yet.',
        }}
        onRow={(report) => ({
          onClick: () => {
            void navigate(report.id);
          },
          className: 'operations-reports__table-row',
        })}
      />
    </Space>
  );
};

export default ReportsList;
