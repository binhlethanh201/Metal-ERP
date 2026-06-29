import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CreateAccountModal = ({ isOpen, onClose, initialTab, onSave }) => {
  const [accountType, setAccountType] = useState(initialTab || 'owners');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: 'SALES_STAFF',
    subscriptionPlan: 'BASIC',
  });

  // Sync tab khi modal mở
  useEffect(() => {
    if (isOpen) {
      setAccountType(initialTab);
      setFormData((prev) => ({ ...prev, role: 'SALES_STAFF', subscriptionPlan: 'BASIC' }));
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      alert('Vui lòng nhập Tên và Email.');
      return;
    }
    // Validation Staff email domain check
    if (accountType === 'staff' && !formData.email.endsWith('@system.local')) {
      alert('[BR-44] Lỗi: Email nhân viên nội bộ phải có định dạng @system.local');
      return;
    }
    const payload =
      accountType === 'community'
        ? { fullName: formData.fullName, email: formData.email, phoneNumber: formData.phoneNumber }
        : {
            fullName: formData.fullName,
            username: formData.username || formData.email,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            roles: [formData.role],
            subscriptionPlan: formData.subscriptionPlan,
          };
    onSave({ type: accountType, ...payload });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <h3 className="text-base font-bold text-on-surface">Đăng ký Tài khoản mới</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Loại tài khoản
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low p-2.5 text-sm font-semibold text-on-surface outline-none"
            >
              <option value="owners">Partner Owner (Chủ đại lý)</option>
              <option value="staff">System Staff (Nhân sự nội bộ)</option>
              <option value="community">Community User (Người dùng diễn đàn)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Họ & Tên / Tên Shop
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-primary"
                placeholder="Ví dụ: Cửa hàng A"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Email định danh
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-primary"
                placeholder="email@domain.com"
              />
            </div>
          </div>

          {accountType !== 'community' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-primary"
                placeholder="Mặc định lấy theo email nếu bỏ trống"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Số điện thoại
            </label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              type="tel"
              className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none focus:border-primary"
              placeholder="Ví dụ: 0901234567"
            />
          </div>

          {/* Render dynamic fields based on type */}
          {accountType === 'staff' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Role Mapping (Quyền hệ thống)
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none"
              >
                <option value="SALES_STAFF">Nhân viên bán hàng (POS)</option>
                <option value="INVENTORY_CONTROLLER">Thủ kho (Inventory)</option>
              </select>
            </div>
          )}

          {accountType === 'owners' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Gói Subscription (Quota)
              </label>
              <select
                name="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleChange}
                className="w-full rounded-md border border-outline-variant p-2.5 text-sm outline-none"
              >
                <option value="BASIC">Gói Cơ Bản (Basic Tier)</option>
                <option value="PREMIUM">Gói Cao Cấp (Premium Tier)</option>
                <option value="ENTERPRISE">Gói Doanh Nghiệp (Enterprise Tier)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-surface-container-high pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-on-primary-fixed-variant"
            >
              Khởi tạo Tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
