import React, { useMemo } from 'react';
import { formatCurrency } from '../../../../shared/utils/formatCurrency';
import { TAG_COLORS } from '../../data/orderPageData';
import { TAG_POOL } from '../../data/orderMockData';

const OrderDetailPanel = ({ order, detailTab, onTabChange, onClose }) => {
  const detailItemTotals = useMemo(() => {
    if (!order?.items) return { totalQty: 0, totalAmount: 0 };
    return {
      totalQty: order.items.reduce((s, i) => s + i.quantity, 0),
      totalAmount: order.items.reduce((s, i) => s + i.price * i.quantity, 0),
    };
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed bottom-0 left-[260px] right-0 z-40 max-h-[45vh] overflow-hidden rounded-t-lg border border-b-0 border-slate-200 bg-white shadow-[-0_-6px_20px_rgba(0,0,0,0.10)]">
      {/* Header */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('detail')}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${detailTab === 'detail' ? 'bg-white text-[#004785] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Chi tiết
          </button>
          <button
            onClick={() => onTabChange('tags')}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${detailTab === 'tags' ? 'bg-white text-[#004785] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Nhãn
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
          <span>
            Mã đơn: <strong className="text-[#004785]">{order.id}</strong>
          </span>
          <span>|</span>
          <span>
            Khách: <strong>{order.recipientName}</strong>
          </span>
          <span>|</span>
          <span>
            Tổng: <strong className="text-green-600">{formatCurrency(order.totalPayment)}</strong>
          </span>
          <button
            onClick={onClose}
            className="ml-1 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(45vh - 40px)' }}>
        {detailTab === 'detail' && order.items && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                <th className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500">
                  Mã SKU
                </th>
                <th className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500">
                  Tên hàng hóa
                </th>
                <th className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500">ĐVT</th>
                <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                  Số lượng
                </th>
                <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                  Đơn giá
                </th>
                <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase text-slate-500">
                  Tiền hàng
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-50 text-xs">
                  <td className="px-3 py-1 font-mono text-[11px] text-[#004785]">{item.sku}</td>
                  <td className="px-3 py-1 text-[11px]">{item.name}</td>
                  <td className="px-3 py-1 text-[11px]">{item.unit}</td>
                  <td className="px-3 py-1 text-right text-[11px]">
                    {item.quantity.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3 py-1 text-right text-[11px]">{formatCurrency(item.price)}</td>
                  <td className="px-3 py-1 text-right text-[11px] font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 text-xs font-bold">
                <td colSpan={3} className="px-3 py-1.5 text-slate-600">
                  Tổng cộng
                </td>
                <td className="px-3 py-1.5 text-right">
                  {detailItemTotals.totalQty.toLocaleString('vi-VN')}
                </td>
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5 text-right text-[#004785]">
                  {formatCurrency(detailItemTotals.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {detailTab === 'tags' && (
          <div className="p-6">
            <p className="mb-3 text-sm font-medium text-slate-700">Nhãn của đơn hàng {order.id}</p>
            {(order.tags || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(order.tags || []).map((t, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-3 py-1.5 text-sm font-bold ${TAG_COLORS[t.color] || 'bg-slate-100 text-slate-600'}`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Không có nhãn nào</p>
            )}
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-slate-700">Thêm nhãn</p>
              <div className="flex flex-wrap gap-2">
                {TAG_POOL.filter((t) => !(order.tags || []).some((et) => et.label === t.label)).map(
                  (t) => (
                    <button
                      key={t.label}
                      className={`rounded-full border px-3 py-1 text-sm font-medium hover:opacity-80 ${TAG_COLORS[t.color] || 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      + {t.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPanel;
