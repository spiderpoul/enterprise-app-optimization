import React, { useMemo } from 'react';
import { Alert, Button, Loader } from '@kaspersky/hexa-ui';
import { useDashboardData } from '../../hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { metrics, optimizationTasks, activityFeed, isLoading, error } = useDashboardData();

  const hasLoadedData = useMemo(
    () => metrics.length > 0 || optimizationTasks.length > 0 || activityFeed.length > 0,
    [activityFeed.length, metrics.length, optimizationTasks.length],
  );

  if (isLoading && !hasLoadedData) {
    return (
      <div className="dashboard" role="region" aria-label="Enterprise optimization overview">
        <div style={{ padding: '96px 0' }}>
          <Loader centered size="large" tip="Loading workspace insights…" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" role="region" aria-label="Enterprise optimization overview">
      {error ? (
        <section className="dashboard__section" aria-live="assertive">
          <Alert mode="error">{error}</Alert>
        </section>
      ) : null}

      <section className="dashboard__section">
        <header className="dashboard__section-header">
          <div>
            <h2>Optimization snapshot</h2>
            <p>Track the most important metrics driving the health of your enterprise workloads.</p>
          </div>
          <div className="dashboard__section-actions">
            <Button mode="secondary">Schedule report</Button>
            <Button mode="primary">Run optimization</Button>
          </div>
        </header>
        <div className="dashboard__grid" role="list">
          {metrics.map((metric) => (
            <article key={metric.id} className="dashboard-card" role="listitem">
              <header className="dashboard-card__header">
                <p className="dashboard-card__label">{metric.label}</p>
                <p className="dashboard-card__value">{metric.value}</p>
              </header>
              <p className="dashboard-card__trend">{metric.trend}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard__section dashboard__section--split">
        <div className="dashboard__panel">
          <header className="dashboard__panel-header">
            <h3>Optimization tasks</h3>
            <Button mode="tertiary">View all</Button>
          </header>
          <ul className="dashboard__list" aria-label="Upcoming optimization tasks">
            {optimizationTasks.map((task) => (
              <li key={task.id} className="dashboard__list-item">
                <div>
                  <p className="dashboard__list-title">{task.title}</p>
                  <p className="dashboard__list-subtitle">{task.owner}</p>
                </div>
                <div className="dashboard__list-meta">
                  <span className="dashboard__pill">{task.state}</span>
                  <span className="dashboard__meta">{task.eta}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard__panel">
          <header className="dashboard__panel-header">
            <h3>Recent activity</h3>
            <Button mode="tertiary">Open timeline</Button>
          </header>
          <ul className="dashboard__timeline" aria-label="Recent optimization activity">
            {activityFeed.map((activity) => (
              <li key={activity.id} className="dashboard__timeline-item">
                <p className="dashboard__timeline-title">{activity.title}</p>
                <p className="dashboard__timeline-detail">{activity.detail}</p>
                <span className="dashboard__timeline-meta">{activity.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
