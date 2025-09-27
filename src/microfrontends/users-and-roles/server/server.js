const express = require('express');
const fs = require('fs');
const path = require('path');

const MICROFRONT_PORT = Number(process.env.MICROFRONT_PORT || 4402);
const MICROFRONT_HOST = process.env.MICROFRONT_HOST || '0.0.0.0';
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const DIST_DIR = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.resolve(__dirname, '..', 'client', 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(DIST_DIR));

const users = [
  {
    id: 'riley-anderson',
    name: 'Riley Anderson',
    email: 'riley.anderson@enterprise.io',
    role: 'Automation Administrator',
    teams: ['Automation Council', 'Incident Response'],
    status: 'Active',
    lastActive: '2025-02-04T14:28:00.000Z',
    createdAt: '2023-05-18T10:22:00.000Z',
    timezone: 'UTC−05:00 (New York)',
    location: 'New York, United States',
    phone: '+1 212 555 0186',
    lastLoginIp: '192.0.2.14',
    directReports: 5,
    permissions: [
      'Manage orchestration blueprints',
      'Approve role escalations',
      'Configure automation guardrails',
      'View audit analytics',
    ],
    activity: [
      { week: '2024-W47', automations: 18, sessions: 42 },
      { week: '2024-W48', automations: 21, sessions: 44 },
      { week: '2024-W49', automations: 24, sessions: 46 },
      { week: '2024-W50', automations: 22, sessions: 41 },
      { week: '2024-W51', automations: 25, sessions: 48 },
      { week: '2025-W01', automations: 28, sessions: 52 },
      { week: '2025-W02', automations: 27, sessions: 50 },
      { week: '2025-W03', automations: 30, sessions: 55 },
    ],
    auditLog: [
      {
        id: 'audit-riley-1',
        action: 'Updated automation guardrail policy',
        occurredAt: '2025-02-02T19:12:00.000Z',
        actor: 'Riley Anderson',
        channel: 'Console',
      },
      {
        id: 'audit-riley-2',
        action: 'Approved elevated runbook access',
        occurredAt: '2025-01-28T15:45:00.000Z',
        actor: 'Riley Anderson',
        channel: 'Console',
      },
      {
        id: 'audit-riley-3',
        action: 'Generated monthly automation report',
        occurredAt: '2025-01-20T08:30:00.000Z',
        actor: 'Automation Scheduler',
        channel: 'Scheduled job',
      },
    ],
  },
  {
    id: 'harper-chen',
    name: 'Harper Chen',
    email: 'harper.chen@enterprise.io',
    role: 'Platform Operator',
    teams: ['Workload Enablement'],
    status: 'Active',
    lastActive: '2025-02-05T09:14:00.000Z',
    createdAt: '2022-11-10T12:30:00.000Z',
    timezone: 'UTC+01:00 (Berlin)',
    location: 'Berlin, Germany',
    phone: '+49 30 555 0190',
    lastLoginIp: '198.51.100.24',
    directReports: 2,
    permissions: [
      'Deploy workload automation',
      'Manage device enrollment',
      'View observability dashboards',
    ],
    activity: [
      { week: '2024-W47', automations: 12, sessions: 28 },
      { week: '2024-W48', automations: 13, sessions: 30 },
      { week: '2024-W49', automations: 15, sessions: 32 },
      { week: '2024-W50', automations: 17, sessions: 34 },
      { week: '2024-W51', automations: 19, sessions: 35 },
      { week: '2025-W01', automations: 20, sessions: 37 },
      { week: '2025-W02', automations: 21, sessions: 39 },
      { week: '2025-W03', automations: 22, sessions: 40 },
    ],
    auditLog: [
      {
        id: 'audit-harper-1',
        action: 'Rotated workload API token',
        occurredAt: '2025-02-03T07:05:00.000Z',
        actor: 'Harper Chen',
        channel: 'API token',
      },
      {
        id: 'audit-harper-2',
        action: 'Deployed automated patch policy',
        occurredAt: '2025-01-29T11:18:00.000Z',
        actor: 'Harper Chen',
        channel: 'Console',
      },
      {
        id: 'audit-harper-3',
        action: 'Acknowledged automation anomaly alert',
        occurredAt: '2025-01-21T06:42:00.000Z',
        actor: 'Harper Chen',
        channel: 'Mobile app',
      },
    ],
  },
  {
    id: 'jordan-patel',
    name: 'Jordan Patel',
    email: 'jordan.patel@enterprise.io',
    role: 'Regional Lead',
    teams: ['Asia-Pacific Operations', 'Compliance Guild'],
    status: 'Invited',
    lastActive: '2025-01-26T21:03:00.000Z',
    createdAt: '2024-08-02T09:15:00.000Z',
    timezone: 'UTC+05:30 (Mumbai)',
    location: 'Bengaluru, India',
    lastLoginIp: '203.0.113.87',
    directReports: 4,
    permissions: [
      'View compliance dashboards',
      'Submit automation change requests',
    ],
    activity: [
      { week: '2024-W47', automations: 6, sessions: 18 },
      { week: '2024-W48', automations: 7, sessions: 19 },
      { week: '2024-W49', automations: 8, sessions: 22 },
      { week: '2024-W50', automations: 8, sessions: 21 },
      { week: '2024-W51', automations: 9, sessions: 24 },
      { week: '2025-W01', automations: 11, sessions: 26 },
      { week: '2025-W02', automations: 10, sessions: 23 },
      { week: '2025-W03', automations: 12, sessions: 27 },
    ],
    auditLog: [
      {
        id: 'audit-jordan-1',
        action: 'Submitted automation exception for review',
        occurredAt: '2025-01-24T10:55:00.000Z',
        actor: 'Jordan Patel',
        channel: 'Console',
      },
      {
        id: 'audit-jordan-2',
        action: 'Reviewed compliance dashboard',
        occurredAt: '2025-01-18T08:10:00.000Z',
        actor: 'Jordan Patel',
        channel: 'Console',
      },
      {
        id: 'audit-jordan-3',
        action: 'Invited automation analyst to workspace',
        occurredAt: '2025-01-08T05:42:00.000Z',
        actor: 'Jordan Patel',
        channel: 'Console',
      },
    ],
  },
  {
    id: 'morgan-silva',
    name: 'Morgan Silva',
    email: 'morgan.silva@enterprise.io',
    role: 'Security Engineer',
    teams: ['Adaptive Defense'],
    status: 'Suspended',
    lastActive: '2024-12-12T13:44:00.000Z',
    createdAt: '2021-04-14T14:05:00.000Z',
    timezone: 'UTC-03:00 (São Paulo)',
    location: 'São Paulo, Brazil',
    phone: '+55 11 5550 2121',
    lastLoginIp: '198.51.100.71',
    directReports: 0,
    permissions: [
      'Initiate containment workflows',
      'Edit threat response automation',
    ],
    activity: [
      { week: '2024-W47', automations: 14, sessions: 26 },
      { week: '2024-W48', automations: 13, sessions: 25 },
      { week: '2024-W49', automations: 12, sessions: 24 },
      { week: '2024-W50', automations: 11, sessions: 21 },
      { week: '2024-W51', automations: 10, sessions: 18 },
      { week: '2025-W01', automations: 6, sessions: 14 },
      { week: '2025-W02', automations: 0, sessions: 0 },
      { week: '2025-W03', automations: 0, sessions: 0 },
    ],
    auditLog: [
      {
        id: 'audit-morgan-1',
        action: 'Account suspended by security operations',
        occurredAt: '2025-01-04T12:00:00.000Z',
        actor: 'Security Operations',
        channel: 'Console',
      },
      {
        id: 'audit-morgan-2',
        action: 'Revoked runbook deployment access',
        occurredAt: '2024-12-19T17:25:00.000Z',
        actor: 'Security Operations',
        channel: 'Console',
      },
      {
        id: 'audit-morgan-3',
        action: 'Triggered incident response automation',
        occurredAt: '2024-12-11T03:18:00.000Z',
        actor: 'Morgan Silva',
        channel: 'Console',
      },
    ],
  },
  {
    id: 'amira-hassan',
    name: 'Amira Hassan',
    email: 'amira.hassan@enterprise.io',
    role: 'Analytics Strategist',
    teams: ['Automation Insights', 'FinOps Guild'],
    status: 'Active',
    lastActive: '2025-02-05T16:48:00.000Z',
    createdAt: '2023-09-22T07:45:00.000Z',
    timezone: 'UTC+04:00 (Dubai)',
    location: 'Dubai, United Arab Emirates',
    lastLoginIp: '203.0.113.45',
    directReports: 1,
    permissions: [
      'Curate automation insights dashboards',
      'Export governance metrics',
      'Review automation savings reports',
    ],
    activity: [
      { week: '2024-W47', automations: 9, sessions: 34 },
      { week: '2024-W48', automations: 11, sessions: 36 },
      { week: '2024-W49', automations: 13, sessions: 39 },
      { week: '2024-W50', automations: 12, sessions: 37 },
      { week: '2024-W51', automations: 15, sessions: 41 },
      { week: '2025-W01', automations: 17, sessions: 44 },
      { week: '2025-W02', automations: 19, sessions: 46 },
      { week: '2025-W03', automations: 20, sessions: 48 },
    ],
    auditLog: [
      {
        id: 'audit-amira-1',
        action: 'Published automation ROI dashboard',
        occurredAt: '2025-02-01T09:25:00.000Z',
        actor: 'Amira Hassan',
        channel: 'Console',
      },
      {
        id: 'audit-amira-2',
        action: 'Shared savings insights with FinOps Guild',
        occurredAt: '2025-01-23T13:11:00.000Z',
        actor: 'Amira Hassan',
        channel: 'Console',
      },
      {
        id: 'audit-amira-3',
        action: 'Exported automation adoption dataset',
        occurredAt: '2025-01-15T05:56:00.000Z',
        actor: 'Amira Hassan',
        channel: 'Console',
      },
    ],
  },
];

app.get('/api/users', (_, res) => {
  res.json(users);
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

    console.log(`Microfrontend "${payload.id}" acknowledged by shell.`);
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
  console.log(
    `Users and roles microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`,
  );
  startAcknowledgementLoop();
});
