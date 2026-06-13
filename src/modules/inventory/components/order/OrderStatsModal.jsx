import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';

const OrderStatsModal = ({ isOpen, onClose, stats }) => {
  const {
    orderSummary,
    ordersByStatus,
    ordersByChannel,
    ordersByPartner,
    topCustomers,
    dailyRevenue,
    STATUS_COLORS,
    CHANNEL_COLORS,
    formatCurrency,
  } = stats;

  const maxRevDaily = Math.max(...dailyRevenue.map((d) => d.revenue), 1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thống kê theo đơn hàng"
      size="5xl"
      footer={
        <div className="flex w-full justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <p className="text-[10px] font-bold uppercase text-blue-400">Tổng đơn hàng</p>
          <p className="mt-0.5 text-xl font-bold text-blue-700">
            {orderSummary.total.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-400">Doanh thu</p>
          <p className="mt-0.5 text-xl font-bold text-emerald-700">
            {formatCurrency(orderSummary.totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
          <p className="text-[10px] font-bold uppercase text-amber-400">Giá trị TB / đơn</p>
          <p className="mt-0.5 text-xl font-bold text-amber-700">
            {formatCurrency(orderSummary.avgValue)}
          </p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3">
          <p className="text-[10px] font-bold uppercase text-purple-400">Tổng phí GH thu</p>
          <p className="mt-0.5 text-xl font-bold text-purple-700">
            {formatCurrency(orderSummary.totalShippingCustomer)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: Status + Channel */}
        <div className="space-y-5">
          {/* Orders by Status */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Theo trạng thái</h3>
            <div className="space-y-1.5">
              {ordersByStatus.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-20 truncate text-[11px] text-slate-600">{s.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${STATUS_COLORS[s.label] || 'bg-slate-400'}`}
                      style={{ width: `${(s.count / orderSummary.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orders by Channel */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Theo kênh bán</h3>
            <div className="space-y-1.5">
              {ordersByChannel.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="w-20 truncate text-[11px] text-slate-600">{c.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${CHANNEL_COLORS[c.label] || 'bg-slate-400'}`}
                      style={{ width: `${(c.count / orderSummary.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle column: Daily Revenue */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Doanh thu theo ngày</h3>
          <div className="space-y-1" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {dailyRevenue.map((d) => (
              <div key={d.date} className="flex items-center gap-2">
                <span className="w-[72px] text-[10px] text-slate-400">{d.date.slice(5)}</span>
                <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{ width: `${(d.revenue / maxRevDaily) * 100}%` }}
                  />
                </div>
                <span className="w-[72px] text-right text-[10px] font-medium text-slate-600">
                  {formatCurrency(d.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Top Customers + Partners */}
        <div className="space-y-5">
          {/* Top Customers */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Top khách hàng</h3>
            <div className="space-y-1.5">
              {topCustomers.slice(0, 8).map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-4 text-center text-[10px] font-bold text-slate-300">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-[11px] text-slate-600">{c.name}</span>
                  <span className="text-[11px] font-medium text-slate-500">{c.count} đơn</span>
                  <span className="w-24 text-right text-[11px] font-bold text-[#004785]">
                    {formatCurrency(c.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Partners */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Đơn vị vận chuyển</h3>
            <div className="space-y-1.5">
              {ordersByPartner.map((p) => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="flex-1 truncate text-[11px] text-slate-600">{p.label}</span>
                  <div className="h-1.5 w-20 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-slate-500"
                      style={{ width: `${(p.count / orderSummary.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-slate-600">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderStatsModal;
