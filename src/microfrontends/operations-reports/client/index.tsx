import React, { useMemo } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';

import 'antd/dist/reset.css';
import { Alert, Button, Card, Space, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import AreaTrendChart from './components/charts/AreaTrendChart';
import DonutChart from './components/charts/DonutChart';
import useReportsData from './hooks/useReportsData';
import { OperationsReport, ReportMetric } from './types';

import './styles/index.css';

const { Title, Paragraph, Text } = Typography;

type StatusVariant = 'success' | 'warning' | 'danger';

const getStatusVariant = (status: OperationsReport['status']): StatusVariant => {
  switch (status) {
    case 'At risk':
      return 'danger';
    case 'Needs attention':
      return 'warning';
    default:
      return 'success';
  }
};

const getStatusColor = (status: OperationsReport['status']) => {
  switch (getStatusVariant(status)) {
    case 'danger':
      return '#d4380d';
    case 'warning':
      return '#d89614';
    default:
      return '#0d7a4d';
  }
};

const formatUpdatedAt = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const formatMetricValue = (metric: ReportMetric) => {
  switch (metric.unit) {
    case 'percentage':
      return `${metric.value.toFixed(1)}%`;
    case 'score':
      return metric.value.toFixed(1);
    case 'duration':
      return `${metric.value.toFixed(1)} hrs`;
    default:
      return metric.value.toLocaleString();
  }
};

interface ReportsListProps {
  reports: OperationsReport[];
  isLoading: boolean;
  error: string | null;
}

const ReportsList: React.FC<ReportsListProps> = ({ reports, isLoading, error }) => {
  const navigate = useNavigate();

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
        <Title level={2}>Enterprise operations reports</Title>
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

interface ReportDetailsProps {
  reports: OperationsReport[];
  isLoading: boolean;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ reports, isLoading }) => {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();

  const report = useMemo(() => reports.find((item) => item.id === reportId), [reports, reportId]);

  if (isLoading) {
    return (
      <div className="operations-reports__loading">
        <Spin tip="Loading report details" />
      </div>
    );
  }

  if (!report) {
    return (
      <Space direction="vertical" size="large" className="operations-reports__section">
        <Button
          type="link"
          onClick={() => {
            void navigate('..');
          }}
          className="operations-reports__back-button"
        >
          Back to all reports
        </Button>
        <Card>
          <Space direction="vertical" size="small">
            <Title level={4}>Report unavailable</Title>
            <Paragraph>
              The requested report could not be found. It may have been unpublished or renamed.
            </Paragraph>
          </Space>
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" className="operations-reports__section">
      <Button
        type="link"
        onClick={() => {
          void navigate('..');
        }}
        className="operations-reports__back-button"
      >
        Back to all reports
      </Button>

      <div>
        <Title level={2}>{report.name}</Title>
        <Paragraph className="operations-reports__header-summary">{report.summary}</Paragraph>
      </div>

      <div className="operations-reports__tags" aria-label="report labels">
        {report.tags.map((tag) => (
          <Tag
            key={`${report.id}-detail-${tag}`}
            color="geekblue"
            className="operations-reports__tag"
          >
            {tag}
          </Tag>
        ))}
      </div>

      <div className="operations-reports__detail-grid">
        <Card
          className="operations-reports__chart-card"
          bordered={false}
          aria-label="readiness trend"
        >
          <h3 className="operations-reports__chart-title">Readiness velocity</h3>
          <AreaTrendChart data={report.timeline} />
          <div className="operations-reports__chart-footer">
            <span>
              Comparing automation coverage against readiness index over the last six months.
            </span>
            <span>Last updated {formatUpdatedAt(report.lastUpdated)}</span>
          </div>
        </Card>

        <Card
          className="operations-reports__chart-card"
          bordered={false}
          aria-label="automation maturity"
        >
          <h3 className="operations-reports__chart-title">Automation maturity breakdown</h3>
          <DonutChart data={report.distribution} />
        </Card>
      </div>

      <div className="operations-reports__metrics-grid" aria-label="key performance indicators">
        {report.metrics.map((metric) => {
          const delta = metric.change;
          const deltaClass =
            delta > 0
              ? 'operations-reports__metric-delta--positive'
              : delta < 0
                ? 'operations-reports__metric-delta--negative'
                : undefined;
          const deltaLabel =
            delta === 0
              ? 'No change vs. previous cycle'
              : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} pts vs. previous cycle`;

          return (
            <Card key={metric.id} className="operations-reports__metric-card" bordered={false}>
              <div className="operations-reports__metric-label">{metric.label}</div>
              <div className="operations-reports__metric-value">{formatMetricValue(metric)}</div>
              <div className={`operations-reports__metric-delta ${deltaClass ?? ''}`}>
                {deltaLabel}
              </div>
              <Paragraph className="operations-reports__table-description">
                {metric.description}
              </Paragraph>
            </Card>
          );
        })}
      </div>

      <section>
        <Title level={4}>Highlights from operations analytics</Title>
        <div className="operations-reports__highlights">
          {report.highlights.map((highlight, index) => (
            <div
              key={`${report.id}-highlight-${index}`}
              className="operations-reports__highlight-item"
            >
              <span className="operations-reports__highlight-bullet" aria-hidden="true" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </section>
    </Space>
  );
};

const OperationsReportsApp: React.FC = () => {
  const { reports, isLoading, error } = useReportsData();

  return (
    <div className="operations-reports__content">
      <Routes>
        <Route
          index
          element={<ReportsList reports={reports} isLoading={isLoading} error={error} />}
        />
        <Route
          path=":reportId"
          element={<ReportDetails reports={reports} isLoading={isLoading} />}
        />
      </Routes>
    </div>
  );
};

export default OperationsReportsApp;
