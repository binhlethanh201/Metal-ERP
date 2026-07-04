import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // BỔ SUNG IMPORT ĐIỀU HƯỚNG
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import { useSupplierDebt } from '../hooks/useSupplierDebt';
import SupplierDebtDetailModal from '../components/supplier/SupplierDebtDetailModal';
import { useSupplierPayment } from '../hooks/useSupplierPayment';
import SupplierPaymentModal from '../components/supplier/SupplierPaymentModal';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const SupplierDebtManagement = () => {
  const navigate = useNavigate(); // KHỞI TẠO ĐIỀU HƯỚNG

  const {
    debts,
    summary,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    status,
    setStatus,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    fetchDebtDetail,
    handleExport,
    refetch,
  } = useSupplierDebt();

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const openDetail = (id) => {
    setSelectedSupplierId(id);
    setDetailModalOpen(true);
  };

  const {
    fetchActiveSuppliers,
    suppliers: activeSuppliers,
    handleCreate: createPayment,
  } = useSupplierPayment();

  // Tải danh sách NCC để đưa vào dropdown của Modal thanh toán
  useEffect(() => {
    fetchActiveSuppliers();
  }, [fetchActiveSuppliers]);

  const onConfirmPayment = async (payload) => {
    await createPayment(payload);
    alert('Tạo phiếu chi thành công!');
    setPaymentModalOpen(false);
    refetch();
  };

  return (
    <div className="animate-fade-in mt-2 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Công nợ Nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kiểm soát dòng tiền, theo dõi công nợ kỳ này và các khoản nợ quá hạn.
          </p>
        </div>

        {/* BỔ SUNG NÚT "LỊCH SỬ THANH TOÁN" VÀO NHÓM NÚT */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/inventory/supplier-payments')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Icon name="history" size={18} /> Lịch sử Thanh toán
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Icon name="download" size={18} /> Xuất Excel
          </button>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Icon name="payments" size={18} /> Lập Phiếu Chi
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* KPI Cards từ Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card padding="p-4" className="border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Tổng Nợ Cuối Kỳ</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(summary.totalClosingDebt)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Trên {summary.totalSuppliers} nhà cung cấp</p>
        </Card>
        <Card padding="p-4" className="border border-red-100 bg-red-50/40">
          <p className="text-sm font-semibold text-red-600">Nợ Quá Hạn</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalOverdueDebt)}
          </p>
          <p className="mt-1 text-xs text-red-400">Từ {summary.overdueCount} nhà cung cấp</p>
        </Card>
        <Card padding="p-4" className="border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Phát Sinh Mua (Kỳ này)</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {formatCurrency(summary.totalPurchasedInPeriod)}
          </p>
        </Card>
        <Card padding="p-4" className="border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Đã Trả (Kỳ này)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.totalPaidInPeriod)}
          </p>
        </Card>
      </div>

      {/* Toolbar */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex w-72 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-500">
              <Icon name="search" size={18} className="mr-2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm NCC hoặc mã..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="normal">Bình thường</option>
              <option value="overdue">Quá hạn</option>
              <option value="paid">Đã thanh toán hết</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Nhà cung cấp</th>
                <th className="px-4 py-3 text-right font-bold">Nợ Đầu Kỳ</th>
                <th className="px-4 py-3 text-right font-bold">Mua Trong Kỳ</th>
                <th className="px-4 py-3 text-right font-bold text-emerald-600">Đã Trả Kỳ Này</th>
                <th className="px-4 py-3 text-right font-bold text-rose-600">NỢ CUỐI KỲ</th>
                <th className="px-4 py-3 text-center font-bold">Hạn Thanh Toán</th>
                <th className="px-4 py-3 text-center font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không tìm thấy dữ liệu công nợ
                  </td>
                </tr>
              ) : (
                debts.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer transition-colors hover:bg-blue-50/30"
                    onClick={() => openDetail(d.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-blue-700">{d.name}</div>
                      <div className="text-xs text-slate-400">{d.code}</div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatCurrency(d.openingDebt)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatCurrency(d.purchasedInPeriod)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-emerald-600">
                      {formatCurrency(d.paidInPeriod)}
                    </td>
                    <td className="px-4 py-4 text-right text-base font-bold text-rose-600">
                      {formatCurrency(d.closingDebt)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="font-medium">
                        {d.dueDate ? d.dueDate.split('T')[0] : '---'}
                      </div>
                      {d.overdueDays > 0 && (
                        <div className="mt-1 text-xs font-bold text-red-500">
                          Trễ {d.overdueDays} ngày
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {d.status === 'overdue' ? (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                          Quá Hạn
                        </span>
                      ) : d.status === 'paid' ? (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                          Đã Trả Hết
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                          Bình Thường
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Tổng cộng: <strong className="text-slate-800">{paginationMeta.totalCount}</strong>{' '}
              phiếu
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => p - 1)}
              disabled={pageNumber <= 1}
              className="rounded border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <Icon name="chevron_left" size={18} />
            </button>
            <span className="px-2 text-sm font-semibold text-slate-700">
              {pageNumber} / {paginationMeta.totalPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= paginationMeta.totalPages}
              className="rounded border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        </div>
      </Card>

      <SupplierDebtDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        supplierId={selectedSupplierId}
        fetchDetail={fetchDebtDetail}
      />
      <SupplierPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={onConfirmPayment}
        suppliers={activeSuppliers}
      />
    </div>
  );
};

export default SupplierDebtManagement;
