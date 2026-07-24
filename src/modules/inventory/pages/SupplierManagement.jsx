import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import Icon from '../../../shared/components/Icon';
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
  const navigate = useNavigate(); // KHỞI TẠO ĐIỀU HƯỚNG

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
  } = useSupplierManager();

  // States quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  return (
    <div className="animate-fade-in mt-2 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-600">
            Theo dõi danh sách nhà cung cấp, thông tin liên hệ và công nợ tổng quan.
          </p>
        </div>

        {/* THAY ĐỔI CỤM NÚT Ở ĐÂY: Thêm nút nhảy sang trang Công nợ */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/inventory/supplier-debt')}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Icon name="account_balance_wallet" size={18} />
            Sổ Công Nợ
          </button>
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-black"
          >
            <Icon name="add" size={18} />
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="p-4" className="border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Tổng nhà cung cấp</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{suppliers.length}</p>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            Đang hoạt động: {summary.activeSuppliers}
          </p>
        </Card>
        <Card padding="p-4" className="border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">Tổng công nợ</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(summary.totalDebt)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">Tổng số tiền cần thanh toán</p>
        </Card>
        <Card padding="p-4" className="border border-red-100 bg-red-50/50">
          <p className="text-sm font-semibold text-red-600">Nợ cần ưu tiên</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(summary.overdueDebt)}
          </p>
          <p className="mt-1 text-sm font-medium text-red-500">Đã đến hạn hoặc sắp đến hạn</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <Card header="Danh sách đối tác">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm theo tên, nhóm, số điện thoại..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={groupFilter}
                onChange={(e) => { setGroupFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
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
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
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
            deletingId={deletingId}
            onDetail={(s) => openModal('detail', s)}
            onEdit={(s) => openModal('edit', s)}
            onDelete={onDeleteConfirm}
          />

          {/* Pagination */}
          {!loading && suppliers.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary"
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
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{supplier.name}</p>
                      <p className="mt-1 text-sm font-semibold text-blue-700">
                        Nợ: {formatCurrency(supplier.currentDebt || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
      />
    </div>
  );
};

export default SupplierManagement;
