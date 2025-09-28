import { useEffect, useMemo, useState } from 'react';
import { UserActivityPoint, UserAuditEntry, UserRecord, UserStatus } from '../types';
import manifest from '../../manifest.json';

interface UsersState {
  users: UserRecord[];
  isLoading: boolean;
  error: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const isActivityPoint = (value: unknown): value is UserActivityPoint => {
  if (!isRecord(value)) {
    return false;
  }

  const { week, automations, sessions } = value;
  return (
    typeof week === 'string' && typeof automations === 'number' && typeof sessions === 'number'
  );
};

const isAuditEntry = (value: unknown): value is UserAuditEntry => {
  if (!isRecord(value)) {
    return false;
  }

  const { id, action, occurredAt, actor, channel } = value;
  return (
    typeof id === 'string' &&
    typeof action === 'string' &&
    typeof occurredAt === 'string' &&
    typeof actor === 'string' &&
    typeof channel === 'string'
  );
};

const isUserStatus = (value: unknown): value is UserStatus =>
  value === 'Active' || value === 'Invited' || value === 'Suspended';

const isUserRecord = (value: unknown): value is UserRecord => {
  if (!isRecord(value)) {
    return false;
  }

  const {
    id,
    name,
    email,
    role,
    teams,
    status,
    lastActive,
    createdAt,
    timezone,
    location,
    phone,
    lastLoginIp,
    directReports,
    permissions,
    activity,
    auditLog,
  } = value;

  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    typeof email === 'string' &&
    typeof role === 'string' &&
    isStringArray(teams) &&
    isUserStatus(status) &&
    typeof lastActive === 'string' &&
    typeof createdAt === 'string' &&
    typeof timezone === 'string' &&
    typeof location === 'string' &&
    (typeof phone === 'string' || typeof phone === 'undefined') &&
    typeof lastLoginIp === 'string' &&
    typeof directReports === 'number' &&
    isStringArray(permissions) &&
    Array.isArray(activity) &&
    activity.every(isActivityPoint) &&
    Array.isArray(auditLog) &&
    auditLog.every(isAuditEntry)
  );
};

const cloneUser = (user: UserRecord): UserRecord => ({
  ...user,
  teams: [...user.teams],
  permissions: [...user.permissions],
  activity: user.activity.map((point) => ({ ...point })),
  auditLog: user.auditLog.map((entry) => ({ ...entry })),
});

interface ManifestWithApiPrefix {
  api?: {
    prefix?: string | null;
  } | null;
}

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const normalizeApiPrefix = (prefix: string | null | undefined, fallback: string) => {
  if (typeof prefix !== 'string') {
    return fallback;
  }

  const trimmed = prefix.trim();

  if (!trimmed) {
    return fallback;
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash || fallback;
};

const manifestApiPrefix = (manifest as ManifestWithApiPrefix).api?.prefix ?? null;
const API_PREFIX = normalizeApiPrefix(manifestApiPrefix, '/api/mf/users-and-roles');

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_PREFIX}${normalizedPath}`;
};

const parseUsers = (input: unknown): UserRecord[] => {
  if (!Array.isArray(input)) {
    throw new Error('Malformed users payload received from server');
  }

  return input.filter(isUserRecord).map(cloneUser);
};

const useUsersData = (): UsersState => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildApiUrl('/users'));

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as unknown;
        const parsed = parseUsers(payload);

        if (!isMounted) {
          return;
        }

        setUsers(parsed);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Unable to load users';
        setError(message);
        setUsers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const memoizedUsers = useMemo(() => users, [users]);

  return {
    users: memoizedUsers,
    isLoading,
    error,
  };
};

export default useUsersData;
