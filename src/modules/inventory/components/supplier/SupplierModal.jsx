import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const emptyForm = {
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  taxCode: '',
  groupName: '',
  bankAccount: '',
  bankName: '',
  website: '',
  address: '',
  notes: '',
  status: 1,
};

const SupplierModal = ({ isOpen, mode, supplier, loading, onClose, onSave }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          supplierName: supplier.name || '',
          contactPerson: supplier.contactPerson || '',
          contactPhone: supplier.contactPhone || '',
          contactEmail: supplier.contactEmail || '',
          taxCode: supplier.taxCode || '',
          groupName: supplier.groupName || '',
          bankAccount: supplier.bankAccount || '',
          bankName: supplier.bankName || '',
          website: supplier.website || '',
          address: supplier.address || '',
          notes: supplier.notes || '',
          status: supplier.status === 'inactive' ? 0 : 1,
        });
      } else {
        setFormData(emptyForm);
      }
      setError('');
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'detail') return;

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...formData,
        supplierName: formData.supplierName.trim(),
        status: Number(formData.status),
      };

      if (!payload.supplierName) throw new Error('Tên nhà cung cấp là bắt buộc');

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = mode === 'detail';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'create'
                ? 'Thêm nhà cung cấp'
                : mode === 'edit'
                  ? 'Cập nhật nhà cung cấp'
                  : 'Chi tiết nhà cung cấp'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Đang tải chi tiết...</div>
          ) : (
            <form id="supplierForm" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">
                    Tên nhà cung cấp <span className="text-red-500">*</span>
                  </span>
                  <input
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Người liên hệ</span>
                  <input
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Số điện thoại</span>
                  <input
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Email</span>
                  <input
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Mã số thuế</span>
                  <input
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Nhóm NCC</span>
                  <input
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Số tài khoản</span>
                  <input
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Ngân hàng</span>
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Website</span>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Trạng thái</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                  >
                    <option value={1}>Đang hợp tác</option>
                    <option value={0}>Ngừng hợp tác</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                <span className="mb-1 block">Địa chỉ</span>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </label>

              <label className="mt-4 block text-sm font-medium text-slate-700">
                <span className="mb-1 block">Ghi chú</span>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  rows="3"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </label>
            </form>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="supplierForm"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#0f4c81] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-60"
            >
              {submitting ? (
                'Đang lưu...'
              ) : (
                <>
                  <Icon name="save" size={18} />
                  {mode === 'edit' ? 'Lưu cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierModal;
