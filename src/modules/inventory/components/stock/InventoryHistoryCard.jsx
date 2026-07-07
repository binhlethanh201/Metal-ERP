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
import { Badge } from '../../../../shared/components/Badge';
import { Button } from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { Table } from '../../../../shared/components/Table';

const renderStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return (
        <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
          <CheckCircle2 size={12} /> Hoàn tất
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="warning" size="sm" className="inline-flex animate-pulse items-center gap-1">
          <Clock size={12} /> Chờ duyệt kho
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
          <XCircle size={12} /> Đã hủy
        </Badge>
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

  const todayString = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    status: '',
    ticketType: '',
    fromDate: '',
    toDate: todayString,
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
      toDate: todayString,
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
      const errList = error?.data?.errors;
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
      const errList = error?.data?.errors;
      const msg = Array.isArray(errList)
        ? errList.join(', ')
        : error?.message || 'Lỗi khi hủy phiếu';
      onNotify && onNotify({ type: 'error', message: msg });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const columns = [
    {
      key: 'ticketCode',
      header: 'Mã phiếu',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setViewingId(row.stockTicketId || row.id)}
          className="text-left font-bold text-[#004785] hover:underline"
          title="Click để xem chi tiết & biến động kho"
        >
          {row.ticketCode || row.id}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Ngày tạo',
      render: (_, row) => {
        const raw = row.date || row.createdAt;
        if (!raw) return <span className="text-xs text-slate-500">---</span>;
        const iso = raw.endsWith('Z') ? raw : `${raw}Z`;
        return (
          <span className="text-xs text-slate-500">
            {new Date(iso).toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'productName',
      header: 'Sản phẩm / Ghi chú',
      render: (_, row) => (
        <div>
          <div className="font-medium text-slate-700">
            {row.productName || row.reason || 'Không có ghi chú'}
          </div>
          {row.cancelReason && (
            <div className="mt-0.5 text-xs italic text-rose-600">Lý do hủy: {row.cancelReason}</div>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      render: (val) => (
        <span className="block text-right font-semibold text-slate-900">{val ?? '---'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (val) => <span className="flex justify-center">{renderStatusBadge(val)}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, row) => {
        const isCancelled = row.status?.toUpperCase() === 'CANCELLED';
        const isPending = row.status?.toUpperCase() === 'PENDING';
        const currentId = row.stockTicketId || row.id;
        const isConfirming = confirmingId === currentId;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isPending && (
              <Button
                variant="primary"
                size="sm"
                disabled={isConfirming}
                onClick={() => handleConfirmTicket(row)}
                title="Xác nhận duyệt để cộng/trừ kho thực tế"
                className="flex items-center gap-1"
              >
                <CheckCheck size={14} /> {isConfirming ? 'Đang duyệt...' : 'Duyệt phiếu'}
              </Button>
            )}
            <IconButton
              icon={Ban}
              variant="ghost"
              space="customer"
              size="sm"
              disabled={isCancelled || isConfirming}
              onClick={() => setCancellingTicket(row)}
              title={isCancelled ? 'Phiếu đã bị hủy' : 'Hủy phiếu này'}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {onReload && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReload(filters)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </Button>
        )}
      </div>

      <InventoryFilterBar
        type={type}
        filters={filters}
        onChangeFilter={handleChangeFilter}
        onResetFilter={handleResetFilter}
        branches={branches}
      />

      <Table
        columns={columns}
        data={tickets}
        loading={isLoading}
        emptyMessage="Chưa có phiếu nào trong hệ thống"
      />

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
