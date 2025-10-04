import React from 'react';
import styled from 'styled-components';
import type { ColumnsType } from 'antd/es/table';
import { Space, Text, Table } from '@kaspersky/hexa-ui';
import MetricBadge from '../components/MetricBadge';
import { useLifecycleLog } from '../hooks/useLifecycleLog';
import { useRenderCount } from '../hooks/useRenderCount';

type DatasetOption = 'small' | 'medium' | 'large';

type DataRow = {
  id: string;
  [key: string]: string | number;
};

interface DataTableStepProps {
  dataset: DatasetOption;
}

const StepLayout = styled(Space)`
  gap: 16px;
`;

const MetricsRow = styled(Space)`
  flex-wrap: wrap;
  gap: 8px;
`;

const DatasetInfo = styled(Text)`
  color: #0f172a;
`;

const Summary = styled(Text)`
  color: #475569;
`;

const columnsCount = 10;

const datasetSizes: Record<DatasetOption, number> = {
  small: 5000,
  medium: 10000,
  large: 20000,
};

const createRow = (rowIndex: number): DataRow => {
  const row: DataRow = {
    id: `row-${rowIndex}`,
  };

  for (let columnIndex = 0; columnIndex < columnsCount; columnIndex += 1) {
    row[`col${columnIndex + 1}`] = `Cell ${rowIndex + 1}-${columnIndex + 1}`;
  }

  return row;
};

const DataTableStep: React.FC<DataTableStepProps> = ({ dataset }) => {
  const renders = useRenderCount('DataTableStep');
  const { mounts, unmounts } = useLifecycleLog('DataTableStep');

  const rowCount = datasetSizes[dataset];
  const start = performance.now();

  // ❌ Anti-pattern: generating thousands of rows directly inside the render path with no memoization.
  //    Every remount from the inline arrow step definition recreates the entire dataset.
  const dataSource = Array.from({ length: rowCount }, (_, index) => createRow(index));

  const generationTimeMs = Math.round(performance.now() - start);

  console.log(
    `[DataTableStep] generated ${rowCount} rows in ${generationTimeMs}ms for ${dataset} dataset`,
  );

  const columns: ColumnsType<DataRow> = Array.from({ length: columnsCount }, (_, index) => ({
    key: `col-${index + 1}`,
    title: `Column ${index + 1}`,
    dataIndex: `col${index + 1}`,
  }));

  return (
    <StepLayout direction="vertical">
      <MetricsRow direction="horizontal">
        <MetricBadge label="renders" value={renders} />
        <MetricBadge label="mounts" value={mounts} />
        <MetricBadge label="unmounts" value={unmounts} />
        <MetricBadge label="generation" value={`${generationTimeMs}ms`} />
      </MetricsRow>
      <DatasetInfo as="p">
        Dataset: <strong>{dataset}</strong> • Rows: <strong>{rowCount.toLocaleString()}</strong> •
        Columns: <strong>{columnsCount}</strong>
      </DatasetInfo>
      <Summary>
        Scroll around and switch datasets to watch this step unmount/remount while recreating{' '}
        {rowCount.toLocaleString()} rows each time.
      </Summary>
      <Table<DataRow>
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 50 }}
        rowKey="id"
        scroll={{ y: 420 }}
      />
    </StepLayout>
  );
};

export default DataTableStep;
