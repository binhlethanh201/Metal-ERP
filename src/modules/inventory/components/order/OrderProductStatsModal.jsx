import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';

const OrderProductStatsModal = ({ isOpen, onClose, stats }) => {
  const { productTopByQty, productTopByRevenue, productSummary, maxBarValue, formatCurrency } =
    stats;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thống kê hàng hóa"
      size="4xl"
      footer={
        <div className="flex w-full justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-[11px] font-bold uppercase text-blue-400">Tổng mặt hàng</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">{productSummary.totalProducts}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-[11px] font-bold uppercase text-emerald-400">Tổng số lượng bán</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {productSummary.totalQty.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
          <p className="text-[11px] font-bold uppercase text-purple-400">Tổng doanh thu</p>
          <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-400">
            {formatCurrency(productSummary.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top by quantity */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-[#b3b3b3]">Top 10 bán chạy theo số lượng</h3>
          <div className="space-y-2">
            {productTopByQty.map((p, i) => (
              <div key={p.sku} className="flex items-center gap-3">
                <span className="w-5 text-center text-[11px] font-bold text-slate-400 dark:text-[#808080]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700 dark:text-[#b3b3b3]">{p.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                    {p.sku} · {p.unit}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-[#272727]">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{
                          width: `${(p.quantity / maxBarValue(productTopByQty, 'quantity')) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-[11px] font-bold text-slate-600 dark:text-[#b3b3b3]">
                      {p.quantity.toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top by revenue */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-[#b3b3b3]">Top 10 doanh thu cao nhất</h3>
          <div className="space-y-2">
            {productTopByRevenue.map((p, i) => (
              <div key={p.sku} className="flex items-center gap-3">
                <span className="w-5 text-center text-[11px] font-bold text-slate-400 dark:text-[#808080]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-700 dark:text-[#b3b3b3]">{p.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#808080]">
                    {p.sku} · {p.unit} · {p.orders} đơn
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-[#272727]">
                      <div
                        className="h-1.5 rounded-full bg-purple-500"
                        style={{
                          width: `${(p.revenue / maxBarValue(productTopByRevenue, 'revenue')) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-28 text-right text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderProductStatsModal;
