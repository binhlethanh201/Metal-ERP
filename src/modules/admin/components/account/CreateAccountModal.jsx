import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CreateAccountModal = ({ isOpen, onClose, onSave, roles }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleIds: [],
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleIds: [],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      alert('Vui lòng nhập đầy đủ Tên, Email và Mật khẩu.');
      return;
    }
    onSave(formData);
  };

  // Lọc bỏ role Admin ra khỏi danh sách được cấp
  const assignableRoles = roles.filter(
    (r) => r.roleName.toLowerCase() !== 'admin' && r.roleName.toLowerCase() !== 'communityuser'
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <h3 className="text-base font-bold text-on-surface">Thêm Người Dùng Mới</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Họ và Tên <span className="text-error">*</span>
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Email đăng nhập <span className="text-error">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="email@mep.vn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Mật khẩu (Tối thiểu 6 ký tự) <span className="text-error">*</span>
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                Số điện thoại
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                type="tel"
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="09..."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-on-surface-variant">
              Gán Chức vụ (Có thể chọn nhiều)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assignableRoles.map((role) => (
                <label
                  key={role.roleId}
                  className="flex cursor-pointer items-center gap-2 rounded border border-outline-variant p-2 hover:bg-surface-container-low"
                >
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.roleId)}
                    onChange={() => handleRoleToggle(role.roleId)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-xs font-bold text-on-surface">{role.roleName}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-surface-container-high pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90"
            >
              Lưu Người Dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
