import React from 'react';
import { Table } from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';
import { Button } from '../../../../shared/components/Button';
import IconButton from '../../../../shared/components/IconButton';
import { Eye, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const renderStatusBadge = (val) => {
  switch (val) {
    case 'PENDING':
      return (
        <Badge variant="warning" size="sm" className="inline-flex items-center gap-1">
          <Clock size={12} className="animate-pulse" /> CHỜ XÁC NHẬN
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
          <CheckCircle2 size={12} /> ĐÃ XÁC NHẬN
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" size="sm" className="inline-flex items-center gap-1">
          <XCircle size={12} /> ĐÃ HỦY
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm" className="inline-flex items-center gap-1">
          {val}
        </Badge>
      );
  }
};

const ExpenseTable = ({
  vouchers,
  loading,
  paginationMeta,
  pageNumber,
  setPageNumber,
  pageSize,
  setPageSize,
  onViewDetail,
}) => {
  const tableColumns = [
    {
      key: 'voucherCode',
      header: 'Mã phiếu',
      render: (val) => <span className="font-mono text-xs font-bold text-[#004785]">{val}</span>,
    },
    { key: 'categoryName', header: 'Nhóm chi phí' },
    { key: 'supplierName', header: 'Nhà cung cấp', render: (val) => val || '---' },
    {
      key: 'reason',
      header: 'Lý do',
      render: (_, v) => (
        <div>
          <div className="max-w-xs truncate font-medium text-slate-800">{v.reason}</div>
          {v.note && <div className="max-w-xs truncate text-xs text-slate-500">{v.note}</div>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: <div className="text-right">Số tiền (VNĐ)</div>,
      render: (val) => (
        <div className="text-right text-base font-bold text-emerald-600">{formatCurrency(val)}</div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (val) => (
        <span className="text-xs text-slate-500">
          {val ? new Date(val).toLocaleDateString('vi-VN') : '---'}
        </span>
      ),
    },
    {
      key: 'status',
      header: <div className="text-center">Trạng thái</div>,
      render: (val) => <div className="flex justify-center">{renderStatusBadge(val)}</div>,
    },
    {
      key: 'actions',
      header: <div className="text-center">Thao tác</div>,
      render: (_, v) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetail(v)}
            className="flex items-center gap-1 !border-none !bg-blue-50 text-blue-600 hover:!bg-blue-100"
            title="Xem chi tiết"
          >
            <Eye size={14} /> Xem
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={tableColumns}
        data={vouchers}
        loading={loading}
        emptyMessage="Không tìm thấy phiếu chi tiền nào"
      />

      {!loading && paginationMeta?.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>
              {(pageNumber - 1) * pageSize + 1} -{' '}
              {Math.min(pageNumber * pageSize, paginationMeta.totalCount)} /{' '}
              {paginationMeta.totalCount} phiếu
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={ChevronLeft}
              size="sm"
              variant="outline"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
            />
            <span className="px-3 text-sm font-semibold">
              Trang {pageNumber} / {paginationMeta.totalPages}
            </span>
            <IconButton
              icon={ChevronRight}
              size="sm"
              variant="outline"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= paginationMeta.totalPages}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseTable;
