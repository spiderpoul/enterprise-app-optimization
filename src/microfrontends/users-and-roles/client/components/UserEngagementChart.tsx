import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly';
import { UserActivityPoint } from '../types';

// Plotly's runtime bundle does not ship strong typings, so we assert the type for the factory.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const Plot = createPlotlyComponent(Plotly);

interface UserEngagementChartProps {
  data: UserActivityPoint[];
}

const UserEngagementChart: React.FC<UserEngagementChartProps> = ({ data }) => {
  const weeks = data.map((point) => point.week);

  const layout = {
    margin: { l: 40, r: 16, t: 24, b: 32 },
    legend: { orientation: 'h', y: -0.2 },
    hovermode: 'x unified',
    autosize: true,
    font: {
      family: 'Segoe UI, system-ui, sans-serif',
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      title: { text: 'Week' },
      zeroline: false,
      gridcolor: 'rgba(148, 163, 184, 0.2)',
    },
    yaxis: {
      title: { text: 'Activity' },
      zeroline: false,
      gridcolor: 'rgba(148, 163, 184, 0.2)',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  return (
    <Plot
      className="users-roles__chart"
      data={[
        {
          x: weeks,
          y: data.map((point) => point.automations),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Automations launched',
          line: { color: '#2563eb', width: 3 },
          marker: { color: '#2563eb', size: 8 },
          hovertemplate: '<b>%{x}</b><br>Automations: %{y}<extra></extra>',
        },
        {
          x: weeks,
          y: data.map((point) => point.sessions),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Platform sessions',
          line: { color: '#16a34a', width: 3 },
          marker: { color: '#16a34a', size: 8 },
          hovertemplate: '<b>%{x}</b><br>Sessions: %{y}<extra></extra>',
        },
      ]}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
    />
  );
};

export default UserEngagementChart;
