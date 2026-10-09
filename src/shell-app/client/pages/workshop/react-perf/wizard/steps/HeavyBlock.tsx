import React, { memo } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';

const Container = styled(Space)`
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.04);
  gap: 12px;
`;

const MetricsRow = styled(Space)`
  flex-wrap: wrap;
  gap: 8px;
`;

interface HeavyBlockProps {
  inputValue: string;
}

const runExpensiveSimulation = (seed: string) => {
  const iterations = 18000 + seed.length * 4000;
  const numbers: number[] = [];

  for (let index = 0; index < iterations; index += 1) {
    const noise = Math.sin(index * 0.75 + seed.length) * Math.cos(index * 0.125);
    numbers.push(noise * index);
  }

  numbers.sort((a, b) => b - a);

  let checksum = 0;

  for (let i = 0; i < Math.min(6000, numbers.length); i += 1) {
    checksum += Math.sqrt(Math.abs(numbers[i]));
  }

  return checksum;
};

const HeavyBlock: React.FC<HeavyBlockProps> = ({ inputValue }) => {
  const start = performance.now();
  // ❌ Anti-pattern: brutal synchronous work during render blocks the main thread for ~150ms every time.
  const checksum = runExpensiveSimulation(inputValue);
  const computeTimeMs = Math.round(performance.now() - start);

  console.log(
    `[HeavyBlock] recomputed checksum=${checksum.toFixed(2)} in ${computeTimeMs}ms (input length: ${inputValue.length})`,
  );

  return (
    <Container direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="compute" value={`${computeTimeMs}ms`} />
      </MetricsRow>
      <Text style={{ color: '#0f172a' }}>
        Policy digest checksum: <strong>{checksum.toFixed(2)}</strong>
      </Text>
      <Text style={{ color: '#475569' }}>
        Every keystroke forces this block to evaluate thousands of simulated device rules without
        any memoization, freezing the wizard while the CPU churns.
      </Text>
    </Container>
  );
};

export default memo(HeavyBlock);
