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
        <Text style={{ fontWeight: 700, fontSize: 24 }}>React Perf • Wizard quick setup</Text>
        <Text style={{ color: '#475569' }}>
          A purposely problematic onboarding flow to demonstrate rerender storms, remount cascades
          and sluggish inputs.
        </Text>
      </Space>
      <DemoContainer />
    </PageLayout>
  );
};

export default WizardQuickSetupPage;
