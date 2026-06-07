import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';

const INITIAL = { name: '', phone: '' };

const QuickAddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const handleAdd = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên';
    if (!form.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(form.phone.trim())) errs.phone = 'SĐT không hợp lệ';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: '',
      address: '',
      group: 'Ca nhan',
      notes: '',
      totalSpent: 0,
      orderCount: 0,
      lastVisit: '-',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setForm(INITIAL);
    setErrors({});
    onClose();
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
          <Button variant="primary" onClick={handleAdd} disabled={!form.name || !form.phone}>
            Thêm khách
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Tên khách hàng"
          placeholder="Nháp ten"
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
