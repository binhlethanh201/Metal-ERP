import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Drawer } from '../../../shared/components/Drawer';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { Input } from '../../../shared/components/Input';
import { Textarea } from '../../../shared/components/Textarea';
import IconButton from '../../../shared/components/IconButton';

import { useExpense } from '../hooks/useExpense';
import { useExpenseCategory } from '../hooks/useExpenseCategory';
import { getSuppliers } from '../services/supplierService';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const STATUS_LABEL = {
  PENDING: { text: 'CHỜ XÁC NHẬN', variant: 'warning' },
  COMPLETED: { text: 'ĐÃ XÁC NHẬN', variant: 'success' },
  CANCELLED: { text: 'ĐÃ HỦY', variant: 'secondary' },
};

const EMPTY_FORM = {
  categoryId: '',
  supplierId: '',
  amount: '',
  reason: '',
  note: '',
};

const ExpenseManagement = () => {
  const {
    vouchers,
    loading,
    error,
    categoryId,
    setCategoryId,
    supplierId,
    setSupplierId,
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
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

  const [suppliers, setSuppliers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchActiveSuppliers = useCallback(async () => {
    try {
      const res = await getSuppliers({ status: 'active', pageNumber: 1, pageSize: 200 });
      const data = res?.data || res;
      setSuppliers(data?.items || []);
    } catch (err) {
      console.error('Không tải được danh sách nhà cung cấp', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveSuppliers();
  }, [fetchActiveSuppliers]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setShowCreateModal(true);
  };

  const onSubmitCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.categoryId) {
      setFormError('Vui lòng chọn nhóm chi phí.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Số tiền phải lớn hơn 0.');
      return;
    }
    if (!form.reason.trim()) {
      setFormError('Vui lòng nhập lý do chi.');
      return;
    }

    setSubmitting(true);
    try {
      await handleCreate({
        categoryId: form.categoryId,
        supplierId: form.supplierId || null,
        amount: Number(form.amount),
        reason: form.reason.trim(),
        note: form.note?.trim() || null,
      });
      setShowCreateModal(false);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Tạo phiếu chi tiền thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmClick = async (voucher) => {
    if (
      window.confirm(
        `Xác nhận phiếu chi ${voucher.voucherCode} - ${formatCurrency(voucher.amount)}?`
      )
    ) {
      try {
        await handleConfirm(voucher.voucherId);
      } catch (err) {
        alert(err?.data?.message || err?.message || 'Xác nhận phiếu chi thất bại.');
      }
    }
  };

  const openCancelModal = (voucher) => {
    setCancelTarget(voucher);
    setCancelReason('');
  };

  const onSubmitCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy.');
      return;
    }
    try {
      await handleCancel(cancelTarget.voucherId, cancelReason.trim());
      setCancelTarget(null);
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Hủy phiếu chi thất bại.');
    }
  };

  // Khai báo cột cho bảng
  const tableColumns = [
    {
      key: 'voucherCode',
      header: 'Mã phiếu',
      render: (val) => <span className="font-mono text-xs font-bold">{val}</span>,
    },
    { key: 'categoryName', header: 'Nhóm chi phí' },
    { key: 'supplierName', header: 'Nhà cung cấp', render: (val) => val || '---' },
    {
      key: 'reason',
      header: 'Lý do',
      render: (_, v) => (
        <div>
          <div className="max-w-xs truncate font-medium text-slate-800">{v.reason}</div>
          {v.note && <div className="max-w-xs truncate text-xs text-slate-500">{v.note}</div>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền (VNĐ)',
      render: (val) => (
        <div className="text-right text-base font-bold text-emerald-600">{formatCurrency(val)}</div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (val) => (val ? new Date(val).toLocaleDateString('vi-VN') : '---'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (val) => {
        const badge = STATUS_LABEL[val] || STATUS_LABEL.PENDING;
        return (
          <div className="text-center">
            <Badge variant={badge.variant}>{badge.text}</Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, v) => (
        <div className="flex justify-end gap-2">
          {v.canConfirm && (
            <button
              onClick={() => onConfirmClick(v)}
              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-100"
              title="Xác nhận phiếu chi"
            >
              <Icon name="check" size={18} />
            </button>
          )}
          {v.canCancel && (
            <button
              onClick={() => openCancelModal(v)}
              className="rounded p-1.5 text-red-600 hover:bg-red-100"
              title="Hủy phiếu chi"
            >
              <Icon name="X" size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in mt-2 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Phiếu Chi Tiền</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý các phiếu chi tiền, xác nhận hoặc hủy theo nhóm chi phí.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2">
          <Icon name="plus" size={18} />
          Tạo phiếu chi
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card padding="p-0" className="overflow-hidden">
        {/* Toolbar điều khiển bộ lọc & Refresh */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
          <Button variant="outline" size="sm" onClick={() => setShowFilterDrawer(true)}>
            <span className="flex items-center gap-2">
              <Icon name="Layers" size={16} /> Bộ lọc
            </span>
          </Button>
          <Button variant="outline" size="sm" onClick={refetch}>
            <span className="flex items-center gap-2">
              <Icon name="RefreshCw" size={16} /> Làm mới
            </span>
          </Button>
        </div>

        {/* Bảng Dữ Liệu */}
        <Table
          columns={tableColumns}
          data={vouchers}
          loading={loading}
          emptyMessage="Không tìm thấy phiếu chi tiền nào"
          className="rounded-none border-none"
        />

        {/* Phân Trang */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>Tổng {paginationMeta.totalCount} phiếu chi</span>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={(props) => <Icon name="chevron_left" {...props} />}
              size="sm"
              variant="outline"
              onClick={() => setPageNumber((p) => p - 1)}
              disabled={pageNumber <= 1}
            />
            <span className="px-2 text-sm font-semibold">
              {pageNumber} / {paginationMeta.totalPages}
            </span>
            <IconButton
              icon={(props) => <Icon name="chevron_right" {...props} />}
              size="sm"
              variant="outline"
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= paginationMeta.totalPages}
            />
          </div>
        </div>
      </Card>

      {/* ============ DRAWER: BỘ LỌC ============ */}
      <Drawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Bộ lọc phiếu chi"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowFilterDrawer(false)}>
              Đóng
            </Button>
            <Button variant="primary" onClick={() => setShowFilterDrawer(false)}>
              Áp dụng
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhóm chi phí</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="">Tất cả nhóm chi phí</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="">Tất cả nhà cung cấp</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="COMPLETED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Từ ngày</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Đến ngày</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPageNumber(1);
              }}
            />
          </div>
        </div>
      </Drawer>

      {/* ============ MODAL: TẠO PHIẾU CHI MỚI ============ */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo phiếu chi tiền"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="create-expense-form"
              variant="primary"
              disabled={submitting}
              loading={submitting}
            >
              Tạo phiếu chi
            </Button>
          </>
        }
      >
        <form id="create-expense-form" onSubmit={onSubmitCreate} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nhóm chi phí <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
              required
            >
              <option value="">-- Chọn nhóm chi phí --</option>
              {categories
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nhà cung cấp (nếu có)
            </label>
            <select
              value={form.supplierId}
              onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785]"
            >
              <option value="">-- Không áp dụng --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Số tiền (VNĐ)"
            type="number"
            min="1"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
          />

          <Input
            label="Lý do chi"
            type="text"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="VD: Thanh toán tiền điện tháng 7/2026"
            required
          />

          <Textarea
            label="Ghi chú"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            rows={2}
          />
        </form>
      </Modal>

      {/* ============ MODAL: HỦY PHIẾU CHI ============ */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Hủy phiếu chi"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Đóng
            </Button>
            <Button type="submit" form="cancel-expense-form" variant="danger">
              Xác nhận hủy
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <>
            <p className="mb-4 text-sm text-slate-600">
              Bạn sắp hủy phiếu <strong>{cancelTarget.voucherCode}</strong> -{' '}
              <strong>{formatCurrency(cancelTarget.amount)}</strong>. Vui lòng nhập lý do hủy.
            </p>
            <form id="cancel-expense-form" onSubmit={onSubmitCancel} className="space-y-4">
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Lý do hủy phiếu..."
                required
              />
            </form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExpenseManagement;
