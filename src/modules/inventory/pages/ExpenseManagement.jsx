import React, { useState, useMemo } from 'react';
import { Button } from '../../../shared/components/Button';
import { Plus, AlertCircle } from 'lucide-react';

import { useExpense } from '../hooks/useExpense';
import { useExpenseCategory } from '../hooks/useExpenseCategory';

// Import Các Components đã tách
import ExpenseStats from '../components/expense/ExpenseStats';
import ExpenseFilterBar from '../components/expense/ExpenseFilterBar';
import ExpenseTable from '../components/expense/ExpenseTable';
import CreateExpenseModal from '../components/expense/CreateExpenseModal';
import ExpenseDetailModal from '../components/expense/ExpenseDetailModal';

const ExpenseManagement = () => {
  const {
    vouchers,
    loading,
    error,
    categoryId,
    setCategoryId,
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sort,
    setSort,
    order,
    setOrder,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    handleCreate,
    handleConfirm,
    handleCancel,
    refetch,
  } = useExpense();

  const { categories } = useExpenseCategory();

  // State quản lý UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // State xử lý Detail Modal & Action
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const summary = useMemo(() => {
    const totalAmount = vouchers.reduce((sum, v) => sum + Number(v.amount || 0), 0);
    const pending = vouchers.filter((v) => v.status === 'PENDING').length;
    const completed = vouchers.filter((v) => v.status === 'COMPLETED').length;
    return {
      totalAmount,
      pending,
      completed,
      totalCount: paginationMeta.totalCount || 0,
    };
  }, [vouchers, paginationMeta.totalCount]);

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e5e5e5]">Phiếu Chi Tiền</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#b3b3b3]">
            Quản lý các phiếu chi tiền, xác nhận hoặc hủy theo nhóm chi phí.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} /> Tạo phiếu chi
        </Button>
      </div>

      {/* STATS CARDS */}
      <ExpenseStats summary={summary} />

      {/* GLOBAL ERROR BANNER */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* FILTERS BAR */}
      <ExpenseFilterBar
        status={status}
        setStatus={setStatus}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        sort={sort}
        setSort={setSort}
        order={order}
        setOrder={setOrder}
        setPageNumber={setPageNumber}
        refetch={refetch}
        loading={loading}
        categories={categories}
        showFilterDrawer={showFilterDrawer}
        setShowFilterDrawer={setShowFilterDrawer}
      />

      {/* BẢNG DANH SÁCH & PHÂN TRANG */}
      <ExpenseTable
        vouchers={vouchers}
        loading={loading}
        paginationMeta={paginationMeta}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onViewDetail={(voucher) => setSelectedVoucher(voucher)}
      />

      {/* MODAL TẠO PHIẾU CHI */}
      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        handleCreate={handleCreate}
        categories={categories}
      />

      {/* MODAL XEM CHI TIẾT (Kèm xử lý Duyệt & Hủy) */}
      <ExpenseDetailModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        selectedVoucher={selectedVoucher}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
    </div>
  );
};

export default ExpenseManagement;
