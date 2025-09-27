const express = require('express');
const fs = require('fs');
const path = require('path');

const MICROFRONT_PORT = Number(process.env.MICROFRONT_PORT || 4400);
const MICROFRONT_HOST = process.env.MICROFRONT_HOST || '0.0.0.0';
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DIST_DIR = path.join(PROJECT_ROOT, 'src', 'microfrontends', 'operations-reports', 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(DIST_DIR));

const reports = [
  {
    id: 'infrastructure-overview',
    name: 'Infrastructure readiness overview',
    owner: 'Infrastructure resiliency office',
    status: 'On track',
    healthScore: 86,
    lastUpdated: '2025-01-11T09:42:00.000Z',
    summary:
      'Synthesizes datacenter capacity signals, cloud posture checks, and automation run compliance to highlight regions trending toward risk.',
    category: 'Infrastructure readiness',
    tags: ['platform', 'capacity', 'automation'],
    metrics: [
      {
        id: 'readiness-index',
        label: 'Readiness index',
        value: 86.2,
        unit: 'score',
        change: 4.1,
        description: 'Composite view of redundancy, failover coverage, and recovery rehearsal adherence across regions.',
      },
      {
        id: 'automation-coverage',
        label: 'Automation coverage',
        value: 72.5,
        unit: 'percentage',
        change: 5.4,
        description: 'Percentage of critical runbooks executed automatically without engineer intervention.',
      },
      {
        id: 'region-hotspots',
        label: 'Regions needing manual review',
        value: 3,
        unit: 'count',
        change: -2,
        description: 'Number of geographic regions where fallback automation requires manual approval.',
      },
    ],
    timeline: [
      { label: 'Aug', readiness: 74, automation: 58, incidents: 16 },
      { label: 'Sep', readiness: 78, automation: 61, incidents: 12 },
      { label: 'Oct', readiness: 81, automation: 63, incidents: 11 },
      { label: 'Nov', readiness: 83, automation: 67, incidents: 9 },
      { label: 'Dec', readiness: 85, automation: 71, incidents: 7 },
      { label: 'Jan', readiness: 86, automation: 73, incidents: 6 },
    ],
    distribution: [
      { label: 'Fully automated', value: 54 },
      { label: 'Semi-automated', value: 28 },
      { label: 'Manual workflows', value: 18 },
    ],
    highlights: [
      'Edge regions achieved automated rollback readiness for the first time, removing 40 hours of manual testing per release.',
      'Disaster recovery rehearsals completed in under three hours across all tier-0 services, exceeding the SLO by 18%.',
      'Upcoming focus: extend orchestration coverage to seasonal workloads prior to the next fiscal quarter.',
    ],
  },
  {
    id: 'incident-velocity',
    name: 'Incident velocity and response',
    owner: 'Command center operations',
    status: 'Needs attention',
    healthScore: 71,
    lastUpdated: '2025-01-08T16:10:00.000Z',
    summary:
      'Tracks mean-time-to-detect, containment velocity, and responder saturation to signal where incident playbooks need iteration.',
    category: 'Incident operations',
    tags: ['incident', 'response', 'quality'],
    metrics: [
      {
        id: 'mttd',
        label: 'Mean time to detect',
        value: 2.6,
        unit: 'duration',
        change: -0.4,
        description: 'Average hours between signal ingestion and verified incident declaration.',
      },
      {
        id: 'playbook-activation',
        label: 'Playbook activation rate',
        value: 64.2,
        unit: 'percentage',
        change: 3.2,
        description: 'Percentage of priority incidents that triggered the recommended automation playbook.',
      },
      {
        id: 'responder-saturation',
        label: 'Responder saturation',
        value: 12,
        unit: 'count',
        change: 1,
        description: 'Average number of simultaneous priority incidents handled per responder during peak loads.',
      },
    ],
    timeline: [
      { label: 'Aug', readiness: 62, automation: 48, incidents: 22 },
      { label: 'Sep', readiness: 64, automation: 50, incidents: 20 },
      { label: 'Oct', readiness: 66, automation: 51, incidents: 18 },
      { label: 'Nov', readiness: 69, automation: 53, incidents: 19 },
      { label: 'Dec', readiness: 70, automation: 55, incidents: 17 },
      { label: 'Jan', readiness: 71, automation: 57, incidents: 21 },
    ],
    distribution: [
      { label: 'Automated containment', value: 38 },
      { label: 'Human-led with tooling', value: 42 },
      { label: 'Manual escalations', value: 20 },
    ],
    highlights: [
      'Automation-assisted triage reduced paging volume by 12% but saturation increased in two follow-the-sun regions.',
      'Expanded telemetry correlation closed 30% of incidents within the detection window during the holiday code freeze.',
      'Action item: onboard service owners to the revamped containment runbooks to relieve manual escalations.',
    ],
  },
  {
    id: 'automation-impact',
    name: 'Automation impact analysis',
    owner: 'Automation strategy council',
    status: 'On track',
    healthScore: 90,
    lastUpdated: '2025-01-05T11:05:00.000Z',
    summary:
      'Quantifies toil reduction, change success velocity, and proactive remediation coverage unlocked by the automation program.',
    category: 'Automation outcomes',
    tags: ['productivity', 'savings', 'forecast'],
    metrics: [
      {
        id: 'hours-returned',
        label: 'Engineer hours returned',
        value: 1840,
        unit: 'count',
        change: 210,
        description: 'Cumulative monthly engineering hours avoided due to automated remediation and change orchestration.',
      },
      {
        id: 'change-success',
        label: 'Change success rate',
        value: 96.4,
        unit: 'percentage',
        change: 1.8,
        description: 'Percentage of changes deployed through automation with no production rollback within 24 hours.',
      },
      {
        id: 'self-healed-events',
        label: 'Self-healed events',
        value: 312,
        unit: 'count',
        change: 48,
        description: 'Number of production incidents automatically resolved without paging an on-call responder.',
      },
    ],
    timeline: [
      { label: 'Aug', readiness: 82, automation: 70, incidents: 9 },
      { label: 'Sep', readiness: 83, automation: 72, incidents: 8 },
      { label: 'Oct', readiness: 85, automation: 74, incidents: 7 },
      { label: 'Nov', readiness: 87, automation: 76, incidents: 6 },
      { label: 'Dec', readiness: 89, automation: 79, incidents: 5 },
      { label: 'Jan', readiness: 90, automation: 81, incidents: 4 },
    ],
    distribution: [
      { label: 'Autonomous remediations', value: 62 },
      { label: 'Suggested actions accepted', value: 26 },
      { label: 'Manual overrides', value: 12 },
    ],
    highlights: [
      'Quality gates backed by automated verification increased change success rate to an all-time high of 96.4%.',
      'The proactive remediation playbooks eliminated 312 potential paging events during the last quarter.',
      'Forecast models indicate automation will return an additional 2,400 engineer hours in the next half-year.',
    ],
  },
];

app.get('/api/reports', (_, res) => {
  res.json(reports);
});

const readManifest = () => {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw);
};

const buildAckPayload = () => {
  const manifest = readManifest();
  const baseUrl = new URL('/', `http://localhost:${MICROFRONT_PORT}`);

  const entryUrl = new URL(manifest.entryPath, baseUrl).href;
  const manifestUrl = new URL('manifest.json', baseUrl).href;

  return {
    id: manifest.id,
    name: manifest.name,
    menuLabel: manifest.menuLabel,
    routePath: manifest.routePath,
    description: manifest.description,
    entryUrl,
    manifestUrl,
  };
};

const acknowledgeShell = async () => {
  try {
    const payload = buildAckPayload();
    const response = await fetch(`${SHELL_URL}/api/microfrontends/ack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Shell acknowledgement failed with status ${response.status}`);
    }

    console.log(`Microfrontend \"${payload.id}\" acknowledged by shell.`);
  } catch (error) {
    console.error('Unable to acknowledge shell:', error.message || error);
  }
};

const startAcknowledgementLoop = () => {
  acknowledgeShell();
  const intervalMs = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);
  setInterval(acknowledgeShell, intervalMs);
};

app.listen(MICROFRONT_PORT, MICROFRONT_HOST, () => {
  console.log(`Operations reports microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`);
  startAcknowledgementLoop();
});
