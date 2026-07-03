import { useState } from 'react';
import { Ban, CheckCircle2, Clock, XCircle, RefreshCw, CheckCheck } from 'lucide-react';
import { CancelTicketModal } from './CancelTicketModal';
import {
  cancelInwardInventory,
  cancelOutwardInventory,
  confirmInwardInventory,
  confirmOutwardInventory,
} from '../../services/inventoryService';
import { TicketDetailModal } from './TicketDetailModal';
import { InventoryFilterBar } from './InventoryFilterBar';

const renderStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={12} /> Hoàn tất
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex animate-pulse items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <Clock size={12} /> Chờ duyệt kho
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          <XCircle size={12} /> Đã hủy
        </span>
      );
    default:
      return <span className="text-xs font-medium text-slate-500">{status || 'N/A'}</span>;
  }
};

export const InventoryHistoryCard = ({
  title = 'Lịch sử phiếu',
  type = 'INWARD',
  tickets = [],
  isLoading = false,
  onReload,
  onNotify,
  branches = [],
}) => {
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [viewingId, setViewingId] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    ticketType: '',
    fromDate: '',
    toDate: '',
    branchId: '',
    pageNumber: 1,
    pageSize: 20,
  });

  const handleChangeFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, pageNumber: 1 };
    setFilters(newFilters);
    if (onReload) onReload(newFilters);
  };

  const handleResetFilter = () => {
    const defaultFilters = {
      status: '',
      ticketType: '',
      fromDate: '',
      toDate: '',
      branchId: '',
      pageNumber: 1,
      pageSize: 20,
    };
    setFilters(defaultFilters);
    if (onReload) onReload(defaultFilters);
  };

  const handleConfirmTicket = async (ticket) => {
    const id = ticket.stockTicketId || ticket.id;
    setConfirmingId(id);
    onNotify &&
      onNotify({
        type: 'info',
        message: `Đang kiểm tra và duyệt phiếu ${ticket.ticketCode || id}...`,
      });

    try {
      if (type === 'INWARD') {
        await confirmInwardInventory(id);
      } else {
        await confirmOutwardInventory(id);
      }

      onNotify &&
        onNotify({
          type: 'success',
          message: `Đã duyệt phiếu ${ticket.ticketCode || id}! Tồn kho đã được hạch toán.`,
        });
      if (onReload) onReload();
    } catch (error) {
      const errList = error?.response?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(' | ')
        : error?.message || 'Lỗi khi xác nhận phiếu';
      onNotify && onNotify({ type: 'error', message: msg });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleConfirmCancel = async (reason) => {
    if (!cancellingTicket) return;
    setIsSubmittingCancel(true);

    try {
      const id = cancellingTicket.stockTicketId || cancellingTicket.id;
      if (type === 'INWARD') {
        await cancelInwardInventory(id, reason);
      } else {
        await cancelOutwardInventory(id, reason);
      }

      onNotify &&
        onNotify({
          type: 'success',
          message: `Hủy phiếu ${cancellingTicket.ticketCode || id} thành công!`,
        });

      setCancellingTicket(null);
      if (onReload) onReload();
    } catch (error) {
      const errList = error?.response?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(', ')
        : error?.message || 'Lỗi khi hủy phiếu';
      onNotify && onNotify({ type: 'error', message: msg });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {onReload && (
          <button
            type="button"
            onClick={() => onReload(filters)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        )}
      </div>

      <InventoryFilterBar
        type={type}
        filters={filters}
        onChangeFilter={handleChangeFilter}
        onResetFilter={handleResetFilter}
        branches={branches}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-slate-600">
              <th className="px-3 py-3 font-semibold">Mã phiếu</th>
              <th className="px-3 py-3 font-semibold">Ngày tạo</th>
              <th className="px-3 py-3 font-semibold">Sản phẩm / Ghi chú</th>
              <th className="px-3 py-3 text-right font-semibold">Số lượng</th>
              <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
              <th className="px-3 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Chưa có phiếu nào trong hệ thống
                </td>
              </tr>
            ) : (
              tickets.map((item) => {
                const isCancelled = item.status?.toUpperCase() === 'CANCELLED';
                const isPending = item.status?.toUpperCase() === 'PENDING';
                const currentId = item.stockTicketId || item.id;
                const isConfirming = confirmingId === currentId;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                  >
                    {/* Cột Mã phiếu: Click để mở Modal chi tiết */}
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setViewingId(currentId)}
                        className="text-left font-bold text-sky-600 hover:text-sky-800 hover:underline"
                        title="Click để xem chi tiết & biến động kho"
                      >
                        {item.ticketCode || item.id}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {item.date || item.createdAt
                        ? new Date(item.date || item.createdAt).toLocaleDateString('vi-VN')
                        : '---'}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <div className="font-medium">
                        {item.productName || item.reason || 'Không có ghi chú'}
                      </div>
                      {item.cancelReason && (
                        <div className="mt-0.5 text-xs italic text-rose-600">
                          Lý do hủy: {item.cancelReason}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-900">
                      {item.quantity ?? '---'}
                    </td>
                    <td className="px-3 py-3 text-center">{renderStatusBadge(item.status)}</td>

                    {/* Cột Thao tác: Duyệt nhanh / Hủy */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <button
                            type="button"
                            disabled={isConfirming}
                            onClick={() => handleConfirmTicket(item)}
                            title="Xác nhận duyệt để cộng/trừ kho thực tế"
                            className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                          >
                            <CheckCheck size={14} />
                            {isConfirming ? 'Đang duyệt...' : 'Duyệt phiếu'}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isCancelled || isConfirming}
                          onClick={() => setCancellingTicket(item)}
                          title={isCancelled ? 'Phiếu đã bị hủy' : 'Hủy phiếu này'}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                        >
                          <Ban size={14} /> Hủy
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CancelTicketModal
        isOpen={!!cancellingTicket}
        onClose={() => setCancellingTicket(null)}
        onConfirm={handleConfirmCancel}
        ticketCode={cancellingTicket?.ticketCode || cancellingTicket?.id}
        ticketStatus={cancellingTicket?.status}
        isSubmitting={isSubmittingCancel}
      />

      <TicketDetailModal
        isOpen={!!viewingId}
        onClose={() => setViewingId(null)}
        ticketId={viewingId}
        type={type}
        onReload={onReload}
        onNotify={onNotify}
      />
    </div>
  );
};
