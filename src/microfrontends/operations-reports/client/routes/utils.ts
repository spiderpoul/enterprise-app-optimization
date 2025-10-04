import type { OperationsReport, ReportMetric } from '../types';

type StatusVariant = 'success' | 'warning' | 'danger';

export const getStatusVariant = (status: OperationsReport['status']): StatusVariant => {
  switch (status) {
    case 'At risk':
      return 'danger';
    case 'Needs attention':
      return 'warning';
    default:
      return 'success';
  }
};

export const getStatusColor = (status: OperationsReport['status']) => {
  switch (getStatusVariant(status)) {
    case 'danger':
      return '#d4380d';
    case 'warning':
      return '#d89614';
    default:
      return '#0d7a4d';
  }
};

export const formatUpdatedAt = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

export const formatMetricValue = (metric: ReportMetric) => {
  switch (metric.unit) {
    case 'percentage':
      return `${metric.value.toFixed(1)}%`;
    case 'score':
      return metric.value.toFixed(1);
    case 'duration':
      return `${metric.value.toFixed(1)} hrs`;
    default:
      return metric.value.toLocaleString();
  }
};
