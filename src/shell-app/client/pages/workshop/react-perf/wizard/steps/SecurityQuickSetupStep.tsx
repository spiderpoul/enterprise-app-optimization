import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useWizardState } from '../WizardStateContext';
import { deviceInventory, type DeviceInventoryItem } from './deviceInventory';

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

const TableWrapper = styled.div`
  overflow: auto;
  max-height: 320px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
`;

const SimpleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
`;

const HeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
`;

const Row = styled.tr`
  &:nth-child(even) {
    background: rgba(248, 250, 252, 0.6);
  }
`;

const Cell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #0f172a;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
`;

const SelectionCell = styled(Cell)`
  width: 72px;
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

  const toggleDeviceSelection = (deviceId: string, checked: boolean) => {
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
  };

  const selectedIds = wizardState.selectedDeviceIds;

  return (
    <Layout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="selected" value={selectedIds.length} />
      </MetricsRow>

      <Space direction="vertical" gap={8} align="flex-start">
        <Text style={{ fontWeight: 600, color: '#0f172a' }}>Quick hardening setup</Text>
        <Text style={{ color: '#475569' }}>
          Choose the application profile to harden and tick the devices that must receive it.
          Because this component is defined inline in the steps array, any wizardState change
          remounts it and rebuilds the entire table.
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
      <TableWrapper>
        <SimpleTable>
          <thead>
            <tr>
              <HeaderCell style={{ width: 72 }} />
              <HeaderCell>Device name</HeaderCell>
              <HeaderCell>Operating system</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {deviceInventory.map((device) => (
              <Row key={device.id}>
                <SelectionCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(device.id)}
                    onChange={(event) => toggleDeviceSelection(device.id, event.target.checked)}
                  />
                </SelectionCell>
                <Cell>{device.name}</Cell>
                <Cell>{device.os}</Cell>
              </Row>
            ))}
          </tbody>
        </SimpleTable>
      </TableWrapper>
    </Layout>
  );
};

export default SecurityQuickSetupStep;
