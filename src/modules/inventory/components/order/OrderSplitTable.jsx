import React, { useRef, useLayoutEffect } from 'react';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { renderCellValue, renderFilter } from '../../utils/orderUtils';

const OrderSplitTable = ({
  frozenCols,
  scrollCols,
  pagedOrders,
  columnFilters,
  selectedOrders,
  selectedOrder,
  footerTotals,
  onSelectOrder,
  onColumnFilterChange,
  onToggleSelectAll,
  onToggleSelectOrder,
}) => {
  const frozenTableRef = useRef(null);
  const scrollTableRef = useRef(null);

  useLayoutEffect(() => {
    const frozenTable = frozenTableRef.current;
    const scrollTable = scrollTableRef.current;
    if (!frozenTable || !scrollTable) return;

    const syncSection = (selector) => {
      const rowsA = frozenTable.querySelectorAll(selector);
      const rowsB = scrollTable.querySelectorAll(selector);
      const len = Math.min(rowsA.length, rowsB.length);
      for (let i = 0; i < rowsA.length; i++) rowsA[i].style.height = '';
      for (let i = 0; i < rowsB.length; i++) rowsB[i].style.height = '';
      for (let i = 0; i < len; i++) {
        const h = Math.max(rowsA[i].offsetHeight, rowsB[i].offsetHeight);
        rowsA[i].style.height = `${h}px`;
        rowsB[i].style.height = `${h}px`;
      }
    };

    syncSection('thead tr');
    syncSection('tbody tr');
    syncSection('tfoot tr');
  }, [pagedOrders, selectedOrder]);

  const renderHeaderRow = (cols, isFilterRow) => (
    <tr
      className={`border-b ${isFilterRow ? 'border-slate-100 bg-slate-50/50 dark:border-[#333333] dark:bg-[#1a1a1a]/50' : 'border-slate-200 bg-slate-50 dark:border-[#333333] dark:bg-[#1a1a1a]'}`}
    >
      {cols.map((col) => (
        <th
          key={isFilterRow ? `f-${col.key}` : col.key}
          className={
            isFilterRow
              ? 'px-1.5 py-0.5'
              : 'whitespace-nowrap px-2.5 py-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]'
          }
          style={{ width: col.width, minWidth: col.width }}
        >
          {isFilterRow ? (
            renderFilter(col, columnFilters[col.key] || '', (v) => onColumnFilterChange(col.key, v))
          ) : col.key === 'checkbox' ? (
            <input
              type="checkbox"
              checked={pagedOrders.length > 0 && selectedOrders.size === pagedOrders.length}
              onChange={onToggleSelectAll}
              className="h-3.5 w-3.5 rounded text-[#004785]"
            />
          ) : (
            col.header
          )}
        </th>
      ))}
    </tr>
  );

  const renderDataRows = (cols) =>
    pagedOrders.map((order) => (
      <tr
        key={order.id}
        onClick={() => onSelectOrder(order)}
        className={`cursor-pointer border-b border-slate-50 hover:bg-blue-50/30 dark:border-[#333333] dark:hover:bg-[#333333] ${
          selectedOrder?.id === order.id ? 'bg-blue-50/60 dark:bg-[#272727]' : ''
        }`}
      >
        {cols.map((col) => (
          <td
            key={col.key}
            className={`px-2.5 py-1 text-xs ${col.type === 'number' ? 'text-right tabular-nums' : ''} ${col.type !== 'multiline' ? 'whitespace-nowrap' : ''}`}
            style={{ width: col.width, minWidth: col.width }}
          >
            {col.key === 'checkbox' ? (
              <input
                type="checkbox"
                checked={selectedOrders.has(order.id)}
                onChange={() => onToggleSelectOrder(order.id)}
                className="h-3.5 w-3.5 rounded text-[#004785]"
              />
            ) : (
              renderCellValue(col, order)
            )}
          </td>
        ))}
      </tr>
    ));

  const renderFooterRow = (cols, isFrozen) => (
    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold dark:border-[#404040] dark:bg-[#1a1a1a]">
      {cols.map((col) => {
        if (isFrozen && col.key === 'checkbox')
          return (
            <td
              key={col.key}
              className="whitespace-nowrap px-2.5 py-1 text-xs text-slate-600 dark:text-[#b3b3b3]"
              style={{ width: col.width }}
            >
              Tổng cộng
            </td>
          );
        if (isFrozen && frozenCols.indexOf(col) !== 0)
          return <td key={col.key} className="px-2.5 py-1" style={{ width: col.width }} />;
        if (!isFrozen) {
          if (col.key === 'totalPayment')
            return (
              <td
                key={col.key}
                className="whitespace-nowrap px-2.5 py-1 text-right text-xs text-[#004785]"
                style={{ width: col.width }}
              >
                {formatCurrency(footerTotals.totalPayment)}
              </td>
            );
          if (col.key === 'customerDebt')
            return (
              <td
                key={col.key}
                className="whitespace-nowrap px-2.5 py-1 text-right text-xs text-red-600"
                style={{ width: col.width }}
              >
                {formatCurrency(footerTotals.customerDebt)}
              </td>
            );
          if (col.key === 'remainingToCollect')
            return (
              <td
                key={col.key}
                className="whitespace-nowrap px-2.5 py-1 text-right text-xs text-amber-600"
                style={{ width: col.width }}
              >
                {formatCurrency(footerTotals.remainingToCollect)}
              </td>
            );
          if (col.key === 'shippingFeePartner')
            return (
              <td
                key={col.key}
                className="whitespace-nowrap px-2.5 py-1 text-right text-xs text-slate-700 dark:text-[#b3b3b3]"
                style={{ width: col.width }}
              >
                {formatCurrency(footerTotals.shippingFeePartner)}
              </td>
            );
        }
        return <td key={col.key} className="px-2.5 py-1" style={{ width: col.width }} />;
      })}
    </tr>
  );

  return (
    <div className="overflow-x-auto border-t border-slate-200 dark:border-[#333333]">
      <div className="flex">
        {/* LEFT: Frozen columns */}
        <div className="z-10 shrink-0 border-r border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
          <table className="border-collapse" ref={frozenTableRef}>
            <thead>
              {renderHeaderRow(frozenCols, false)}
              {renderHeaderRow(frozenCols, true)}
            </thead>
            <tbody>{renderDataRows(frozenCols)}</tbody>
            <tfoot>{renderFooterRow(frozenCols, true)}</tfoot>
          </table>
        </div>

        {/* RIGHT: Scrollable columns */}
        <div className="flex-1 overflow-x-auto bg-white dark:bg-[#1a1a1a]">
          <table
            className="border-collapse"
            ref={scrollTableRef}
            style={{ minWidth: scrollCols.reduce((s, c) => s + c.width, 0) }}
          >
            <thead>
              {renderHeaderRow(scrollCols, false)}
              {renderHeaderRow(scrollCols, true)}
            </thead>
            <tbody>{renderDataRows(scrollCols)}</tbody>
            <tfoot>{renderFooterRow(scrollCols, false)}</tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderSplitTable;
