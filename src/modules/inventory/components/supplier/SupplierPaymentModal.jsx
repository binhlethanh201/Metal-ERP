import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const emptyForm = {
  supplierId: '',
  amount: '',
  paymentMethod: 'Transfer',
  referenceCode: '',
  note: '',
};

const SupplierPaymentModal = ({ isOpen, onClose, onSave, suppliers }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (!payload.supplierId) throw new Error('Vui lòng chọn nhà cung cấp');
      if (payload.amount <= 0) throw new Error('Số tiền thanh toán phải lớn hơn 0');

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err?.data?.message || err.message || 'Lỗi khi tạo phiếu chi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="payments" className="text-orange-500" />
            Lập Phiếu Chi Tiền
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:text-[#808080] dark:hover:bg-[#333333] dark:hover:text-[#b3b3b3]"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/50 p-6 dark:bg-[#0f0f0f]/50">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            <span className="mb-1 block">
              Nhà cung cấp <span className="text-red-500">*</span>
            </span>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              required
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.contactPhone}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              <span className="mb-1 block">
                Số tiền (VNĐ) <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                name="amount"
                min="1"
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
                placeholder="VD: 5000000"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              <span className="mb-1 block">
                Phương thức <span className="text-red-500">*</span>
              </span>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              >
                <option value="Transfer">Chuyển khoản</option>
                <option value="Cash">Tiền mặt</option>
                <option value="Credit">Tín dụng</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            <span className="mb-1 block">Mã giao dịch / Tham chiếu</span>
            <input
              type="text"
              name="referenceCode"
              value={formData.referenceCode}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              placeholder="VD: UNC123456 hoặc Mã đối soát NH"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
            <span className="mb-1 block">Lý do / Ghi chú</span>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 dark:border-[#404040] dark:bg-[#272727] dark:text-[#e5e5e5]"
              placeholder="Ghi chú thêm về khoản thanh toán này..."
            />
          </label>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3] dark:hover:bg-[#404040]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? 'Đang xử lý...' : 'Xác nhận Chi Tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierPaymentModal;
