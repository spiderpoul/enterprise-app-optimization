import React, { useState } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import PerfWizard, { WizardStep } from './PerfWizard';
import DataTableStep from './steps/DataTableStep';
import InputAndHeavyStep from './steps/InputAndHeavyStep';

type DatasetOption = 'small' | 'medium' | 'large';

const Container = styled(Space)`
  width: 100%;
  gap: 24px;
`;

const ControlPanel = styled(Space)`
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 44px -24px rgba(15, 23, 42, 0.3);
  align-items: center;
  justify-content: space-between;
`;

const SelectControl = styled.select`
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.9);
`;

const DemoContainer: React.FC = () => {
  const [dataset, setDataset] = useState<DatasetOption>('medium');

  const steps: WizardStep[] = [
    {
      id: 'table',
      title: 'Data Table',
      // ❌ Anti-pattern: inline arrow recreates the Component reference on every render.
      //    Any parent state change (like the dataset select below) produces a brand-new element.type,
      //    so React tears down the current step and mounts it again.
      Component: () => <DataTableStep dataset={dataset} />,
    },
    {
      id: 'heavy',
      title: 'Input + Heavy',
      Component: InputAndHeavyStep,
    },
  ];

  return (
    <Container direction="vertical">
      <ControlPanel direction="horizontal">
        <Space direction="vertical" gap={4} align="flex-start">
          <Text style={{ fontWeight: 600, color: '#0f172a' }}>Dataset selector</Text>
          <Text style={{ color: '#475569' }}>
            Changing this value lives in the same component that rebuilds <code>steps</code>,
            intentionally causing remounts.
          </Text>
        </Space>
        <SelectControl
          value={dataset}
          onChange={(event) => setDataset(event.target.value as DatasetOption)}
        >
          <option value="small">Small (5k rows)</option>
          <option value="medium">Medium (10k rows)</option>
          <option value="large">Large (20k rows)</option>
        </SelectControl>
      </ControlPanel>

      <PerfWizard steps={steps} />
    </Container>
  );
};

export default DemoContainer;
