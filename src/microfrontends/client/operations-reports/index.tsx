import React from 'react';
import { UIFContent, UIFHeader, UIFStack, UIFCard } from '@kaspersky/uif-react';

const reports = [
  {
    id: 'infrastructure-overview',
    title: 'Infrastructure readiness overview',
    description: 'Summarizes the posture of data centers, cloud footprints, and automation coverage across fleets.',
  },
  {
    id: 'incident-velocity',
    title: 'Incident velocity',
    description: 'Highlights alert queues, response playbook activation, and cross-team ticket throughput.',
  },
  {
    id: 'automation-impact',
    title: 'Automation impact analysis',
    description: 'Quantifies toil reduced by automations and projects next best actions by service owner.',
  },
];

const OperationsReportsPage: React.FC = () => (
  <UIFContent>
    <UIFStack as="section" space="xl">
      <UIFHeader
        title="Enterprise operations reports"
        subtitle="This microfrontend is loaded on demand from the plugin server and extends the host navigation automatically."
      />

      <UIFStack as="div" space="m" aria-label="Report catalog">
        {reports.map((report) => (
          <UIFCard key={report.id}>
            <h2>{report.title}</h2>
            <p>{report.description}</p>
          </UIFCard>
        ))}
      </UIFStack>
    </UIFStack>
  </UIFContent>
);

export default OperationsReportsPage;
