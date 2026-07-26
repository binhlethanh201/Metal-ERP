import React, { useState, useMemo } from 'react';
import { useExpenseCategory } from '../hooks/useExpenseCategory';
import Icon from '../../../shared/components/Icon';
import { Filter, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '../../../shared/components/Button';

// Import Các Components đã tách
import ExpenseCategoryStats from '../components/expense/category/ExpenseCategoryStats';
import CreateExpenseCategoryModal from '../components/expense/category/CreateExpenseCategoryModal';
import ExpenseCategoryTable from '../components/expense/category/ExpenseCategoryTable';
import ExpenseCategoryDetailModal from '../components/expense/category/ExpenseCategoryDetailModal';

const ExpenseCategoryManagement = () => {
  const { categories, loading, error, handleCreate, handleUpdate, handleDelete, refetch } =
    useExpenseCategory();

  // Thêm state để quản lý việc đóng mở Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState('');

  // Detail modal
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCategories = useMemo(() => {
    if (statusFilter === 'ALL') return categories;
    const isActive = statusFilter === 'ACTIVE';
    return categories.filter((c) => Number(c.isActive) === (isActive ? 1 : 0));
  }, [categories, statusFilter]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setActionError('');
    try {
      await handleCreate(newName.trim());
      setNewName('');
      setShowCreateModal(false); // Đóng modal khi tạo thành công
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Tạo nhóm chi phí thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const onSaveEdit = async (id, name) => {
    try {
      await handleUpdate(id, name);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Cập nhật nhóm chi phí thất bại.';
      throw new Error(msg);
    }
  };

  const onDelete = async (id) => {
    try {
      await handleDelete(id);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Xóa nhóm chi phí thất bại.';
      const extra = Array.isArray(err?.data?.errors) ? err.data.errors.join(' ') : '';
      throw new Error(`${msg} ${extra}`.trim());
    }
  };

  // ==================== SUMMARY STATS ====================
  const summary = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const vouchers = categories.reduce((sum, c) => sum + (c.voucherCount || 0), 0);
    const pending = categories.reduce((sum, c) => sum + (c.pendingCount || 0), 0);
    return { total, active, vouchers, pending };
  }, [categories]);

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Nhóm Chi Phí</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Quản lý danh mục nhóm chi phí dùng để phân loại phiếu chi tiền.
          </p>
        </div>
        <button
          onClick={() => {
            setActionError('');
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          <Icon name="add" size={20} />
          <span>Tạo nhóm mới</span>
        </button>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <ExpenseCategoryStats summary={summary} />

      {/* ==================== GLOBAL ERROR BANNER ==================== */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <Icon name="error" className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a]/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              <Filter size={14} /> Trạng thái:
            </span>
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'INACTIVE', label: 'Đã ẩn' },
            ].map((item) => {
              const isActive = statusFilter === item.value;
              return (
                <Button
                  key={item.value}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter(item.value); setCurrentPage(1); }}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>

            {statusFilter !== 'ALL' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                className="flex items-center gap-1"
                title="Xóa bộ lọc"
              >
                <RotateCcw size={13} /> Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>

      <ExpenseCategoryTable
        categories={paginatedCategories}
        loading={loading}
        refetch={refetch}
        onClickRow={(cat) => setSelectedCategory(cat)}
      />

      {/* Pagination */}
      {!loading && filteredCategories.length > 0 && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-5 py-3 shadow-sm">
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
              {filteredCategories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredCategories.length)} trong tổng số{' '}
              {filteredCategories.length} nhóm
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

      {/* ==================== MODAL TẠO NHÓM CHI PHÍ ==================== */}
      <CreateExpenseCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newName={newName}
        setNewName={setNewName}
        onCreate={onCreate}
        creating={creating}
        actionError={actionError}
      />

      {/* ==================== MODAL CHI TIẾT NHÓM CHI PHÍ ==================== */}
      <ExpenseCategoryDetailModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSaveEdit={onSaveEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ExpenseCategoryManagement;
