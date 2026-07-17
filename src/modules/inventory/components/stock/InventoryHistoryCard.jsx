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
  searchText = '',
}) => {
  const [cancellingTicket, setCancellingTicket] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const todayString = new Date().toISOString().split('T')[0];

  // Lọc ticket theo từ khoá tìm kiếm
  const kw = searchText.toLowerCase().trim();
  const filteredTickets = kw
    ? tickets.filter((t) => {
        const code = (t.ticketCode || '').toLowerCase();
        const product = (t.productName || '').toLowerCase();
        return code.includes(kw) || product.includes(kw);
      })
    : tickets;

  const [filters, setFilters] = useState({
    status: '',
    ticketType: '',
    fromDate: '',
    toDate: '', // Để trống để hiển thị tất cả
    branchId: '',
    pageNumber: 1,
    pageSize: 100,
  });

  // Lọc ticket theo từ khoá tìm kiếm và các filter
  const kw = searchText.toLowerCase().trim();
  let filteredTickets = tickets;

  // Lọc theo từ khóa tìm kiếm
  if (kw) {
    filteredTickets = filteredTickets.filter((t) => {
      const code = (t.ticketCode || '').toLowerCase();
      const product = (t.productName || '').toLowerCase();
      return code.includes(kw) || product.includes(kw);
    });
  }

  // Lọc theo status (client-side filter)
  if (filters.status && filters.status !== 'ALL') {
    const normalizedFilter = filters.status.toUpperCase();
    filteredTickets = filteredTickets.filter((t) => {
      const ticketStatus = (t.status || '').toUpperCase();
      return ticketStatus === normalizedFilter;
    });
  }

  // Lọc theo ngày
  if (filters.fromDate) {
    const fromDateStr = filters.fromDate;
    filteredTickets = filteredTickets.filter((t) => {
      const ticketDate = t.date || t.createdAt;
      if (!ticketDate) return false;
      return ticketDate >= fromDateStr;
    });
  }
  if (filters.toDate) {
    const toDateStr = filters.toDate;
    filteredTickets = filteredTickets.filter((t) => {
      const ticketDate = t.date || t.createdAt;
      if (!ticketDate) return false;
      return ticketDate <= toDateStr;
    });
  }

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
      toDate: '', // Để trống để hiển thị tất cả
      branchId: '',
      pageNumber: 1,
      pageSize: 20,
    };
    setFilters(defaultFilters);
    setCurrentPage(1); // Reset về trang 1
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
      width: '140px',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setViewingId(row.stockTicketId || row.id)}
          className="font-bold text-[#004785] hover:underline"
          title="Click để xem chi tiết & biến động kho"
        >
          {row.ticketCode || row.id}
        </button>
      ),
    },
    {
      key: 'date',
      header: 'Ngày tạo',
      width: '110px',
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
      header: 'Sản phẩm',
      width: '1fr',
      render: (_, row) => (
        <div>
          <span className="font-medium text-slate-700">
            {row.productName || row.reason || 'Không có ghi chú'}
          </span>
          {row.cancelReason && (
            <div className="mt-0.5 text-xs italic text-rose-600">Lý do hủy: {row.cancelReason}</div>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      width: '100px',
      align: 'right',
      render: (val) => (
        <span className="font-semibold text-slate-900">
          {val != null ? Number(val).toLocaleString('vi-VN') : '---'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '130px',
      align: 'center',
      render: (val) => renderStatusBadge(val),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '140px',
      align: 'right',
      render: (_, row) => {
        const isCancelled = row.status?.toUpperCase() === 'CANCELLED';
        const isPending = row.status?.toUpperCase() === 'PENDING';
        const currentId = row.stockTicketId || row.id;
        const isConfirming = confirmingId === currentId;

        return (
          <div className="flex items-center justify-end gap-1">
            {isPending && (
              <Button
                variant="primary"
                size="sm"
                disabled={isConfirming}
                onClick={() => handleConfirmTicket(row)}
                title="Xác nhận duyệt để cộng/trừ kho thực tế"
                className="flex items-center gap-1 whitespace-nowrap !px-2.5 !py-1 !text-[11px]"
              >
                <CheckCheck size={12} /> {isConfirming ? 'Đang duyệt...' : 'Duyệt'}
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004785]/5">
            <svg
              className="h-5 w-5 text-[#004785]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              Tổng số: <span className="font-semibold text-slate-700">{tickets.length}</span> phiếu
              {kw && (
                <span className="ml-1 text-amber-600">(hiển thị {filteredTickets.length})</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm mã phiếu, sản phẩm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-[#004785] focus:outline-none"
            />
          </div>
          {onReload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilter}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-100 bg-slate-50/30 px-5 py-3">
        <InventoryFilterBar
          type={type}
          filters={filters}
          onChangeFilter={handleChangeFilter}
          onResetFilter={handleResetFilter}
          branches={branches}
        />
      </div>

      {/* Table */}
      <div className="px-0">
        <Table
          columns={columns}
          data={paginatedTickets}
          loading={isLoading}
          emptyMessage="Chưa có phiếu nào trong hệ thống"
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages} ({totalItems} phiếu)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded border border-slate-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`rounded border px-3 py-1 text-sm ${
                      currentPage === pageNum
                        ? 'border-[#004785] bg-[#004785] text-white'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded border border-slate-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
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
