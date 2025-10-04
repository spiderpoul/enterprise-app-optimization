import React from 'react';
import styled from 'styled-components';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const Label = styled.span`
  text-transform: uppercase;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.08em;
`;

const Value = styled.span`
  font-variant-numeric: tabular-nums;
`;

interface MetricBadgeProps {
  label: string;
  value: number | string;
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value }) => {
  return (
    <Badge>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </Badge>
  );
};

export default MetricBadge;
