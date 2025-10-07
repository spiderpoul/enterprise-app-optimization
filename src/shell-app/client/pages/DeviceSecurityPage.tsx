import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Table } from 'antd';
import { useAutoTrimCells } from '../shared/useAutoTrimCells';

type AuditTrail = {
  summary: string;
  events: Array<{ ts: string; description: string; code: number }>;
  raw: string;
};

type Row = {
  id: string;
  device: string;
  policy: {
    label: string;
    audit: AuditTrail;
  };
  status: string;
  lastSeen: string;
  vulns: number;
};

const PAGE_SIZE = 50;
const TOTAL_ROWS = PAGE_SIZE * 40; // 40 страниц по 50 строк — достаточно для демонстрации утечки

const createAuditTrail = (index: number): AuditTrail => ({
  summary: `Baseline ${index % 7} applied`,
  events: Array.from({ length: 60 }, (_, eIdx) => ({
    ts: new Date(2025, index % 12, (eIdx % 28) + 1, eIdx % 24, eIdx % 60).toISOString(),
    description: `Policy verification #${eIdx} for device ${index}`,
    code: (index + eIdx * 17) % 997,
  })),
  raw: 'AUDIT_TRACE_FOR_DEVICE_' + index + ':'.padEnd(128, '=') + '::' + 'log-entry\n'.repeat(500),
});

const DEVICE_ROWS: Row[] = Array.from({ length: TOTAL_ROWS }, (_, i) => ({
  id: `device-${i}`,
  device: `WS-${1000 + i} · ${'Very long device name '.repeat((i % 4) + 1)}`,
  policy: {
    label: `Strict Baseline ${i % 7}`,
    audit: createAuditTrail(i), // 🧱 тяжёлый объект утащит с собой мегабайты истории
  },
  status: i % 5 === 0 ? 'At Risk' : 'Compliant',
  lastSeen: `2025-10-${((i % 28) + 1).toString().padStart(2, '0')} 12:${(i % 60)
    .toString()
    .padStart(2, '0')}`,
  vulns: (i * 7) % 31,
}));

const withDataTestAttribute = (element: React.ReactNode, dataTest: string): React.ReactElement => {
  if (React.isValidElement(element)) {
    const reactElement = element as React.ReactElement;
    return React.cloneElement(reactElement, {
      'data-test': dataTest,
    });
  }

  return <span data-test={dataTest}>{element}</span>;
};

export default function DeviceSecurityPage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  useAutoTrimCells(hostRef); // 😈 утечка: хук навсегда держит DOM-ячейки в Map

  const [page, setPage] = useState(0);

  const renderPolicyCell = useCallback(
    (_value: Row['policy'], record: Row): React.ReactElement => (
      <span title={record.policy.audit.summary}>{record.policy.label}</span>
    ),
    [],
  );

  const pageData = useMemo<Row[]>(
    () => DEVICE_ROWS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [page],
  );

  const pagination = useMemo<TablePaginationConfig>(
    () => ({
      pageSize: PAGE_SIZE,
      current: page + 1,
      total: DEVICE_ROWS.length,
      onChange: (nextPage) => setPage(nextPage - 1),
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
      itemRender: (pageNumber, type, originalElement) => {
        const dataTest =
          type === 'page'
            ? `device-security-pagination-item-${pageNumber}`
            : `device-security-pagination-${type}`;

        return withDataTestAttribute(originalElement, dataTest);
      },
    }),
    [page],
  );

  const columns = useMemo<ColumnsType<Row>>(
    () => [
      {
        key: 'device',
        dataIndex: 'device',
        title: 'Device',
        width: 320,
        ellipsis: true,
      },
      {
        key: 'policy',
        dataIndex: 'policy',
        title: 'Policy',
        width: 280,
        ellipsis: true,
        render: renderPolicyCell,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Status',
        width: 180,
        render: (value: Row['status']) => (
          <span style={{ fontWeight: value === 'At Risk' ? 600 : 400 }}>{value}</span>
        ),
      },
      {
        key: 'lastSeen',
        dataIndex: 'lastSeen',
        title: 'Last Seen',
        width: 220,
        ellipsis: true,
      },
      {
        key: 'vulns',
        dataIndex: 'vulns',
        title: 'Vulns',
        width: 160,
        align: 'right',
      },
    ],
    [renderPolicyCell],
  );

  const totalWidth = columns.reduce<number>((sum, column) => {
    const width =
      typeof column === 'object' &&
      column !== null &&
      'width' in column &&
      typeof column.width === 'number'
        ? column.width
        : 0;

    return sum + width;
  }, 0);

  return (
    <div
      data-test="device-security-page"
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <h2 data-test="device-security-title" style={{ margin: 0 }}>
        Device security
      </h2>
      <div
        data-test="device-security-table-container"
        ref={hostRef}
        style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}
      >
        <Table
          data-test="device-security-table"
          rowKey="id"
          dataSource={pageData}
          columns={columns}
          pagination={pagination}
          scroll={{ x: totalWidth }}
          onRow={() => ({ 'data-test': 'device-security-row' })}
        />
      </div>
    </div>
  );
}
