import React from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import DemoContainer from './wizard/DemoContainer';

const PageLayout = styled(Space)`
  gap: 32px;
`;

const WizardQuickSetupPage: React.FC = () => {
  return (
    <PageLayout direction="vertical">
      <Space direction="vertical" gap={8} align="flex-start">
        <Text style={{ fontWeight: 700, fontSize: 24 }}>React Perf • Client security wizard</Text>
        <Text style={{ color: '#475569' }}>
          An intentionally flawed onboarding that remounts entire steps and couples heavy
          computations to innocent inputs so you can showcase performance nightmares.
        </Text>
      </Space>
      <DemoContainer />
    </PageLayout>
  );
};

export default WizardQuickSetupPage;
