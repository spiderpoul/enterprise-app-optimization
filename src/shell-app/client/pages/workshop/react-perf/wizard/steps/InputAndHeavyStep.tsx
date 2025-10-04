import React, { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useLifecycleLog } from '../hooks/useLifecycleLog';
import { useRenderCount } from '../hooks/useRenderCount';
import HeavyBlock from './HeavyBlock';

const Layout = styled(Space)`
  gap: 16px;
`;

const MetricsRow = styled(Space)`
  flex-wrap: wrap;
  gap: 8px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.24);
  font-size: 16px;
`;

const InputAndHeavyStep: React.FC = () => {
  const renders = useRenderCount('InputAndHeavyStep');
  const { mounts, unmounts } = useLifecycleLog('InputAndHeavyStep');
  const [value, setValue] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // ❌ Anti-pattern: state is kept right next to the heavy component, so every keystroke re-renders HeavyBlock.
    setValue(event.target.value);
  };

  return (
    <Layout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="renders" value={renders} />
        <MetricBadge label="mounts" value={mounts} />
        <MetricBadge label="unmounts" value={unmounts} />
      </MetricsRow>
      <Space direction="vertical" gap={8} align="flex-start">
        <Text style={{ fontWeight: 600, color: '#0f172a' }}>Type anything to feel the lag</Text>
        <Text style={{ color: '#475569' }}>
          With the state lifted to this parent, every character forces the heavyweight block to
          recompute synchronously.
        </Text>
      </Space>
      <InputField
        value={value}
        onChange={handleChange}
        placeholder="Your typing competes with a 150ms render"
      />
      <HeavyBlock inputValue={value} />
    </Layout>
  );
};

export default InputAndHeavyStep;
