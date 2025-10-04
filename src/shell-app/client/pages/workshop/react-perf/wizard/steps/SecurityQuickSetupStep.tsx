import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import type { ColumnsType } from 'antd/es/table';
import { Space, Table, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useLifecycleLog } from '../hooks/useLifecycleLog';
import { useRenderCount } from '../hooks/useRenderCount';
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

const SecurityQuickSetupStep: React.FC = () => {
  const renders = useRenderCount('SecurityQuickSetupStep');
  const { mounts, unmounts } = useLifecycleLog('SecurityQuickSetupStep');
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

  const columns: ColumnsType<DeviceInventoryItem> = [
    {
      key: 'select',
      width: 72,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(record.id)}
          onChange={(event) => toggleDeviceSelection(record.id, event.target.checked)}
        />
      ),
    },
    {
      key: 'name',
      dataIndex: 'name',
      title: 'Device name',
    },
    {
      key: 'os',
      dataIndex: 'os',
      title: 'Operating system',
    },
  ];

  return (
    <Layout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="renders" value={renders} />
        <MetricBadge label="mounts" value={mounts} />
        <MetricBadge label="unmounts" value={unmounts} />
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

      <Table<DeviceInventoryItem>
        dataSource={deviceInventory}
        columns={columns}
        pagination={{ pageSize: 6 }}
        rowKey="id"
        scroll={{ y: 320 }}
      />
    </Layout>
  );
};

export default SecurityQuickSetupStep;
