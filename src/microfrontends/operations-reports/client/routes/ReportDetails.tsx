import React, { useMemo } from 'react';
import { Button, Card, Paragraph, Space, Spin, Tag, Typography } from 'antd';
import { Clock } from '@kaspersky/hexa-ui-icons/24';
import { useNavigate, useParams } from 'react-router-dom';

import AreaTrendChart from '../components/charts/AreaTrendChart';
import DonutChart from '../components/charts/DonutChart';
import { useReportsRouteContext } from './context';
import { formatMetricValue, formatUpdatedAt } from './utils';

const { Title } = Typography;

const ReportDetails: React.FC = () => {
  const navigate = useNavigate();
  const { reports, isLoading } = useReportsRouteContext();
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
            <span className="operations-reports__chart-meta">
              <Clock aria-hidden="true" />
              <span>Last updated {formatUpdatedAt(report.lastUpdated)}</span>
            </span>
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

export default ReportDetails;
