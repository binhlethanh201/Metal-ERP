import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const initialFormState = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  branchId: '',
  defaultRoleType: 'SalesStaff',
  isActive: 1,
};

const StaffModal = ({ isOpen, onClose, staff, branches, onSave }) => {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        // Logic nhận diện Vai trò: Nếu có mã POS_SALE thì là Sales, ngược lại là Kho
        const isSales = staff.permissionCodes?.includes('POS_SALE');
        setForm({
          ...staff,
          password: '',
          defaultRoleType: isSales ? 'SalesStaff' : 'InventoryStaff',
          isActive: staff.isActive !== undefined ? staff.isActive : 1,
        });
      } else {
        setForm(initialFormState);
      }
    }
  }, [isOpen, staff]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staff && (!form.username || !form.password)) {
      alert('Tên đăng nhập và Mật khẩu là bắt buộc khi tạo mới!');
      return;
    }
    onSave(form);
  };

  const inputCss =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {staff ? 'Cập nhật Nhân viên' : 'Thêm Nhân viên mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-2 grid grid-cols-2 gap-5">
            {!staff && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tên đăng nhập (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: nguyenvan_a"
                  className={inputCss}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mật khẩu <span className="text-red-500">{!staff ? '*' : ''}</span>
                {staff && (
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    (Bỏ trống nếu không đổi)
                  </span>
                )}
              </label>
              <input
                type="password"
                required={!staff}
                placeholder="Nhập mật khẩu..."
                className={inputCss}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                className={inputCss}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="VD: nguyenvana@gmail.com"
                className={inputCss}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="VD: 0912345678"
                className={inputCss}
                value={form.phoneNumber || ''}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            {/* MỞ KHÓA CHO PHÉP ĐỔI VAI TRÒ LÚC SỬA */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Vai trò / Phân quyền
              </label>
              <select
                className={inputCss}
                value={form.defaultRoleType}
                onChange={(e) => setForm({ ...form, defaultRoleType: e.target.value })}
              >
                <option value="SalesStaff">Nhân viên Bán hàng (POS)</option>
                <option value="InventoryStaff">Nhân viên Kho (Quản lý tồn)</option>
              </select>
            </div>

            {/* HIỂN THỊ CẬP NHẬT TRẠNG THÁI LÚC SỬA */}
            {staff && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Trạng thái tài khoản
                </label>
                <select
                  className={inputCss}
                  value={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: Number(e.target.value) })}
                >
                  <option value={1}>Đang hoạt động</option>
                  <option value={0}>Khóa tài khoản</option>
                </select>
              </div>
            )}

            <div className="col-span-2 mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <label className="mb-2 block text-sm font-bold text-blue-900">
                <Icon name="store" size={16} className="mr-1 inline" />
                Gán vào Chi nhánh làm việc
              </label>
              <select
                className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-medium text-blue-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.branchId || ''}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">-- Chưa gán chi nhánh --</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchCode} - {b.branchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {staff ? 'Lưu cập nhật' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
