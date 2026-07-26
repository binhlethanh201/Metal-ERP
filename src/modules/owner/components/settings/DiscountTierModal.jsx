import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';

/**
 * Modal thêm/sửa mức chiết khấu
 */
const DiscountTierModal = ({ isOpen, onClose, tier, onSave, loading, onDelete }) => {
  const isEdit = !!tier;
  const [formData, setFormData] = useState({
    minOrderValue: '',
    discountPercent: '',
  });
  const [errors, setErrors] = useState({});

  // Reset form khi mở modal hoặc tier thay đổi
  useEffect(() => {
    if (isOpen) {
      if (tier) {
        setFormData({
          minOrderValue: tier.minOrderValue?.toString() || '',
          discountPercent: tier.discountPercent?.toString() || '',
        });
      } else {
        setFormData({
          minOrderValue: '',
          discountPercent: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, tier]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi user sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate minOrderValue
    const minValue = parseFloat(formData.minOrderValue);
    if (!formData.minOrderValue || isNaN(minValue)) {
      newErrors.minOrderValue = 'Vui lòng nhập giá trị hợp lệ';
    } else if (minValue < 0) {
      newErrors.minOrderValue = 'Giá trị không được âm';
    }

    // Validate discountPercent
    const discount = parseFloat(formData.discountPercent);
    if (!formData.discountPercent || isNaN(discount)) {
      newErrors.discountPercent = 'Vui lòng nhập phần trăm chiết khấu hợp lệ';
    } else if (discount < 0 || discount > 100) {
      newErrors.discountPercent = 'Chiết khấu phải từ 0% đến 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      minOrderValue: parseFloat(formData.minOrderValue),
      discountPercent: parseFloat(formData.discountPercent),
      isActive: tier?.isActive ?? true,
    };

    try {
      await onSave(payload);
    } catch (err) {
      // Error đã được handle trong hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa mức chiết khấu' : 'Thêm mức chiết khấu mới'}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {isEdit && (
              <Button
                variant="outline"
                className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                onClick={() => { onDelete?.(tier); onClose(); }}
                disabled={loading}
              >
                Xóa
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={loading}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <p className="font-medium">💡 Quy tắc chiết khấu:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Khi tổng giá trị đơn hàng đạt ngưỡng, chiết khấu tương ứng sẽ được áp dụng</li>
            <li>Có thể tạo nhiều mức chiết khấu cho các ngưỡng giá trị khác nhau</li>
          </ul>
        </div>

        <Input
          label="Tổng giá trị đơn hàng tối thiểu"
          placeholder="Ví dụ: 1000000"
          type="number"
          value={formData.minOrderValue}
          onChange={(e) => handleChange('minOrderValue', e.target.value)}
          error={errors.minOrderValue}
          required
          hint="Đơn hàng từ giá trị này trở lên sẽ được áp dụng chiết khấu"
        />

        <Input
          label="Phần trăm chiết khấu"
          placeholder="Ví dụ: 5"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={formData.discountPercent}
          onChange={(e) => handleChange('discountPercent', e.target.value)}
          error={errors.discountPercent}
          required
          hint="Phần trăm chiết khấu áp dụng cho đơn hàng (0-100%)"
        />
      </form>
    </Modal>
  );
};

export default DiscountTierModal;
