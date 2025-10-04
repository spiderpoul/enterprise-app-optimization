import type { UserStatus } from '../types';

export const statusColors: Record<UserStatus, string> = {
  Active: 'green',
  Invited: 'geekblue',
  Suspended: 'volcano',
};
