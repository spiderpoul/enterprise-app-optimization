import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { DeviceInventoryItem } from './deviceInventory';

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

interface SecurityDevicesTableProps {
  devices: DeviceInventoryItem[];
  selectedIds: string[];
  onToggleSelection: (deviceId: string, checked: boolean) => void;
}

const COMPLEXITY_ITERATIONS = 48000;

const buildDeviceRows = (
  devices: DeviceInventoryItem[],
  selectedIds: string[],
  onToggleSelection: (deviceId: string, checked: boolean) => void,
) => {
  return devices.map((device) => {
    const fingerprint = `${device.id}:${device.name}:${device.os}`;
    let complexityScore = 0;

    for (let iteration = 0; iteration < COMPLEXITY_ITERATIONS; iteration += 1) {
      const charCode = fingerprint.charCodeAt(iteration % fingerprint.length);
      complexityScore = (complexityScore * 33 + charCode * (iteration + 1)) % 1_000_003;
    }

    const isSelected = selectedIds.includes(device.id);

    return (
      <Row key={device.id} data-complexity={complexityScore}>
        <SelectionCell>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onToggleSelection(device.id, event.target.checked)}
          />
        </SelectionCell>
        <Cell>{device.name}</Cell>
        <Cell>{device.os}</Cell>
      </Row>
    );
  });
};

const SecurityDevicesTable: React.FC<SecurityDevicesTableProps> = ({
  devices,
  selectedIds,
  onToggleSelection,
}) => {
  const rows = useMemo(
    () => buildDeviceRows(devices, selectedIds, onToggleSelection),
    [devices, onToggleSelection, selectedIds],
  );

  return (
    <TableWrapper>
      <SimpleTable>
        <thead>
          <tr>
            <HeaderCell style={{ width: 72 }} />
            <HeaderCell>Device name</HeaderCell>
            <HeaderCell>Operating system</HeaderCell>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </SimpleTable>
    </TableWrapper>
  );
};

export default SecurityDevicesTable;
