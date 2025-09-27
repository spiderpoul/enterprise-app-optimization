import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ReportDistributionSlice } from '../../types';

export interface DonutChartProps {
  data: ReportDistributionSlice[];
  colors?: string[];
}

const defaultPalette = ['#2b6fff', '#25b66a', '#ff8c42', '#845ef7', '#f03e3e', '#0ca678'];

interface DistributionTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const DistributionTooltip: React.FC<DistributionTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const entry = payload[0];

  return (
    <div className="operations-reports__tooltip">
      <strong>{entry.name}</strong>
      <span>{`${entry.value.toFixed(1)}% of automation coverage`}</span>
    </div>
  );
};

const DonutChart: React.FC<DonutChartProps> = ({ data, colors = defaultPalette }) => {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    if (total === 0) {
      return [] as Array<{ name: string; value: number; color: string }>;
    }

    return data.map((slice, index) => ({
      name: slice.label,
      value: Number(((slice.value / total) * 100).toFixed(1)),
      color: colors[index % colors.length],
    }));
  }, [colors, data]);

  if (chartData.length === 0) {
    return <p role="status">No distribution data available.</p>;
  }

  const coverage = chartData[0]?.value ?? 0;

  return (
    <div className="operations-reports__donut-chart">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Tooltip content={<DistributionTooltip />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
          <Pie
            data={chartData}
            cx="42%"
            cy="50%"
            innerRadius={72}
            outerRadius={108}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="operations-reports__donut-summary">
        <div className="operations-reports__donut-value">{coverage.toFixed(1)}%</div>
        <p>Automated coverage</p>
      </div>
    </div>
  );
};

export default DonutChart;
