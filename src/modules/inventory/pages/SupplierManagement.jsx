import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../../shared/hooks/useAuth';
import { hasPermission } from '../../../shared/utils/permissions';
import { useSupplierManager } from '../hooks/useSupplierManager';
import SupplierTable from '../components/supplier/SupplierTable';
import SupplierModal from '../components/supplier/SupplierModal';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const SupplierManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    suppliers,
    loading,
    error,
    setError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    groupOptions,
    summary,
    fetchSupplierDetail,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  } = useSupplierManager();

  // States quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  // eslint-disable-next-line
  const [deletingId, setDeletingId] = useState(null);

  // Permissions
  const canCreateSupplier = hasPermission(user, 'SUPPLIER_CREATE');
  const canUpdateSupplier = hasPermission(user, 'SUPPLIER_UPDATE');
  const canDeleteSupplier = hasPermission(user, 'SUPPLIER_DELETE');
  const canViewPayment = hasPermission(user, 'SUPPLIER_PAYMENT_VIEW') || hasPermission(user, 'SUPPLIER_PAYMENT_CREATE') || hasPermission(user, 'SUPPLIER_PAYMENT_DELETE');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return suppliers.slice(start, start + pageSize);
  }, [suppliers, currentPage, pageSize]);

  const totalPages = Math.ceil(suppliers.length / pageSize) || 1;

  const openModal = async (mode, supplier = null) => {
    setModalMode(mode);
    setError('');
    setIsModalOpen(true);

    if (supplier) {
      setModalLoading(true);
      try {
        const detail = await fetchSupplierDetail(supplier.id);
        setSelectedSupplier(detail);
      } catch (err) {
        setError('Không thể tải chi tiết nhà cung cấp');
      } finally {
        setModalLoading(false);
      }
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleSaveModal = async (payload) => {
    if (modalMode === 'edit' && selectedSupplier) {
      await handleUpdate(selectedSupplier.id, payload);
    } else {
      await handleCreate(payload);
    }
  };

  const onDeleteConfirm = async (supplier) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp ${supplier.name}?`)) return;
    try {
      setDeletingId(supplier.id);
      await handleDelete(supplier.id);
    } catch (err) {
      setError(err?.message || 'Không thể xóa nhà cung cấp');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle hợp tác/ngừng hợp tác — handleToggleStatus đã confirm sẵn trong SupplierTable
  const onToggleStatus = async (supplier, targetStatus) => {
    try {
      await handleToggleStatus(supplier.id, targetStatus);
    } catch (err) {
      setError(
        err?.data?.message || err?.message || 'Không thể cập nhật trạng thái nhà cung cấp.'
      );
    }
  };

  return (
    <div className="animate-fade-in mt-2 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">Quản lý nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#b3b3b3]">
            Theo dõi danh sách nhà cung cấp, thông tin liên hệ và công nợ tổng quan.
          </p>
        </div>

        {/* THAY ĐỔI CỤM NÚT Ở ĐÂY: Thêm nút nhảy sang trang Công nợ */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            disabled={!canViewPayment}
            onClick={() => navigate('/inventory/supplier-debt')}
            className="flex items-center gap-2"
            title={!canViewPayment ? 'Bạn không có quyền xem công nợ' : ''}
          >
            <Icon name="account_balance_wallet" size={18} />
            Sổ Công Nợ
          </Button>
          <Button
            variant="primary"
            disabled={!canCreateSupplier}
            onClick={() => openModal('create')}
            className="flex items-center gap-2"
            title={!canCreateSupplier ? 'Bạn không có quyền thêm nhà cung cấp' : ''}
          >
            <Icon name="add" size={20} />
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card padding="p-4" className="border border-slate-200 dark:border-[#333333]">
          <p className="text-sm font-semibold text-slate-500 dark:text-[#999999]">Tổng nhà cung cấp</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">{suppliers.length}</p>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            Đang hoạt động: {summary.activeSuppliers}
          </p>
        </Card>
        <Card padding="p-4" className="border border-slate-200 dark:border-[#333333]">
          <p className="text-sm font-semibold text-slate-500 dark:text-[#999999]">Tổng công nợ</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">
            {formatCurrency(summary.totalDebt)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-[#999999]">Tổng số tiền cần thanh toán</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <Card header="Danh sách đối tác">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm theo tên, mã, số điện thoại..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 dark:border-[#404040] dark:bg-[#1a1a1a] py-2 pl-10 pr-3 text-sm outline-none focus:border-[#004785] focus:bg-white dark:text-[#e5e5e5] dark:focus:bg-[#1a1a1a]"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={groupFilter}
                onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border border-slate-200 bg-white dark:border-[#404040] dark:bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#b3b3b3] outline-none focus:border-[#004785]"
              >
                <option value="all">Tất cả nhóm</option>
                {groupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border border-slate-200 bg-white dark:border-[#404040] dark:bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#b3b3b3] outline-none focus:border-[#004785]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Ngừng hợp tác</option>
              </select>
            </div>
          </div>

          <SupplierTable
            suppliers={paginatedSuppliers}
            loading={loading}
            onDetail={(s) => openModal('edit', s)}
            onToggleStatus={onToggleStatus}
            canUpdate={canUpdateSupplier}
            canDelete={canDeleteSupplier}
          />

          {/* Pagination */}
          {!loading && suppliers.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] px-2 py-1 text-xs outline-none focus:border-primary"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {suppliers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, suppliers.length)} trong tổng số{' '}
                  {suppliers.length} nhà cung cấp
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 dark:border-[#404040] dark:bg-[#1a1a1a] px-2 py-1 text-slate-600 dark:text-[#b3b3b3] hover:bg-slate-50 dark:hover:bg-[#333333] disabled:opacity-50"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* TRUYỀN JSX VÀO HEADER ĐỂ TẠO NÚT CLICK */}
          <Card
            header={
              <div className="flex w-full items-center justify-between">
                <span>Theo dõi công nợ</span>
                <button
                  disabled={!canViewPayment}
                  onClick={() => navigate('/inventory/supplier-debt')}
                  className="group flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Xem chi tiết
                  <Icon
                    name="arrow_forward"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            }
          >
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {suppliers.map((supplier) => {
                const overpaid = Number(supplier.overpaidAmount || 0);
                return (
                  <div
                    key={supplier.id}
                    className="rounded-xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-3 transition-colors hover:bg-slate-100 dark:hover:bg-[#333333]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-[#e5e5e5]">{supplier.name}</p>
                        <p
                          className={`mt-1 text-sm font-semibold ${overpaid > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700'}`}
                        >
                          {overpaid > 0
                            ? `Trả thừa ${formatCurrency(overpaid)}`
                            : `Nợ: ${formatCurrency(supplier.currentDebt || 0)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <SupplierModal
        isOpen={isModalOpen}
        mode={modalMode}
        supplier={selectedSupplier}
        loading={modalLoading}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={onDeleteConfirm}
        canEdit={canUpdateSupplier}
        canDelete={canDeleteSupplier}
      />
    </div>
  );
};

export default SupplierManagement;
