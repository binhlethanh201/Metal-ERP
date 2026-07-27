import React from 'react';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';

const ReconciliationDetailTable = ({ orders, selectedIds, onToggle, onToggleAll }) => {
  const allSelected = orders.length > 0 && selectedIds.size === orders.length;

  return (
    <div className="overflow-auto" style={{ maxHeight: '40vh' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="sticky top-0 border-b border-slate-200 bg-slate-50 text-left dark:border-[#333333] dark:bg-[#1a1a1a]">
            <th className="w-10 px-2 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="h-4 w-4 rounded text-[#004785]"
              />
            </th>
            <th className="px-2 py-2 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">Mã đơn</th>
            <th className="px-2 py-2 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">Ngày tạo</th>
            <th className="px-2 py-2 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">Khách hàng</th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
              Tổng tiền
            </th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
              Đã thu
            </th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
              Còn thiếu
            </th>
            <th className="px-2 py-2 text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">TT Đơn</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-2 py-8 text-center text-sm text-slate-400 dark:text-[#808080]">
                Không có đơn nào chưa đối soát
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const collected = (order.deposit || 0) + (order.codAmount || 0);
              const missing = order.totalPayment - collected;
              return (
                <tr
                  key={order.id}
                  onClick={() => onToggle(order.id)}
                  className={`cursor-pointer border-b border-slate-50 text-xs hover:bg-blue-50/30 dark:border-[#333333] dark:hover:bg-[#333333] ${
                    selectedIds.has(order.id) ? 'bg-blue-50/50 dark:bg-[#272727]' : ''
                  }`}
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => onToggle(order.id)}
                      className="h-3.5 w-3.5 rounded text-[#004785]"
                    />
                  </td>
                  <td className="px-2 py-1.5 font-mono text-[11px] font-medium text-[#004785] dark:text-blue-300">
                    {order.id}
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-slate-600 dark:text-[#b3b3b3]">{order.createdDate}</td>
                  <td className="px-2 py-1.5 text-[11px] dark:text-[#d4d4d4]">{order.recipientName}</td>
                  <td className="px-2 py-1.5 text-right text-[11px] font-medium dark:text-[#d4d4d4]">
                    {formatCurrency(order.totalPayment)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[11px] text-green-600">
                    {formatCurrency(collected)}
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right text-[11px] font-medium ${missing > 0 ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {formatCurrency(missing)}
                  </td>
                  <td className="px-2 py-1.5 text-[11px] dark:text-[#b3b3b3]">{order.status}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReconciliationDetailTable;
