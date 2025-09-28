const dashboardData = {
  metrics: [
    {
      id: 'optimization-score',
      label: 'Optimization score',
      value: '92%',
      trend: '+3.2% week over week',
    },
    {
      id: 'systems-covered',
      label: 'Systems covered',
      value: '1,248',
      trend: '34 systems pending onboarding',
    },
    {
      id: 'critical-findings',
      label: 'Critical findings',
      value: '5',
      trend: '2 mitigated in the last 24h',
    },
    {
      id: 'automation-playbooks',
      label: 'Automation playbooks',
      value: '18',
      trend: '6 scheduled this week',
    },
  ],
  optimizationTasks: [
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
  ],
  activityFeed: [
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
  ],
};

module.exports = { dashboardData };
