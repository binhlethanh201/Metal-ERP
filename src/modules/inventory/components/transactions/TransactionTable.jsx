import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Printer,
  Edit,
  Trash2,
  Package,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { TransactionTypeBadge } from './TransactionTypeBadge';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row">
      <div className="text-sm text-slate-600">
        Hiển thị <span className="font-medium">{startItem}</span> -{' '}
        <span className="font-medium">{endItem}</span> của{' '}
        <span className="font-medium">{totalItems}</span> phiếu
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const TransactionTable = ({
  data,
  loading = false,
  onViewDetail,
  onPrint,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const columns = [
    { key: 'type', label: 'Loại', width: 'w-28' },
    { key: 'ticketCode', label: 'Mã phiếu', width: 'w-32' },
    { key: 'createdAt', label: 'Ngày tạo', width: 'w-36' },
    { key: 'partyName', label: 'Nhà cung cấp / Khách hàng', width: 'flex-1' },
    { key: 'itemCount', label: 'Số mặt hàng', width: 'w-24', align: 'text-center' },
    { key: 'totalQuantity', label: 'Tổng SL', width: 'w-24', align: 'text-right' },
    { key: 'totalAmount', label: 'Tổng tiền', width: 'w-32', align: 'text-right' },
    { key: 'createdByName', label: 'Người tạo', width: 'w-28' },
    { key: 'status', label: 'Trạng thái', width: 'w-32' },
    { key: 'actions', label: 'Thao tác', width: 'w-32', align: 'text-center' },
  ];

  const emptyRows = 8;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-slate-600 ${col.width} ${col.align || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-4 ${col.align || ''}`}>
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-slate-100 p-4">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Không có dữ liệu</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Thử thay đổi bộ lọc hoặc tạo phiếu mới
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {data.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                    onClick={() => onViewDetail?.(row)}
                  >
                    <td className="px-4 py-3">
                      <TransactionTypeBadge type={row.type} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {row.ticketCode || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.partyName || '-'}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{row.itemCount || 0}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {Number(row.totalQuantity || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.createdByName || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewDetail?.(row)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onPrint?.(row)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title="In phiếu"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit?.(row)}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {row.status !== 'COMPLETED' && row.status !== 'APPROVED' && (
                          <button
                            onClick={() => onDelete?.(row)}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Empty rows for consistent height */}
                {data.length < emptyRows &&
                  Array.from({ length: emptyRows - data.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="border-b border-slate-100">
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-3 ${col.align || ''}`}>
                          &nbsp;
                        </td>
                      ))}
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="border-t border-slate-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
