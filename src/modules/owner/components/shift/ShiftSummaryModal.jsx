import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import Badge from '../../../../shared/components/Badge';
import { Loader2, Receipt, Wallet, CreditCard, Unlock, Lock, User } from 'lucide-react';
import formatCurrency from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';

const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
    <span className="shrink-0 text-slate-500 dark:text-[#999999]">{label}</span>
    <span className={`text-right font-semibold text-slate-800 dark:text-[#e5e5e5] ${valueClassName}`}>{value}</span>
  </div>
);

const METHOD_LABEL = { Cash: 'Tiền mặt', Transfer: 'Chuyển khoản' };

export const ShiftSummaryModal = ({ open, onClose, summary, loading, orders = [], ordersLoading }) => {
  const [expandedSalesUser, setExpandedSalesUser] = useState(null);
  const variance = summary?.variance;
  const isNeg = typeof variance === 'number' && variance < 0;
  const isZero = variance === 0;
  const closerName = summary?.closedByUserName || (summary?.endedAt ? (summary?.openedByUserName || '—') : '—');
  const isForceClose = summary?.closedByUserName && summary?.closedByUserId !== summary?.openedByUserId;

  const modalTitle = (
    <div className="flex flex-col gap-1 pr-10">
      <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
        Chi tiết ca bán: <span className="text-[#004785]">{summary?.shiftCode || '...'}</span>
        {summary &&
          (summary.status === 'OPEN' ? (
            <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
              <Unlock size={12} /> Đang mở
            </Badge>
          ) : (
            <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
              <Lock size={12} /> Đã đóng
            </Badge>
          ))}
      </div>
      {summary?.userName && (
        <div className="text-sm font-normal text-slate-500 dark:text-[#999999]">
          Nhân viên phụ trách: <strong className="text-slate-700 dark:text-[#b3b3b3]">{summary.userName}</strong>
          {isForceClose && (
            <span className="ml-3 text-amber-600">
              (Chốt hộ bởi: <strong>{summary.closedByUserName}</strong>)
            </span>
          )}
        </div>
      )}
      {summary?.forceCloseReason && (
        <div className="mt-1 text-sm text-red-500">
          Lý do chốt hộ: {summary.forceCloseReason}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={loading || !summary ? 'Chi tiết ca bán' : modalTitle}
      size="3xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-[#999999]">
          <Loader2 className="animate-spin text-[#004785]" size={32} />
          <p>Đang tải chi tiết ca bán...</p>
        </div>
      ) : !summary ? (
        <p className="py-10 text-center text-sm italic text-slate-400 dark:text-[#808080]">Không có dữ liệu.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
            <div className="flex flex-col">
              <InfoRow label="Bắt đầu ca" value={formatDateTime(summary.startedAt)} />
              <InfoRow
                label="Kết thúc ca"
                value={summary.endedAt ? formatDateTime(summary.endedAt) : 'Đang mở'}
              />
              <InfoRow label="Người mở ca" value={summary.openedByUserName || '—'} />
              <InfoRow
                label="Người kết thúc"
                value={closerName + (isForceClose ? ' (chốt hộ)' : '')}
              />
            </div>
            <div className="flex flex-col">
              <InfoRow label="Tiền đầu ca" value={formatCurrency(summary.openingBalance)} />
              <InfoRow
                label="Tiền cuối ca (thực tế)"
                value={formatCurrency(summary.closingBalance)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <Receipt size={16} /> Doanh thu ca
              </h4>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
                <InfoRow
                  label="Tổng doanh thu"
                  value={formatCurrency(summary.totalRevenue)}
                  valueClassName="text-[#004785] text-base"
                />
                <InfoRow label="Tổng đơn hàng" value={`${summary.totalOrders} đơn`} />
                <InfoRow label="Số lần hoàn tiền" value={summary.totalRefunds} />
              </div>
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <Wallet size={16} /> Kiểm quỹ tiền mặt
              </h4>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
                <InfoRow label="Tiền mặt dự kiến" value={formatCurrency(summary.expectedCash)} />
                <InfoRow label="Tiền mặt thực tế" value={formatCurrency(summary.actualCash)} />
                <InfoRow
                  label="Chênh lệch"
                  value={`${isNeg ? '' : '+'}${formatCurrency(variance)}`}
                  valueClassName={
                    isZero ? 'text-slate-500' : isNeg ? 'text-red-600' : 'text-emerald-600'
                  }
                />
              </div>
            </div>
          </div>

          {Array.isArray(summary.paymentBreakdown) && summary.paymentBreakdown.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <CreditCard size={16} /> Chi tiết theo phương thức thanh toán
              </h4>
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-[#333333]">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Phương thức</th>
                      <th className="px-4 py-3 text-center font-semibold">Số giao dịch</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-[#333333] dark:bg-[#0f0f0f]">
                    {summary.paymentBreakdown.map((row) => (
                      <tr key={row.method} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-[#272727]/50">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-[#b3b3b3]">
                          {METHOD_LABEL[row.method] || row.method}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 dark:text-[#999999]">{row.count}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-[#e5e5e5]">
                          {formatCurrency(row.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SalesByUser expandable */}
          {Array.isArray(summary.salesByUser) && summary.salesByUser.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                <User size={16} /> Doanh số theo nhân viên
              </h4>
              <div className="space-y-1.5">
                {summary.salesByUser.map((u, idx) => {
                  const isExpanded = expandedSalesUser === u.userName;
                  const userOrders = orders.filter(
                    (o) => (o.cashier || '') === (u.userName || '')
                  );
                  return (
                    <div key={u.userId || idx}>
                      <div
                        onClick={() => setExpandedSalesUser(isExpanded ? null : u.userName)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-[#1a1a1a]/50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-[#b3b3b3]">
                            {u.userName || 'NV #' + (idx + 1)}
                          </span>
                          <svg className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xs text-slate-400">{u.invoiceCount || 0} đơn</span>
                          <span className="text-sm font-bold text-green-600">{formatCurrency(u.totalAmount || 0)}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-1.5 space-y-1 pl-6">
                          {ordersLoading ? (
                            <p className="py-2 text-center text-xs text-slate-400">Đang tải đơn hàng...</p>
                          ) : userOrders.length === 0 ? (
                            <p className="py-2 text-center text-xs text-slate-400">Không có đơn hàng nào</p>
                          ) : (
                            userOrders.map((o) => (
                              <div key={'usr-order-' + o.id} className="flex items-center justify-between rounded bg-white px-3 py-1.5 text-xs dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-semibold text-green-700">Bán</span>
                                  <span className="font-mono text-slate-600 dark:text-[#999999]">{o.invoiceCode}</span>
                                  <span className="text-slate-400">{o.customerName}</span>
                                  {o.paymentMethod && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-[#272727] dark:text-[#999999]">
                                      {o.paymentMethod === 'CASH' || o.paymentMethod === 'Cash' || o.paymentMethod === 'Tiền mặt'
                                        ? 'Tiền mặt'
                                        : o.paymentMethod === 'TRANSFER' || o.paymentMethod === 'Transfer' || o.paymentMethod === 'Chuyển khoản'
                                          ? 'CK'
                                          : o.paymentMethod}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-green-600">+{formatCurrency(o.totalAmount)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ShiftSummaryModal;