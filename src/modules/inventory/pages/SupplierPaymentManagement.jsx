import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Icon from '../../../shared/components/Icon';
import { Button } from '../../../shared/components/Button';
import { useSupplierPayment } from '../hooks/useSupplierPayment';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getMethodLabel = (method) => {
  switch (method) {
    case 'Cash':
      return 'Tiền mặt';
    case 'Transfer':
      return 'Chuyển khoản';
    case 'Credit':
      return 'Tín dụng';
    default:
      return method;
  }
};

const SupplierPaymentManagement = () => {
  const {
    payments,
    suppliers,
    loading,
    error,
    supplierId,
    setSupplierId,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    fetchActiveSuppliers,
    handleUpdateNote,
    handleCancel,
    refetch,
  } = useSupplierPayment();

  useEffect(() => {
    fetchActiveSuppliers();
  }, [fetchActiveSuppliers]);

  const onCancelClick = async (payment) => {
    if (
      window.confirm(
        `Bạn có chắc muốn HỦY phiếu chi ${formatCurrency(payment.amount)} cho ${payment.supplierName} không? (Sẽ khôi phục dư nợ)`
      )
    ) {
      try {
        await handleCancel(payment.paymentId);
        alert('Đã hủy phiếu chi thành công');
      } catch (err) {
        alert(err.message || 'Lỗi khi hủy phiếu chi');
      }
    }
  };

  const onUpdateNoteClick = async (payment) => {
    const newNote = window.prompt('Nhập ghi chú mới:', payment.note || '');
    if (newNote !== null && newNote !== payment.note) {
      try {
        await handleUpdateNote(payment.paymentId, newNote);
        alert('Đã cập nhật ghi chú');
      } catch (err) {
        alert(err.message || 'Lỗi khi cập nhật ghi chú');
      }
    }
  };

  return (
    <div className="animate-fade-in mt-2 space-y-4">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Lịch sử Thanh toán & Phiếu Chi</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Quản lý các giao dịch chi tiền cho nhà cung cấp, hủy phiếu nếu sai sót.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* ==================== FILTERS ==================== */}
      <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/40 backdrop-blur dark:border-[#2f2f2f] dark:bg-[#090909]/80 dark:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Nhà cung cấp
            </label>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#6b6b6b]" />
              <select
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#333] dark:bg-[#111111] dark:text-[#e5e5e5] dark:focus:border-blue-400 dark:focus:ring-blue-950/40"
              >
                <option value="">Tất cả nhà cung cấp</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={refetch}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333] dark:bg-[#0f0f0f]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-[#333] dark:bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Ngày chi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Hình thức</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Tham chiếu</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Số tiền (VNĐ)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <td key={i} className="px-4 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="receipt_long" className="h-10 w-10 text-slate-300 dark:text-[#666]" />
                      <p className="font-medium text-slate-500 dark:text-[#999]">Không có dữ liệu</p>
                      <p className="text-sm text-slate-400 dark:text-[#808080]">Thử thay đổi bộ lọc hoặc tạo phiếu chi mới</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.paymentId}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-[#272727] ${p.status === 'CANCELLED' ? 'bg-slate-50 dark:bg-[#1a1a1a] opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-[#e5e5e5]">{p.paymentDate?.split(' ')[0]}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-[#e5e5e5]">{p.supplierName}</div>
                      <div className="max-w-xs truncate text-xs text-slate-500 dark:text-[#999999]">
                        {p.note || '---'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#b3b3b3]">{getMethodLabel(p.paymentMethod)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-[#b3b3b3]">{p.referenceCode || '---'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.status === 'CANCELLED' ? (
                        <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-[#333] dark:text-[#b3b3b3]">
                          ĐÃ HỦY
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          HOÀN TẤT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status !== 'CANCELLED' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onUpdateNoteClick(p)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            title="Sửa ghi chú"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            onClick={() => onCancelClick(p)}
                            className="rounded-lg p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                            title="Hủy phiếu chi"
                          >
                            <Icon name="X" size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && payments.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
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
                onClick={() => setPageNumber((p) => p - 1)}
                disabled={pageNumber <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#272727] disabled:opacity-50"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {pageNumber} / {paginationMeta.totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber >= paginationMeta.totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#272727] disabled:opacity-50"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierPaymentManagement;
