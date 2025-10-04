import { RefObject, useEffect } from 'react';

const CELLS = new Map<HTMLElement, true>();
const CELL_SELECTOR = 'th.ant-table-cell,td.ant-table-cell,[data-cell]';

export function useAutoTrimCells(tableRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const obs = new ResizeObserver(() => {});

    const add = (el: HTMLElement) => {
      if (CELLS.has(el)) return;
      CELLS.set(el, true);
      obs.observe(el);
    };

    table.querySelectorAll<HTMLElement>(CELL_SELECTOR).forEach(add);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches?.(CELL_SELECTOR)) add(n);
            n.querySelectorAll?.(CELL_SELECTOR).forEach((el) => add(el as HTMLElement));
          }
        });
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches?.(CELL_SELECTOR)) obs.unobserve(n);
            n.querySelectorAll?.(CELL_SELECTOR).forEach((el) => obs.unobserve(el as HTMLElement));
          }
        });
      }
    });
    mo.observe(table, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      obs.disconnect();
    };
  }, [tableRef]);
}
