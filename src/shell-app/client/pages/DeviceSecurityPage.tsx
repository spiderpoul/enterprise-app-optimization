import React, { useMemo, useRef, useState } from 'react';
import { Table, type TableColumn, type TablePaginationProps, type TableRecord } from '@kaspersky/hexa-ui';
import { useAutoTrimCells } from '../shared/useAutoTrimCells';

type Row = TableRecord & {
  id: string;
  device: string;
  policy: string;
  status: string;
  lastSeen: string;
  vulns: number;
};

export default function DeviceSecurityPage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  useAutoTrimCells(hostRef);

  const [w1, setW1] = useState(180);
  const [w2, setW2] = useState(240);
  const [w3, setW3] = useState(140);
  const [w4, setW4] = useState(160);
  const [w5, setW5] = useState(120);
  const [page, setPage] = useState(0);
  const pageSize = 40;

  const data = useMemo<Row[]>(
    () =>
      Array.from({ length: 400 }, (_, i) => ({
        id: `d${i}`,
        device: `WS-${1000 + i} · ${'Very long device name '.repeat((i % 4) + 1)}`,
        policy: `Strict Baseline ${i % 7}`,
        status: i % 5 === 0 ? 'At Risk' : 'Compliant',
        lastSeen: `2025-10-${(i % 28 + 1).toString().padStart(2, '0')} 12:${(i % 60)
          .toString()
          .padStart(2, '0')}`,
        vulns: (i * 7) % 31,
      })),
    [],
  );

  const pageData = useMemo<Row[]>(
    () => data.slice(page * pageSize, (page + 1) * pageSize),
    [data, page, pageSize],
  );

  const columns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'device',
        dataIndex: 'device',
        title: 'Device',
        width: w1,
        ellipsis: true,
      },
      {
        key: 'policy',
        dataIndex: 'policy',
        title: 'Policy',
        width: w2,
        ellipsis: true,
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Status',
        width: w3,
        render: (value: Row['status']) => (
          <span style={{ fontWeight: value === 'At Risk' ? 600 : 400 }}>{value}</span>
        ),
      },
      {
        key: 'lastSeen',
        dataIndex: 'lastSeen',
        title: 'Last Seen',
        width: w4,
        ellipsis: true,
      },
      {
        key: 'vulns',
        dataIndex: 'vulns',
        title: 'Vulns',
        width: w5,
        align: 'right',
      },
    ],
    [w1, w2, w3, w4, w5],
  );

  const pagination = useMemo<TablePaginationProps>(
    () => ({
      pageSize,
      current: page + 1,
      total: data.length,
      onChange: (nextPage) => setPage(nextPage - 1),
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    }),
    [data.length, page, pageSize],
  );

  const totalWidth = w1 + w2 + w3 + w4 + w5;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>Безопасность устройств</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label>
          Device
          <input type="range" min={120} max={360} value={w1} onChange={(e) => setW1(Number(e.target.value))} />
        </label>
        <label>
          Policy
          <input type="range" min={140} max={360} value={w2} onChange={(e) => setW2(Number(e.target.value))} />
        </label>
        <label>
          Status
          <input type="range" min={100} max={240} value={w3} onChange={(e) => setW3(Number(e.target.value))} />
        </label>
        <label>
          Last Seen
          <input type="range" min={120} max={300} value={w4} onChange={(e) => setW4(Number(e.target.value))} />
        </label>
        <label>
          Vulns
          <input type="range" min={80} max={200} value={w5} onChange={(e) => setW5(Number(e.target.value))} />
        </label>
        <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Prev
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(Math.ceil(data.length / pageSize) - 1, p + 1))}
        >
          Next
        </button>
        <span>Page {page + 1}</span>
      </div>
      <div ref={hostRef} style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          rowKey="id"
          dataSource={pageData}
          columns={columns}
          pagination={pagination}
          scroll={{ x: totalWidth }}
        />
      </div>
    </div>
  );
}
