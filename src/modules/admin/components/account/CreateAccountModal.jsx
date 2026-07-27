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
        roleName: '', // 'Owner', 'Sales Staff', 'Inventory Staff', 'Staff'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      roleName,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.roleName) {
      alert('Vui lòng nhập đầy đủ Tên, Email, Mật khẩu và chọn Role.');
      return;
    }
    // Set username = email
    let mappedRoleName = formData.roleName;
    if (mappedRoleName === 'Sales Staff') mappedRoleName = 'SalesStaff';
    if (mappedRoleName === 'Inventory Staff') mappedRoleName = 'InventoryStaff';

    const dataToSave = { ...formData, username: formData.email, roleName: mappedRoleName };
    onSave(dataToSave);
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
              Chọn Loại Tài Khoản <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assignableRoles.map((role) => (
                <label
                  key={role.roleId}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-2 transition-colors ${
                    formData.roleName === role.roleName
                      ? 'border-primary bg-primary-container/20'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="roleName"
                    value={role.roleName}
                    checked={formData.roleName === role.roleName}
                    onChange={() => handleRoleChange(role.roleName)}
                    className="h-4 w-4 text-primary focus:ring-primary"
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
