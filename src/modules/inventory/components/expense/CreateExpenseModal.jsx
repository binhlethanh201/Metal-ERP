import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { Save } from 'lucide-react';

const EMPTY_FORM = {
  categoryId: '',
  supplierId: '',
  amount: '',
  reason: '',
  note: '',
};

const CreateExpenseModal = ({ isOpen, onClose, handleCreate, categories, suppliers }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setFormError('');
    }
  }, [isOpen]);

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
      onClose();
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Tạo phiếu chi tiền thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo phiếu chi tiền"
      size="lg"
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-expense-form"
            variant="primary"
            disabled={submitting}
            loading={submitting}
            className="flex items-center gap-2"
          >
            {!submitting && <Save size={18} />}
            {submitting ? 'Đang tạo...' : 'Tạo phiếu chi'}
          </Button>
        </div>
      }
    >
      <form id="create-expense-form" onSubmit={onSubmitCreate} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {formError}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            Nhóm chi phí <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            Nhà cung cấp (nếu có)
          </label>
          <select
            value={form.supplierId}
            onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
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
  );
};

export default CreateExpenseModal;
