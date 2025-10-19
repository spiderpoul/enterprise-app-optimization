import React, { ChangeEvent, useCallback } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useWizardState } from '../WizardStateContext';
import { deviceInventory } from './deviceInventory';
import SecurityDevicesTable from './SecurityDevicesTable';

const Layout = styled(Space)`
  gap: 16px;
`;

const MetricsRow = styled(Space)`
  flex-wrap: wrap;
  gap: 8px;
`;

const Controls = styled(Space)`
  gap: 12px;
  flex-wrap: wrap;
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

const SecurityQuickSetupStep: React.FC = () => {
  const { wizardState, setWizardState } = useWizardState();

  const handleAppChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextAppId = event.target.value;

    setWizardState((prev) => ({
      ...prev,
      appId: nextAppId,
    }));
  };

  const toggleDeviceSelection = useCallback(
    (deviceId: string, checked: boolean) => {
      setWizardState((prev) => {
        const nextSelection = checked
          ? [...prev.selectedDeviceIds, deviceId]
          : prev.selectedDeviceIds.filter((id) => id !== deviceId);

        console.log('[SecurityQuickSetupStep] selected devices →', nextSelection);

        return {
          ...prev,
          selectedDeviceIds: nextSelection,
        };
      });
    },
    [setWizardState],
  );

  const selectedIds = wizardState.selectedDeviceIds;

  return (
    <Layout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="selected" value={selectedIds.length} />
      </MetricsRow>

      <Space direction="vertical" gap={8} align="flex-start">
        <Text style={{ fontWeight: 600, color: '#0f172a' }}>Quick hardening setup</Text>
        <Text style={{ color: '#475569' }}>
          Choose the application profile to harden and tick the devices that must receive it. Because
          this component is defined inline in the steps array, any wizardState change remounts it and
          rebuilds the entire table.
        </Text>
      </Space>

      <Controls direction="horizontal" align="center">
        <Space direction="vertical" gap={4} align="flex-start">
          <Text style={{ fontWeight: 500, color: '#0f172a' }}>Application</Text>
          <SelectControl value={wizardState.appId} onChange={handleAppChange}>
            <option value="secure-mail-gateway">Secure Mail Gateway</option>
            <option value="endpoint-shield">Endpoint Shield</option>
            <option value="mobile-defense">Mobile Defense</option>
          </SelectControl>
        </Space>
        <Space direction="vertical" gap={4} align="flex-start">
          <Text style={{ fontWeight: 500, color: '#0f172a' }}>Selected devices</Text>
          <Text style={{ color: '#1d4ed8', fontWeight: 600 }}>{selectedIds.length}</Text>
        </Space>
      </Controls>

      <SecurityDevicesTable
        devices={deviceInventory}
        selectedIds={selectedIds}
        onToggleSelection={toggleDeviceSelection}
      />
    </Layout>
  );
};

export default SecurityQuickSetupStep;
