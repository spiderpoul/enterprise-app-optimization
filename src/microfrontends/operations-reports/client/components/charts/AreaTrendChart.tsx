import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ReportTimelinePoint } from '../../types';

export interface AreaTrendChartProps {
  data: ReportTimelinePoint[];
  readinessColor?: string;
  automationColor?: string;
}

const DEFAULT_READINESS = '#2b6fff';
const DEFAULT_AUTOMATION = '#25b66a';

const formatPercentage = (value: number) => `${value.toFixed(0)}%`;

interface TooltipProps {
  label?: string;
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
}

const TrendTooltip: React.FC<TooltipProps> = ({ active, label, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="operations-reports__tooltip">
      <strong>{label}</strong>
      <ul>
        {payload.map((entry) => (
          <li key={entry.name}>
            <span className="operations-reports__tooltip-swatch" style={{ background: entry.color }} />
            <span>
              {entry.name}: {formatPercentage(Number(entry.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AreaTrendChart: React.FC<AreaTrendChartProps> = ({
  data,
  readinessColor = DEFAULT_READINESS,
  automationColor = DEFAULT_AUTOMATION,
}) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        label: point.label,
        readiness: Math.max(0, Math.min(100, point.readiness)),
        automation: Math.max(0, Math.min(100, point.automation)),
        incidents: point.incidents,
      })),
    [data]
  );

  if (chartData.length === 0) {
    return <p role="status">No timeline data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 32, right: 32, left: 8, bottom: 16 }}>
        <defs>
          <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={readinessColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={readinessColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke="rgba(16,37,66,0.12)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(16,37,66,0.55)" tickLine={false} axisLine={{ stroke: 'rgba(16,37,66,0.2)' }} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={formatPercentage}
          tickLine={false}
          axisLine={{ stroke: 'rgba(16,37,66,0.2)' }}
          stroke="rgba(16,37,66,0.55)"
        />
        <Tooltip content={<TrendTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12 }} />
        <Area
          type="monotone"
          dataKey="readiness"
          name="Readiness"
          stroke={readinessColor}
          fill="url(#readinessGradient)"
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="automation"
          name="Automation"
          stroke={automationColor}
          strokeDasharray="6 4"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: automationColor }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaTrendChart;
