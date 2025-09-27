export type UserStatus = 'Active' | 'Invited' | 'Suspended';

export interface UserActivityPoint {
  week: string;
  automations: number;
  sessions: number;
}

export interface UserAuditEntry {
  id: string;
  action: string;
  occurredAt: string;
  actor: string;
  channel: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  teams: string[];
  status: UserStatus;
  lastActive: string;
  createdAt: string;
  timezone: string;
  location: string;
  phone?: string;
  lastLoginIp: string;
  directReports: number;
  permissions: string[];
  activity: UserActivityPoint[];
  auditLog: UserAuditEntry[];
}
