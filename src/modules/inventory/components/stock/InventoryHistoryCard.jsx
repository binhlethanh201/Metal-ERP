import { useState } from 'react';
import { Ban, CheckCircle2, Clock, XCircle, RefreshCw, CheckCheck } from 'lucide-react';
import Icon from '../../../../shared/components/Icon';
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
          <Clock size={12} /> Chờ duyệt
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
          <XCircle size={12} /> Đã hủy
        </Badge>
      );
    default:
      return <span className="text-xs font-medium text-slate-500 dark:text-[#999999]">{status || 'N/A'}</span>;
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
  const [searchText, setSearchText] = useState('');

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
  const [pageSize, setPageSize] = useState(20);
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
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
        <span className="font-bold text-[#004785] dark:text-blue-300">
          {row.ticketCode || row.id}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Ngày tạo',
      width: '110px',
      render: (_, row) => {
        const raw = row.date || row.createdAt;
        if (!raw) return <span className="text-xs text-slate-500 dark:text-[#999999]">---</span>;
        const iso = raw.endsWith('Z') ? raw : `${raw}Z`;
        return (
          <span className="text-xs text-slate-500 dark:text-[#999999]">
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
          <span className="font-medium text-slate-700 dark:text-[#b3b3b3]">
            {row.productName || row.reason || 'Không có ghi chú'}
          </span>
          {row.cancelReason && (
            <div className="mt-0.5 text-xs italic text-rose-600 dark:text-rose-400">Lý do hủy: {row.cancelReason}</div>
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
        <span className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
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
                onClick={(e) => { e.stopPropagation(); handleConfirmTicket(row); }}
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
              onClick={(e) => { e.stopPropagation(); setCancellingTicket(row); }}
              title={isCancelled ? 'Phiếu đã bị hủy' : 'Hủy phiếu này'}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3 dark:border-b-[#333333] dark:bg-[#0f0f0f]">
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
            <h2 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-[#999999]">
              Tổng số: <span className="font-semibold text-slate-700 dark:text-[#b3b3b3]">{tickets.length}</span> phiếu
              {kw && (
                <span className="ml-1 text-amber-600 dark:text-amber-400">(hiển thị {filteredTickets.length})</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#808080]"
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
              className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
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
              Làm mới
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-100 bg-slate-50/30 px-5 py-3 dark:border-b-[#333333] dark:bg-[#1a1a1a]/30">
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
          onClickRow={(row) => setViewingId(row.stockTicketId || row.id)}
        />

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-t-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                >
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, totalItems)} trong tổng số{' '}
                {totalItems} phiếu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_right" className="text-[18px]" />
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
