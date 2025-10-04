import React, { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { Space, Text } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useLifecycleLog } from '../hooks/useLifecycleLog';
import { useRenderCount } from '../hooks/useRenderCount';
import HeavyBlock from './HeavyBlock';
import { useWizardState } from '../WizardStateContext';
import { deviceInventory } from './deviceInventory';

const Layout = styled(Space)`
  gap: 16px;
`;

const MetricsRow = styled(Space)`
  flex-wrap: wrap;
  gap: 8px;
`;

const Controls = styled(Space)`
  gap: 16px;
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

const FilterInput = styled.input`
  width: 240px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.24);
  font-size: 14px;
`;

const DeviceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  max-height: 260px;
  overflow: auto;
`;

const DeviceItem = styled.li`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);

  &:last-child {
    border-bottom: none;
  }
`;

const DeviceMeta = styled(Space)`
  gap: 4px;
`;

const DeviceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const riskColor = (level: string) => {
  switch (level) {
    case 'High':
      return '#b91c1c';
    case 'Medium':
      return '#c2410c';
    default:
      return '#047857';
  }
};

const riskBackground = (level: string) => {
  switch (level) {
    case 'High':
      return 'rgba(239, 68, 68, 0.12)';
    case 'Medium':
      return 'rgba(249, 115, 22, 0.12)';
    default:
      return 'rgba(16, 185, 129, 0.12)';
  }
};

const RiskBadge = styled.span<{ level: string }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ level }) => riskColor(level)};
  background: ${({ level }) => riskBackground(level)};
`;

const PolicyTuningStep: React.FC = () => {
  const renders = useRenderCount('PolicyTuningStep');
  const { mounts, unmounts } = useLifecycleLog('PolicyTuningStep');
  const { wizardState, setWizardState } = useWizardState();

  const [templateId, setTemplateId] = useState(wizardState.templateId);
  const [filter, setFilter] = useState(wizardState.filter);
  const [pickedIds, setPickedIds] = useState<string[]>(wizardState.pickedIds);

  const handleTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextTemplate = event.target.value;
    setTemplateId(nextTemplate);
    setWizardState((prev) => ({
      ...prev,
      templateId: nextTemplate,
    }));
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFilter = event.target.value;
    // ❌ Anti-pattern: storing filter state right beside HeavyBlock means every keystroke blocks the UI.
    setFilter(nextFilter);
    setWizardState((prev) => ({
      ...prev,
      filter: nextFilter,
    }));
  };

  const togglePickedDevice = (deviceId: string) => {
    setPickedIds((current) => {
      const exists = current.includes(deviceId);
      const nextSelection = exists
        ? current.filter((id) => id !== deviceId)
        : [...current, deviceId];

      setWizardState((prev) => ({
        ...prev,
        pickedIds: nextSelection,
      }));

      console.log('[PolicyTuningStep] picked devices →', nextSelection);

      return nextSelection;
    });
  };

  const normalizedFilter = filter.trim().toLowerCase();
  const visibleDevices = deviceInventory.filter((device) => {
    if (!normalizedFilter) {
      return true;
    }

    const haystack = `${device.name} ${device.owner} ${device.location} ${device.os}`.toLowerCase();
    return haystack.includes(normalizedFilter);
  });

  return (
    <Layout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="renders" value={renders} />
        <MetricBadge label="mounts" value={mounts} />
        <MetricBadge label="unmounts" value={unmounts} />
        <MetricBadge label="picked" value={pickedIds.length} />
      </MetricsRow>

      <Space direction="vertical" gap={8} align="flex-start">
        <Text style={{ fontWeight: 600, color: '#0f172a' }}>Policy tuning playground</Text>
        <Text style={{ color: '#475569' }}>
          Adjust the response template and fine-tune the target list. The heavyweight block below
          will recompute on every render, locking the main thread for a noticeable ~150ms.
        </Text>
      </Space>

      <Controls direction="horizontal" align="center">
        <Space direction="vertical" gap={4} align="flex-start">
          <Text style={{ fontWeight: 500, color: '#0f172a' }}>Response template</Text>
          <SelectControl value={templateId} onChange={handleTemplateChange}>
            <option value="balanced-protection">Balanced protection</option>
            <option value="strict-lockdown">Strict lockdown</option>
            <option value="monitor-only">Monitor only</option>
          </SelectControl>
        </Space>
        <Space direction="vertical" gap={4} align="flex-start">
          <Text style={{ fontWeight: 500, color: '#0f172a' }}>Device filter</Text>
          <FilterInput
            value={filter}
            onChange={handleFilterChange}
            placeholder="Filter by owner, location or OS"
          />
        </Space>
      </Controls>

      <DeviceList>
        {visibleDevices.map((device) => {
          const checked = pickedIds.includes(device.id);
          const checkboxId = `policy-device-${device.id}`;

          return (
            <DeviceItem key={device.id}>
              <DeviceLabel htmlFor={checkboxId}>
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePickedDevice(device.id)}
                />
                <DeviceMeta direction="vertical" align="flex-start">
                  <Text style={{ fontWeight: 600, color: '#0f172a' }}>{device.name}</Text>
                  <Text style={{ color: '#475569' }}>
                    {device.owner} • {device.os} • {device.location}
                  </Text>
                </DeviceMeta>
              </DeviceLabel>
              <RiskBadge level={device.risk}>{device.risk} risk</RiskBadge>
            </DeviceItem>
          );
        })}

        {visibleDevices.length === 0 && (
          <DeviceItem>
            <Text style={{ color: '#94a3b8' }}>No devices matched the current filter.</Text>
          </DeviceItem>
        )}
      </DeviceList>

      <HeavyBlock inputValue={`${templateId}|${filter}|${pickedIds.join(',')}`} />
    </Layout>
  );
};

export default PolicyTuningStep;
