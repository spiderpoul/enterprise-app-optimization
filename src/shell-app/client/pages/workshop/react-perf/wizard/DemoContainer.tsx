import React, { useState } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import PerfWizard, { WizardStep } from './PerfWizard';
import SecurityQuickSetupStep from './steps/SecurityQuickSetupStep';
import PolicyTuningStep from './steps/PolicyTuningStep';
import { WizardState, WizardStateProvider } from './WizardStateContext';

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

const SummaryRow = styled(Space)`
  flex-wrap: wrap;
  gap: 12px;
`;

const SummaryBadge = styled(Text)`
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-weight: 600;
`;

const initialWizardState: WizardState = {
  appId: 'secure-mail-gateway',
  selectedDeviceIds: [],
  templateId: 'balanced-protection',
  filter: '',
  pickedIds: [],
};

const DemoContainer: React.FC = () => {
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState);

  const steps: WizardStep[] = [
    {
      id: 'quick-setup',
      title: 'Quick Setup',
      // ✅ Fix: hand the component reference directly so React keeps the same identity between renders.
      //    This prevents unnecessary unmounts when the surrounding wizard state changes.
      Component: SecurityQuickSetupStep,
    },
    {
      id: 'policy-tuning',
      title: 'Policy Tuning',
      Component: PolicyTuningStep,
    },
  ];

  return (
    <WizardStateProvider value={{ wizardState, setWizardState }}>
      <Container direction="vertical">
        <ControlPanel direction="vertical">
          <Space direction="vertical" gap={4} align="flex-start">
            <Text style={{ fontWeight: 600, color: '#0f172a' }}>Global wizard state</Text>
            <Text style={{ color: '#475569' }}>
              Every change from the steps writes into a shared context. Because the step list lives
              on this component, those updates rebuild the array and remount the inline step.
            </Text>
          </Space>
          <SummaryRow direction="horizontal" align="center">
            <SummaryBadge>App: {wizardState.appId || '—'}</SummaryBadge>
            <SummaryBadge>Selected devices: {wizardState.selectedDeviceIds.length}</SummaryBadge>
            <SummaryBadge>Template: {wizardState.templateId || '—'}</SummaryBadge>
            <SummaryBadge>Filter: {wizardState.filter || '∅'}</SummaryBadge>
            <SummaryBadge>Policy picks: {wizardState.pickedIds.length}</SummaryBadge>
          </SummaryRow>
        </ControlPanel>

        <PerfWizard steps={steps} />
      </Container>
    </WizardStateProvider>
  );
};

export default DemoContainer;
