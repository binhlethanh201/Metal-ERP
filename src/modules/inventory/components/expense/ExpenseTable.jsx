import React from 'react';
import Icon from '../../../../shared/components/Icon';
import { Table } from '../../../../shared/components/Table';
import { Badge } from '../../../../shared/components/Badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

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
      render: (val) => <span className="font-mono text-xs font-bold text-[#004785] dark:text-blue-300">{val}</span>,
    },
    { key: 'categoryName', header: 'Nhóm chi phí' },
    {
      key: 'reason',
      header: 'Lý do',
      render: (_, v) => (
        <div>
          <div className="max-w-xs truncate font-medium text-slate-800 dark:text-[#e5e5e5]">{v.reason}</div>
          {v.note && <div className="max-w-xs truncate text-xs text-slate-500 dark:text-[#999999]">{v.note}</div>}
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
        <span className="text-xs text-slate-500 dark:text-[#999999]">
          {val ? new Date(val).toLocaleDateString('vi-VN') : '---'}
        </span>
      ),
    },
    {
      key: 'status',
      header: <div className="text-center">Trạng thái</div>,
      render: (val) => <div className="flex justify-center">{renderStatusBadge(val)}</div>,
    },
  ];

  return (
    <>
      <Table
        columns={tableColumns}
        data={vouchers}
        loading={loading}
        emptyMessage="Không tìm thấy phiếu chi tiền nào"
        onClickRow={(row) => onViewDetail(row)}
      />

      {!loading && paginationMeta?.totalCount > 0 && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {(pageNumber - 1) * pageSize + 1} -{' '}
              {Math.min(pageNumber * pageSize, paginationMeta.totalCount)} trong tổng số{' '}
              {paginationMeta.totalCount} phiếu
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
              Trang {pageNumber} / {paginationMeta.totalPages || 1}
            </div>
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(paginationMeta.totalPages || 1, p + 1))}
              disabled={pageNumber >= paginationMeta.totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseTable;
