import { RefObject, useEffect } from 'react';

const CELL_SELECTOR = 'th.ant-table-cell,td.ant-table-cell,[data-cell]';

export function useAutoTrimCells(tableRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    // Локальное и "слабое" хранилище — GC свободно соберёт DOM-ноды
    const seen = new WeakSet<HTMLElement>();

    const obs = new ResizeObserver(() => {
      // ...код тримминга/пересчёта
    });

    const add = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      obs.observe(el);
    };

    // Первичный проход по уже существующим ячейкам
    table.querySelectorAll<HTMLElement>(CELL_SELECTOR).forEach(add);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        // добавленные ноды
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches?.(CELL_SELECTOR)) add(n);
            n.querySelectorAll?.(CELL_SELECTOR).forEach((el) => add(el as HTMLElement));
          }
        });

        // удалённые ноды
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches?.(CELL_SELECTOR)) {
              obs.unobserve(n);
              seen.delete(n); // <- важно: даём шанс пере-подписаться и не держим ссылку
            }
            n.querySelectorAll?.(CELL_SELECTOR).forEach((el) => {
              const h = el as HTMLElement;
              obs.unobserve(h);
              seen.delete(h); // <- чистим вложенные
            });
          }
        });
      }
    });

    mo.observe(table, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      obs.disconnect();
      // Ничего дополнительно чистить не надо — WeakSet не удерживает ссылки
    };
  }, [tableRef]);
}
