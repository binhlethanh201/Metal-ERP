import React, { useState, useMemo } from 'react';
import { useExpenseCategory } from '../hooks/useExpenseCategory';
import Icon from '../../../shared/components/Icon';

// Import Các Components đã tách
import ExpenseCategoryStats from '../components/expense/category/ExpenseCategoryStats';
import CreateExpenseCategoryModal from '../components/expense/category/CreateExpenseCategoryModal';
import ExpenseCategoryTable from '../components/expense/category/ExpenseCategoryTable';

const ExpenseCategoryManagement = () => {
  const { categories, loading, error, handleCreate, handleUpdate, handleDelete, refetch } =
    useExpenseCategory();

  // Thêm state để quản lý việc đóng mở Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [actionError, setActionError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = Math.ceil(categories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return categories.slice(start, start + pageSize);
  }, [categories, currentPage, pageSize]);

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

  const startEdit = (category) => {
    setEditingId(category.categoryId);
    setEditingName(category.categoryName);
    setActionError('');
  };

  const onSaveEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await handleUpdate(id, editingName.trim());
      setEditingId(null);
    } catch (err) {
      setActionError(err?.data?.message || err?.message || 'Cập nhật nhóm chi phí thất bại.');
    }
  };

  const onDeleteClick = async (category) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa nhóm chi phí "${category.categoryName}"? (Chỉ xóa được khi không còn phiếu PENDING nào dùng nhóm này)`
      )
    ) {
      return;
    }
    try {
      await handleDelete(category.categoryId);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Xóa nhóm chi phí thất bại.';
      const extra = Array.isArray(err?.data?.errors) ? err.data.errors.join(' ') : '';
      alert(`${msg} ${extra}`.trim());
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
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhóm Chi Phí</h1>
          <p className="mt-1 text-gray-600">
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
      {(error || (actionError && !showCreateModal)) && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <Icon name="error" className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error || actionError}</p>
          </div>
        </div>
      )}

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <ExpenseCategoryTable
        categories={paginatedCategories}
        loading={loading}
        refetch={refetch}
        editingId={editingId}
        editingName={editingName}
        setEditingName={setEditingName}
        setEditingId={setEditingId}
        onSaveEdit={onSaveEdit}
        startEdit={startEdit}
        onDeleteClick={onDeleteClick}
      />

      {/* Pagination */}
      {!loading && categories.length > 0 && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
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
              {categories.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, categories.length)} trong tổng số{' '}
              {categories.length} nhóm
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
    </div>
  );
};

export default ExpenseCategoryManagement;
