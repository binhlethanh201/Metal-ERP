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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Thêm Người Dùng Mới</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Họ và Tên <span className="text-red-600 dark:text-red-500">*</span>
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="w-full rounded border border-slate-200 dark:border-[#333333] p-2 text-xs outline-none focus:border-primary"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Email đăng nhập <span className="text-red-600 dark:text-red-500">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded border border-slate-200 dark:border-[#333333] p-2 text-xs outline-none focus:border-primary"
                placeholder="email@mep.vn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Mật khẩu (Tối thiểu 6 ký tự) <span className="text-red-600 dark:text-red-500">*</span>
              </label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                className="w-full rounded border border-slate-200 dark:border-[#333333] p-2 text-xs outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Số điện thoại
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                type="tel"
                className="w-full rounded border border-slate-200 dark:border-[#333333] p-2 text-xs outline-none focus:border-primary"
                placeholder="09..."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Chọn Loại Tài Khoản <span className="text-red-600 dark:text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {assignableRoles.map((role) => (
                <label
                  key={role.roleId}
                  className={`flex cursor-pointer items-center gap-2 rounded border p-2 transition-colors ${
                    formData.roleName === role.roleName
                      ? 'border-primary bg-[#004785] dark:bg-blue-600-container/20'
                      : 'border-slate-200 dark:border-[#333333] hover:bg-slate-50 dark:bg-[#1a1a1a]'
                  }`}
                >
                  <input
                    type="radio"
                    name="roleName"
                    value={role.roleName}
                    checked={formData.roleName === role.roleName}
                    onChange={() => handleRoleChange(role.roleName)}
                    className="h-4 w-4 text-[#004785] dark:text-blue-400 focus:ring-primary"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">{role.roleName}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] transition-colors hover:bg-slate-100 dark:bg-[#272727]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-[#004785] dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#004785] dark:bg-blue-600/90"
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
