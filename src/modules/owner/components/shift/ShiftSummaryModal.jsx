import React from 'react';
import Modal from '../../../../shared/components/Modal';
import Badge from '../../../../shared/components/Badge';
import { Loader2, Receipt, Wallet, CreditCard, Unlock, Lock } from 'lucide-react';
import formatCurrency from '../../../../shared/utils/formatCurrency';
import { formatDateTime } from '../../../../shared/utils/formatDate';

const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-[#333333]">
    <span className="shrink-0 text-slate-500 dark:text-[#999999]">{label}</span>
    <span className={`text-right font-semibold text-slate-800 dark:text-[#e5e5e5] ${valueClassName}`}>{value}</span>
  </div>
);

const METHOD_LABEL = { Cash: 'Tiền mặt', Transfer: 'Chuyển khoản' };

export const ShiftSummaryModal = ({ open, onClose, summary, loading }) => {
  const variance = summary?.variance;
  const isNeg = typeof variance === 'number' && variance < 0;
  const isZero = variance === 0;

  // ==================== CẤU HÌNH HEADER TITLE ====================
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
          {/* ==================== THÔNG TIN CHUNG ==================== */}
          {/* Nhóm lại theo cụm dọc: Cột 1 cho Thời gian, Cột 2 cho Quỹ đầu/cuối */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
            <div className="flex flex-col">
              <InfoRow label="Bắt đầu ca" value={formatDateTime(summary.startedAt)} />
              <InfoRow
                label="Kết thúc ca"
                value={summary.endedAt ? formatDateTime(summary.endedAt) : 'Đang mở'}
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
            {/* ==================== DOANH THU ==================== */}
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

            {/* ==================== KIỂM QUỸ ==================== */}
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

          {/* ==================== CHI TIẾT THANH TOÁN ==================== */}
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
        </div>
      )}
    </Modal>
  );
};

export default ShiftSummaryModal;
