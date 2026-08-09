import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import Button from '../../../../shared/components/Button';
import Modal from '../../../../shared/components/Modal';
import Input from '../../../../shared/components/Input';

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

const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// eslint-disable-next-line 
const isValidTaxCode = (code) => /^[0-9]{10,14}$/.test(code);

const validateForm = (data) => {
  const errors = {};
  if (!data.supplierName.trim()) errors.supplierName = 'Tên nhà cung cấp là bắt buộc';
  if (!data.contactPerson.trim()) errors.contactPerson = 'Người liên hệ là bắt buộc';
  if (!data.contactPhone.trim())
    errors.contactPhone = 'Số điện thoại là bắt buộc';
  else if (!isValidPhone(data.contactPhone))
    errors.contactPhone = 'Số điện thoại không đúng định dạng (10 số, bắt đầu 0)';
  if (!data.contactEmail.trim())
    errors.contactEmail = 'Email là bắt buộc';
  else if (!isValidEmail(data.contactEmail))
    errors.contactEmail = 'Email không đúng định dạng';
  if (!data.bankAccount.trim())
    errors.bankAccount = 'Số tài khoản là bắt buộc';
  else if (!/^[0-9]+$/.test(data.bankAccount))
    errors.bankAccount = 'Số tài khoản chỉ được chứa chữ số';
  if (!data.bankName.trim()) errors.bankName = 'Ngân hàng là bắt buộc';
  if (data.website && !/^https?:\/\/.+\..+/.test(data.website))
    errors.website = 'Website phải bắt đầu bằng http:// hoặc https://';
  if (!data.address.trim()) errors.address = 'Địa chỉ là bắt buộc';
  return errors;
};

const SupplierModal = ({ isOpen, mode, supplier, loading, onClose, onSave, onDelete, canEdit = true, canDelete = true }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
      setFieldErrors({});
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'detail') return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        supplierName: formData.supplierName.trim(),
        status: Number(formData.status),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setFieldErrors({ submit: err.message || 'Lỗi khi lưu dữ liệu' });
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = mode === 'detail';

  const footer = (
    <div className="flex items-center justify-between gap-3 w-full">
      <div>
        {supplier && (
          <Button
            variant="danger"
            disabled={!canDelete}
            onClick={() => { onDelete?.(supplier); onClose(); }}
            className="flex items-center gap-1"
            title={!canDelete ? 'Bạn không có quyền xóa nhà cung cấp' : ''}
          >
            <Icon name="delete" size={18} />
            Xóa
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={onClose}>
          {mode === 'detail' ? 'Đóng' : 'Hủy bỏ'}
        </Button>
        {mode !== 'detail' && (
          <Button
            type="submit"
            form="supplierForm"
            variant="primary"
            disabled={submitting || (mode === 'edit' && !canEdit)}
            className="flex items-center gap-2"
            title={mode === 'edit' && !canEdit ? 'Bạn không có quyền sửa nhà cung cấp' : ''}
          >
            {submitting ? (
              'Đang lưu...'
            ) : (
              <>
                <Icon name="save" size={18} />
                {mode === 'edit' ? 'Lưu cập nhật' : 'Tạo mới'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={
        mode === 'create'
          ? 'Thêm nhà cung cấp'
          : mode === 'edit'
            ? 'Cập nhật nhà cung cấp'
            : 'Chi tiết nhà cung cấp'
      }
      footer={footer}
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500 dark:text-[#999999]">Đang tải chi tiết...</div>
      ) : (
        <form id="supplierForm" onSubmit={handleSubmit} className="space-y-4">
          {fieldErrors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400">
              {fieldErrors.submit}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Tên nhà cung cấp"
              required
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.supplierName}
            />
            <Input
              label="Người liên hệ"
              required
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              disabled={isReadOnly}
            />
            <Input
              label="Số điện thoại"
              required
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.contactPhone}
            />
            <Input
              label="Email"
              type="email"
              required
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.contactEmail}
            />
            <Input
              label="Mã số thuế"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.taxCode}
            />
            <Input
              label="Nhóm NCC"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              disabled={isReadOnly}
            />
            <Input
              label="Số tài khoản"
              required
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.bankAccount}
            />
            <Input
              label="Ngân hàng"
              required
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              disabled={isReadOnly}
            />
            <Input
              label="Website"
              name="website"
              placeholder="https://..."
              value={formData.website}
              onChange={handleChange}
              disabled={isReadOnly}
              error={fieldErrors.website}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none disabled:bg-slate-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
              >
                <option value={1}>Đang hợp tác</option>
                <option value={0}>Ngừng hợp tác</option>
              </select>
            </div>
          </div>

          <Input
            label="Địa chỉ"
            required
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={isReadOnly}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isReadOnly}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#004785] disabled:bg-slate-100 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SupplierModal;
