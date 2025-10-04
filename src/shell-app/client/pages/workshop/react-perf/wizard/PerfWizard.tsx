import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Space, Text } from '@kaspersky/hexa-ui';

export type WizardStep = {
  id: string;
  title: string;
  Component: React.ComponentType;
};

interface PerfWizardProps {
  steps: WizardStep[];
}

const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StepShell = styled.div`
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 22px 44px -20px rgba(15, 23, 42, 0.25);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepHeader = styled(Space)`
  justify-content: space-between;
  align-items: center;
`;

const StepContent = styled.div`
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 24px;
  background: #fff;
`;

const StepFooter = styled(Space)`
  justify-content: flex-end;
  gap: 12px;
`;

const StepsMeta = styled(Space)`
  gap: 12px;
`;

const PerfWizard: React.FC<PerfWizardProps> = ({ steps }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const totalSteps = steps.length;
  const activeStep = steps[Math.min(activeStepIndex, totalSteps - 1)];

  const stepTitle = activeStep?.title ?? 'Step';

  const canGoPrev = activeStepIndex > 0;
  const canGoNext = activeStepIndex < totalSteps - 1;
  const isLastStep = activeStepIndex === totalSteps - 1;

  const stepIndicator = useMemo(
    () => `${activeStepIndex + 1} / ${totalSteps}`,
    [activeStepIndex, totalSteps],
  );

  if (!activeStep) {
    return null;
  }

  const StepComp = activeStep.Component;

  return (
    <WizardContainer>
      <StepShell>
        <StepHeader direction="horizontal">
          <Space direction="vertical" gap={4} align="flex-start">
            <Text style={{ fontWeight: 700, fontSize: 18 }}>{stepTitle}</Text>
            <Text style={{ color: '#64748b' }}>
              Deliberately inefficient quick setup for perf workshops
            </Text>
          </Space>
          <StepsMeta direction="horizontal" align="center">
            <Text style={{ fontVariantNumeric: 'tabular-nums', color: '#1f2937' }}>
              Step {stepIndicator}
            </Text>
          </StepsMeta>
        </StepHeader>

        <StepContent>
          {/**
           * ❌ Anti-pattern: when Component is an inline arrow, React sees a new function identity on each render.
           *    That changes element.type and triggers a full remount every time the parent re-renders.
           */}
          <StepComp key={activeStep.id} />
        </StepContent>

        <StepFooter direction="horizontal">
          <Button
            mode="tertiary"
            disabled={!canGoPrev}
            onClick={() => setActiveStepIndex((index) => Math.max(0, index - 1))}
          >
            Prev
          </Button>
          <Button
            mode="secondary"
            disabled={!canGoNext}
            onClick={() => setActiveStepIndex((index) => Math.min(totalSteps - 1, index + 1))}
          >
            Next
          </Button>
          <Button
            mode="primary"
            disabled={!isLastStep}
            onClick={() => console.log('Finish wizard clicked')}
          >
            Finish
          </Button>
        </StepFooter>
      </StepShell>
    </WizardContainer>
  );
};

export default PerfWizard;
