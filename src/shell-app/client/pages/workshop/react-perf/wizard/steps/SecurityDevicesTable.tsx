import React, { useEffect, useMemo, useState } from 'react';
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #475569;
  font-size: 14px;
`;

interface SecurityDevicesTableProps {
  devices: DeviceInventoryItem[];
  selectedIds: string[];
  onToggleSelection: (deviceId: string, checked: boolean) => void;
}

const RENDER_DELAY_MS = 320;

const SecurityDevicesTable: React.FC<SecurityDevicesTableProps> = ({
  devices,
  selectedIds,
  onToggleSelection,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    const timer = window.setTimeout(() => setIsReady(true), RENDER_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [devices]);

  const rows = useMemo(
    () =>
      devices.map((device) => {
        const isSelected = selectedIds.includes(device.id);
        return (
          <Row key={device.id}>
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
      }),
    [devices, onToggleSelection, selectedIds],
  );

  if (!isReady) {
    return (
      <TableWrapper>
        <LoadingContainer>Preparing device table…</LoadingContainer>
      </TableWrapper>
    );
  }

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
