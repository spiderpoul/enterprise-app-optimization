export interface ReportMetric {
  id: string;
  label: string;
  value: number;
  unit: 'percentage' | 'score' | 'count' | 'duration';
  change: number;
  description: string;
}

export interface ReportTimelinePoint {
  label: string;
  readiness: number;
  automation: number;
  incidents: number;
}

export interface ReportDistributionSlice {
  label: string;
  value: number;
}

export interface OperationsReport {
  id: string;
  name: string;
  owner: string;
  status: 'On track' | 'At risk' | 'Needs attention';
  healthScore: number;
  lastUpdated: string;
  summary: string;
  category: string;
  tags: string[];
  metrics: ReportMetric[];
  timeline: ReportTimelinePoint[];
  distribution: ReportDistributionSlice[];
  highlights: string[];
}
