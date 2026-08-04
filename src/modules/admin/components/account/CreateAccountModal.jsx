import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const CreateAccountModal = ({ isOpen, onClose, onSave, roles, branches }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleIds: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleIds: [],
        branchId: '',
        roleName: '',
        branchName: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRoleChange = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      roleName,
      branchName: '', // Reset when changing role
    }));
    if (errors.roleName) {
      setErrors({ ...errors, roleName: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên.';
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ.';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (formData.phoneNumber && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ.';
    }
    if (!formData.roleName) newErrors.roleName = 'Vui lòng chọn loại tài khoản.';
    
    // Nếu là Owner và không chọn BranchId có sẵn, thì bắt buộc nhập tên cửa hàng
    if (formData.roleName === 'Owner' && !formData.branchId && !formData.branchName?.trim()) {
      newErrors.branchName = 'Vui lòng nhập tên cửa hàng mới cho Chủ cửa hàng này, hoặc chọn một Cửa hàng có sẵn bên dưới.';
    }

    // Nếu không phải Owner, bắt buộc phải chọn BranchId
    if (formData.roleName && formData.roleName !== 'Owner' && formData.roleName !== 'Admin' && !formData.branchId) {
      newErrors.branchId = 'Vui lòng chọn Cửa hàng cho tài khoản này.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Set username = email
    let mappedRoleName = formData.roleName;
    if (mappedRoleName === 'Sales Staff') mappedRoleName = 'SalesStaff';
    if (mappedRoleName === 'Inventory Staff') mappedRoleName = 'InventoryStaff';

    const dataToSave = { ...formData, username: formData.email, roleName: mappedRoleName };
    onSave(dataToSave);
  };

  // Bỏ chặn Staff, chỉ chặn Admin và CommunityUser
  const assignableRoles = roles.filter(
    (r) => 
      r.roleName.toLowerCase() !== 'admin' && 
      r.roleName.toLowerCase() !== 'communityuser'
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
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
                placeholder="VD: Nguyễn Văn A"
              />
              {errors.fullName && <p className="mt-1 text-[10px] text-red-500">{errors.fullName}</p>}
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
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
                placeholder="email@mep.vn"
              />
              {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>}
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
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-[10px] text-red-500">{errors.password}</p>}
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
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
                placeholder="09..."
              />
              {errors.phoneNumber && <p className="mt-1 text-[10px] text-red-500">{errors.phoneNumber}</p>}
            </div>
          </div>

          {formData.roleName === 'Owner' && !formData.branchId && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Tên Cửa Hàng Mới (Nếu tạo Cửa hàng mới) <span className="text-red-600 dark:text-red-500">*</span>
              </label>
              <input
                name="branchName"
                value={formData.branchName || ''}
                onChange={handleChange}
                type="text"
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] ${errors.branchName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
                placeholder="VD: Cửa hàng Kim khí ABC"
              />
              {errors.branchName && <p className="mt-1 text-[10px] text-red-500">{errors.branchName}</p>}
            </div>
          )}

          {formData.roleName && formData.roleName !== 'Admin' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Chọn Cửa Hàng (Nếu đã có) {formData.roleName !== 'Owner' && <span className="text-red-600 dark:text-red-500">*</span>}
              </label>
              <select
                name="branchId"
                value={formData.branchId || ''}
                onChange={handleChange}
                className={`w-full rounded border p-2 text-xs outline-none bg-transparent text-slate-900 dark:text-[#e5e5e5] [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f] ${errors.branchId ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-[#333333] focus:border-[#004785]'}`}
              >
                <option value="">-- Tạo cửa hàng mới (Chỉ áp dụng cho Chủ Cửa Hàng) --</option>
                {(branches || []).map(b => (
                  <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                ))}
              </select>
              {errors.branchId && <p className="mt-1 text-[10px] text-red-500">{errors.branchId}</p>}
            </div>
          )}

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
                      ? 'border-[#004785] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  <input
                    type="radio"
                    name="roleName"
                    value={role.roleName}
                    checked={formData.roleName === role.roleName}
                    onChange={() => handleRoleChange(role.roleName)}
                    className="h-4 w-4 text-[#004785] focus:ring-[#004785]"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-[#e5e5e5]">{role.roleName}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.roleName && <p className="mt-1 text-[10px] text-red-500">{errors.roleName}</p>}

            {formData.roleName === 'Owner' && !formData.branchId && (
              <div className="mt-3 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-100 dark:border-blue-800/30 flex items-start gap-2">
                <Icon name="info" size={16} className="text-[#004785] dark:text-blue-400 mt-0.5" />
                <p className="text-[11px] font-semibold text-[#004785] dark:text-blue-300">
                  Hệ thống sẽ tự động khởi tạo Cửa Hàng <strong>{formData.branchName || 'mới'}</strong> và gán Chủ cửa hàng này làm người quản lý mặc định.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#333333] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-xs font-bold text-slate-500 dark:text-[#999999] transition-colors hover:bg-slate-100 dark:hover:bg-[#272727]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800"
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

