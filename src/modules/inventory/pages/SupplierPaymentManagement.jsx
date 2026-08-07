import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
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
  const navigate = useNavigate();
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
    // refetch,
  } = useSupplierPayment();

  useEffect(() => {
    fetchActiveSuppliers();
  }, [fetchActiveSuppliers]);

  const onCancelClick = async (payment) => {
    if (
      window.confirm(
        `Bạn có chắc muốn HỦY phiếu thanh toán NCC ${formatCurrency(payment.amount)} cho ${payment.supplierName} không? (Sẽ khôi phục dư nợ)`
      )
    ) {
      try {
        await handleCancel(payment.paymentId);
        alert('Đã hủy phiếu thanh toán NCC thành công');
      } catch (err) {
        alert(err.message || 'Lỗi khi hủy phiếu thanh toán NCC');
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
    <div className="animate-fade-in mt-2 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">
            Phiếu thanh toán NCC
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#b3b3b3]">
            Quản lý các phiếu thanh toán công nợ cho nhà cung cấp, hủy phiếu nếu sai sót.
          </p>
        </div>
        <Button
          onClick={() => navigate('/inventory/supplier-debt')}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Icon name="chevron_left" size={16} /> Công nợ NCC
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <Card padding="p-0" className="overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#1a1a1a]"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setPageNumber(1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-blue-400 dark:hover:text-blue-300"
          >
            Áp dụng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-[#b3b3b3]">
            <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#999999]">
              <tr>
                <th className="px-4 py-3 font-bold">Ngày thanh toán</th>
                <th className="px-4 py-3 font-bold">Nhà cung cấp</th>
                <th className="px-4 py-3 font-bold">Hình thức</th>
                <th className="px-4 py-3 font-bold">Tham chiếu</th>
                <th className="px-4 py-3 text-right font-bold text-emerald-600">Số tiền (VNĐ)</th>
                <th className="px-4 py-3 text-center font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-[#808080]">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-[#808080]">
                    Không tìm thấy giao dịch nào
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.paymentId}
                    className={`transition-colors hover:bg-blue-50/30 ${p.status === 'CANCELLED' ? 'bg-slate-50 opacity-60 dark:bg-[#1a1a1a]' : ''}`}
                  >
                    <td className="px-4 py-4 font-medium">{p.paymentDate?.split(' ')[0]}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800 dark:text-[#e5e5e5]">
                        {p.supplierName}
                      </div>
                      <div className="max-w-xs truncate text-xs text-slate-500 dark:text-[#999999]">
                        {p.note || '---'}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">{getMethodLabel(p.paymentMethod)}</td>
                    <td className="px-4 py-4 font-mono text-xs">{p.referenceCode || '---'}</td>
                    <td className="px-4 py-4 text-right text-base font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {p.status === 'CANCELLED' ? (
                        <span className="rounded bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600 dark:text-[#b3b3b3]">
                          ĐÃ HỦY
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          HOÀN TẤT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {p.status !== 'CANCELLED' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onUpdateNoteClick(p)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-100"
                            title="Sửa ghi chú"
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            onClick={() => onCancelClick(p)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-100"
                            title="Hủy phiếu thanh toán"
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => p - 1)}
              disabled={pageNumber <= 1}
              className="rounded border bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_left" size={18} />
            </button>
            <span className="px-2 text-sm font-semibold">
              {pageNumber} / {paginationMeta.totalPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= paginationMeta.totalPages}
              className="rounded border bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupplierPaymentManagement;
