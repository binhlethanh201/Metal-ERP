import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import { useAuth } from '../../../shared/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';
import { Button } from '../../../shared/components/Button';
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Còn nợ', label: 'Còn nợ' },
  { value: 'Hết nợ', label: 'Hết nợ' },
];

const SupplierDebtManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canViewSupplier = hasPermission(user, 'SUPPLIER_VIEW');
  const canViewPayment = hasPermission(user, 'SUPPLIER_PAYMENT_VIEW');
  const canCreatePayment = hasPermission(user, 'SUPPLIER_PAYMENT_CREATE');

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
    refetch,
  } = useSupplierDebt();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const openDetail = (id) => {
    setSelectedSupplierId(id);
    setDetailModalOpen(true);
  };

  const {
    fetchActiveSuppliers,
    suppliers: activeSuppliers,
    handleCreate: createPayment,
  } = useSupplierPayment();

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
    <div className="animate-fade-in mt-2 space-y-4">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Công nợ Nhà cung cấp</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Kiểm soát dòng tiền, theo dõi công nợ kỳ này và các khoản nợ quá hạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/inventory/suppliers')}
            variant="secondary"
            size="sm"
            disabled={!canViewSupplier}
            className="flex items-center gap-1.5"
            title={!canViewSupplier ? 'Bạn không có quyền quản lý nhà cung cấp' : ''}
          >
            <Icon name="chevron_left" size={16} /> Quản lý NCC
          </Button>
          <Button
            onClick={() => navigate('/inventory/supplier-payments')}
            variant="outline"
            size="sm"
            disabled={!canViewPayment && !canCreatePayment}
            className="flex items-center gap-1.5"
            title={!canViewPayment && !canCreatePayment ? 'Bạn không có quyền xem lịch sử thanh toán' : ''}
          >
            <Icon name="history" size={16} /> Lịch sử Thanh toán
          </Button>
          <Button
            onClick={() => setPaymentModalOpen(true)}
            disabled={!canCreatePayment}
            title={!canCreatePayment ? 'Bạn không có quyền tạo thanh toán' : ''}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Icon name="payments" size={16} /> Lập Phiếu Chi
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* ==================== KPI CARDS ==================== */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="p-4" className="border border-slate-200 dark:border-[#333]">
          <p className="text-sm font-semibold text-slate-500 dark:text-[#999]">Tổng nợ</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#e5e5e5]">
            {formatCurrency(summary.totalClosingDebt)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Trên {summary.totalSuppliers} nhà cung cấp</p>
        </Card>
        <Card padding="p-4" className="border border-slate-200 dark:border-[#333]">
          <p className="text-sm font-semibold text-slate-500 dark:text-[#999]">Tổng tiền Đã mua</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {formatCurrency(summary.totalPurchasedInPeriod)}
          </p>
        </Card>
        <Card padding="p-4" className="border border-slate-200 dark:border-[#333]">
          <p className="text-sm font-semibold text-slate-500 dark:text-[#999]">Tổng tiền Đã trả</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.totalPaidInPeriod)}
          </p>
        </Card>
      </div>

      {/* ==================== FILTERS + SEARCH ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333] dark:bg-[#1a1a1a]/60">
        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="flex min-w-[300px] flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 dark:border-[#404040] dark:bg-[#1a1a1a]">
            <Search size={16} className="mr-2 text-slate-400 dark:text-[#808080]" />
            <input
              type="text"
              placeholder="Tìm theo tên NCC hoặc mã..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full border-none bg-transparent text-sm outline-none focus:ring-0 dark:text-[#e5e5e5] dark:placeholder:text-[#808080]"
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); setSearchTerm(''); }}
                className="ml-2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:text-[#808080] dark:hover:text-[#b3b3b3]"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999]">
            <Filter size={14} /> Lọc trạng thái:
          </span>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={isActive ? 'primary' : 'outline'}
                size="sm"
                onClick={() => { setStatus(opt.value); setPageNumber(1); }}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333] dark:bg-[#0f0f0f]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-[#333] dark:bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Nhà cung cấp</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Mua</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Đã trả</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Còn nợ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <td key={i} className="px-4 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : debts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="receipt_long" className="h-10 w-10 text-slate-300 dark:text-[#666]" />
                      <p className="font-medium text-slate-500 dark:text-[#999]">Không có dữ liệu</p>
                      <p className="text-sm text-slate-400 dark:text-[#808080]">Thử thay đổi bộ lọc hoặc tạo phiếu chi mới</p>
                    </div>
                  </td>
                </tr>
              ) : (
                debts.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
                    onClick={() => openDetail(d.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-700 dark:text-blue-400">{d.name}</div>
                      <div className="text-xs text-slate-400 dark:text-[#808080]">{d.code}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {formatCurrency(d.purchasedInPeriod)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      {formatCurrency(d.paidInPeriod)}
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-rose-600">
                      {formatCurrency(d.closingDebt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {d.status === 'Quá hạn' ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                          Quá hạn
                        </span>
                      ) : d.status === 'Hết nợ' ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                          Hết nợ
                        </span>
                      ) : d.status === 'Trả thừa' ? (
                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                          Trả thừa
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                          {d.status || 'Còn nợ'}
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
        {!loading && debts.length > 0 && (
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
        debts={debts}
      />
    </div>
  );
};

export default SupplierDebtManagement;
