import React from 'react';
import { UIFButton } from '@kaspersky/uif-react';

interface DashboardProps {
  activeSection: string;
}

const metrics = [
  {
    id: 'optimizationScore',
    label: 'Optimization score',
    value: '92%',
    trend: '+3.2% week over week',
  },
  {
    id: 'systemsCovered',
    label: 'Systems covered',
    value: '1,248',
    trend: '34 systems pending onboarding',
  },
  {
    id: 'criticalFindings',
    label: 'Critical findings',
    value: '5',
    trend: '2 mitigated in the last 24h',
  },
  {
    id: 'automationPlaybooks',
    label: 'Automation playbooks',
    value: '18',
    trend: '6 scheduled this week',
  },
];

const optimizationTasks = [
  {
    id: 'baseline-audit',
    title: 'Refresh environment baseline',
    owner: 'Automation',
    eta: 'Due today',
    state: 'In progress',
  },
  {
    id: 'policy-review',
    title: 'Policy compliance review',
    owner: 'Security Engineering',
    eta: 'Due in 2 days',
    state: 'Pending approval',
  },
  {
    id: 'performance-tuning',
    title: 'Performance tuning rollout',
    owner: 'Platform Ops',
    eta: 'Scheduled for Friday',
    state: 'Scheduled',
  },
];

const activityFeed = [
  {
    id: 'activity-1',
    title: 'Optimization run completed',
    detail: 'Playbook “Memory fragmentation repair” reduced incident load by 18%.',
    timestamp: '08:21 Today',
  },
  {
    id: 'activity-2',
    title: 'New system onboarded',
    detail: 'Server “edge-cache-17” added to performance monitoring scope.',
    timestamp: '07:54 Today',
  },
  {
    id: 'activity-3',
    title: 'Threat intelligence update',
    detail: 'Latest YARA rules and heuristics pushed to all gateways.',
    timestamp: '23:08 Yesterday',
  },
];

const placeholderCopy: Record<string, { title: string; description: string }> = {
  incidents: {
    title: 'Incident queue',
    description:
      'Monitor prioritized incidents, escalate to response teams, and correlate telemetry to accelerate remediation.',
  },
  performance: {
    title: 'Performance analytics',
    description:
      'Investigate bottlenecks, capacity thresholds, and real-time utilization trends across the managed fleet.',
  },
  policies: {
    title: 'Policy center',
    description:
      'Adjust compliance controls, review policy drift, and roll out staged changes with approval workflows.',
  },
  automation: {
    title: 'Automation playbooks',
    description:
      'Create reusable playbooks for recurring operations and track their rollout cadence across environments.',
  },
  integrations: {
    title: 'Integrations catalog',
    description:
      'Connect telemetry, ticketing, and reporting platforms to build unified enterprise visibility.',
  },
  settings: {
    title: 'Global settings',
    description:
      'Manage environment defaults, notification channels, and enterprise branding.',
  },
  support: {
    title: 'Support center',
    description:
      'Access runbooks, SLA escalation contacts, and the community knowledge base.',
  },
  audit: {
    title: 'Audit log',
    description:
      'Review configuration changes and user actions captured across the platform.',
  },
};

const Dashboard: React.FC<DashboardProps> = ({ activeSection }) => {
  if (activeSection !== 'dashboard') {
    const copy = placeholderCopy[activeSection];

    return (
      <div className="dashboard-placeholder" role="region" aria-live="polite">
        <h2>{copy?.title ?? 'Section under construction'}</h2>
        <p>
          {copy?.description ??
            'Select Dashboard to review the live enterprise optimization overview provided by the UIF quick-start example.'}
        </p>
        <UIFButton appearance="primary">Notify me when ready</UIFButton>
      </div>
    );
  }

  return (
    <div className="dashboard" role="region" aria-label="Enterprise optimization overview">
      <section className="dashboard__section">
        <header className="dashboard__section-header">
          <div>
            <h2>Optimization snapshot</h2>
            <p>Track the most important metrics driving the health of your enterprise workloads.</p>
          </div>
          <div className="dashboard__section-actions">
            <UIFButton appearance="secondary">Schedule report</UIFButton>
            <UIFButton appearance="primary">Run optimization</UIFButton>
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
            <UIFButton appearance="ghost">View all</UIFButton>
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
            <UIFButton appearance="ghost">Open timeline</UIFButton>
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
