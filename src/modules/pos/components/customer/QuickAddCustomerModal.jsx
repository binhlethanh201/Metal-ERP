import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { createCustomer } from '../../services/posService';

const INITIAL = { name: '', phone: '' };

const QuickAddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.phone.trim())) errs.phone = 'SĐT không hợp lệ';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      const result = await createCustomer({
        customerName: form.name.trim(),
        phoneNumber: form.phone.trim(),
      });
      const newCustomerId = result.customerId || result.id;
      if (!newCustomerId) {
        throw new Error('Server không trả về customerId.');
      }
      onAdd({
        id: newCustomerId,
        customerId: newCustomerId,
        name: result.customerName || form.name.trim(),
        phone: result.phoneNumber || form.phone.trim(),
        email: result.email || '',
        address: result.address || '',
        group: result.group || 'Cá nhân',
        notes: result.notes || '',
        totalSpent: parseFloat(result.totalSpent || 0),
        orderCount: parseInt(result.orderCount || 0),
        lastVisit: result.lastVisit || '-',
        createdAt: result.createdAt
          ? new Date(result.createdAt).toLocaleDateString('vi-VN')
          : new Date().toLocaleDateString('vi-VN'),
      });
      setForm(INITIAL);
      setErrors({});
      onClose();
    } catch (err) {
      // KHÔNG fallback local với id=Date.now() — sẽ gây bug F5 mất khách
      // (id giả không tồn tại trong DB, lần sau BE không tìm thấy).
      setApiError(err?.message || 'Không thể tạo khách hàng. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm nhanh khách hàng"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={!form.name || !form.phone || saving}>
            {saving ? 'Đang thêm...' : 'Thêm khách'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}
        <Input
          label="Tên khách hàng"
          placeholder="Nhập tên"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setErrors((p) => ({ ...p, name: '' }));
          }}
          required
          error={errors.name}
        />
        <Input
          label="Số điện thoại"
          placeholder="VD: 0903123456"
          value={form.phone}
          onChange={(e) => {
            setForm((f) => ({ ...f, phone: e.target.value }));
            setErrors((p) => ({ ...p, phone: '' }));
          }}
          required
          error={errors.phone}
          hint="10 số, bắt đầu 03/05/07/08/09"
        />
      </div>
    </Modal>
  );
};

export default QuickAddCustomerModal;
