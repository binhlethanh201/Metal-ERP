/**
 * Bảng dữ liệu đơn hàng POS - Tích hợp highlight dòng đang chọn xem chi tiết trực tiếp.
 */
import React from 'react';
import { formatDateTime } from '../../../../shared/utils/formatDate';

const OrderTable = ({
  orders,
  selectedIds,
  selectedOrderIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="select-none border-b border-slate-300 bg-slate-50 font-mono text-[10px] font-black uppercase tracking-wider text-slate-400 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#808080]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#004785] focus:ring-0"
                  onChange={onToggleSelectAll}
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                />
              </th>
              <th className="px-4 py-3">Mã đơn hàng</th>
              <th className="px-4 py-3">Ngày tạo đơn</th>
              <th className="px-4 py-3">Đại lý / Khách hàng</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Giao hàng</th>
              <th className="px-4 py-3 text-right">Tổng tiền (VND)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-semibold text-slate-700 dark:divide-[#333333] dark:text-[#b3b3b3]">
            {orders.map((order) => {
              const isChecked = selectedIds.includes(order.id);
              const isCurrentOpen = selectedOrderIds.includes(order.id);
              return (
                <tr
                  key={order.id}
                  onClick={() => onRowClick(order)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isCurrentOpen
                      ? 'border-y border-y-[#004785]/30 bg-blue-50/80'
                      : isChecked
                        ? 'bg-slate-50/80'
                        : 'hover:bg-slate-50/50 dark:hover:bg-[#272727]/50'
                  }`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#004785] focus:ring-0"
                      checked={isChecked}
                      onChange={() => onToggleSelect(order.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-black text-[#004785]">{order.code}</td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-400 dark:text-[#808080]">
                    {formatDateTime(order.date)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-900 dark:text-[#e5e5e5]">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3">
                    {order.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        ĐÃ THANH TOÁN
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-[2px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        CHƯA TRẢ
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.shippingStatus === 'shipped' ? (
                      <span className="inline-flex items-center rounded-[2px] border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                        ĐÃ XUẤT GIAO
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-[2px] border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#999999]">
                        CHỜ ĐIỀU PHỐI
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-black text-slate-900 dark:text-[#e5e5e5]">
                    {order.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
