import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';

const initialFormState = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  defaultRoleType: 'SalesStaff', // 🌟 Đặt "Nhân viên Bán hàng" làm mặc định
  isActive: 1,
  permissionCodes: [],
};

// 🌟 ĐỊNH NGHĨA CÁC NHÓM QUYỀN VÀ MỐI LIÊN HỆ VỚI ROLE
const PERMISSION_GROUPS = [
  {
    label: 'Quản lý Bán hàng & Thu ngân (POS)',
    prefixes: ['SALE', 'PAYMENT', 'PRINT', 'SHIFT', 'PROMOTION', 'LOYALTY'],
    roles: ['SalesStaff', 'Staff'], // Nhóm này hiển thị cho SalesStaff và Staff (Quản lý)
  },
  {
    label: 'Quản lý Khách hàng',
    prefixes: ['CUSTOMER'],
    roles: ['SalesStaff', 'Staff'],
  },
  {
    label: 'Quản lý Kho & Kiểm kê',
    prefixes: ['STOCK'],
    roles: ['InventoryStaff', 'Staff'], // Nhóm này hiển thị cho InventoryStaff và Staff
  },
  {
    label: 'Quản lý Sản phẩm',
    prefixes: ['PRODUCT'],
    roles: ['InventoryStaff', 'Staff'],
  },
  {
    label: 'Nhà cung cấp & Công nợ',
    prefixes: ['SUPPLIER'],
    roles: ['InventoryStaff', 'Staff'],
  },
  {
    label: 'Hệ thống & Nhân sự',
    prefixes: ['STAFF', 'OWNER', 'SYSTEM', 'REPORT'],
    roles: ['Staff'], // Chỉ Staff (cấp quản lý/admin) mới thấy nhóm này
  },
];

const StaffModal = ({ isOpen, onClose, staff, permissions, onSave }) => {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        setForm({
          ...staff,
          password: '',
          defaultRoleType: staff.roles?.includes('InventoryStaff')
            ? 'InventoryStaff'
            : staff.roles?.includes('Staff')
              ? 'Staff'
              : 'SalesStaff', // Mặc định là Sales nếu không xác định được
          isActive: staff.isActive !== undefined ? staff.isActive : 1,
          permissionCodes: staff.permissionCodes || [],
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

    if (staff && form.permissionCodes.length === 0) {
      if (
        !window.confirm(
          'Bạn không chọn quyền nào. Nhân viên này sẽ mất toàn bộ quyền truy cập. Bạn có chắc chắn?'
        )
      )
        return;
    }

    onSave(form);
  };

  const handleTogglePermission = (code) => {
    setForm((prev) => {
      const current = prev.permissionCodes;
      if (current.includes(code)) {
        return { ...prev, permissionCodes: current.filter((c) => c !== code) };
      } else {
        return { ...prev, permissionCodes: [...current, code] };
      }
    });
  };

  // 🌟 Hàm xử lý khi đổi Role: Reset lại mảng quyền để tránh bị lưu quyền ẩn
  const handleRoleChange = (e) => {
    setForm({
      ...form,
      defaultRoleType: e.target.value,
      permissionCodes: [], // Clear hết các ô đã tick khi đổi chức danh
    });
  };

  // Lọc ra các group được phép hiển thị theo Role đang chọn
  const visibleGroups = PERMISSION_GROUPS.filter((group) =>
    group.roles.includes(form.defaultRoleType)
  );

  const inputCss =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 shadow-sm">
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
          <div className="mb-6 grid grid-cols-2 gap-5">
            {!staff && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: nguyenvan_a"
                  className={inputCss}
                  value={form.username || ''}
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
                value={form.password || ''}
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
                value={form.fullName || ''}
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
                value={form.email || ''}
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

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Vai trò mặc định
              </label>
              <select className={inputCss} value={form.defaultRoleType} onChange={handleRoleChange}>
                <option value="SalesStaff">Nhân viên Bán hàng</option>
                <option value="InventoryStaff">Nhân viên Kho</option>
                <option value="Staff">Quản lý / Admin (Toàn quyền)</option>
              </select>
            </div>

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
          </div>

          {/* 🌟 VÙNG RENDER PHÂN QUYỀN ĐÃ ĐƯỢC CHIA NHÓM VÀ LỌC */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <label className="text-base font-bold text-slate-800">
                <Icon
                  name="vpn_key"
                  size={20}
                  className="mr-2 inline align-text-bottom text-blue-600"
                />
                Tùy chỉnh phân quyền chi tiết
              </label>
              <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                Chế độ xem:{' '}
                {form.defaultRoleType === 'SalesStaff'
                  ? 'Bán hàng'
                  : form.defaultRoleType === 'InventoryStaff'
                    ? 'Kho'
                    : 'Tất cả quyền'}
              </span>
            </div>

            {!permissions || permissions.length === 0 ? (
              <p className="flex items-center gap-2 text-sm italic text-slate-500">
                <Icon name="sync" className="animate-spin" /> Đang tải danh sách quyền...
              </p>
            ) : (
              <div className="space-y-6">
                {visibleGroups.map((group) => {
                  // Lọc ra các permission thuộc về group này dựa trên prefix
                  const groupPerms = permissions.filter((p) =>
                    group.prefixes.some((prefix) => p.permissionCode.startsWith(prefix))
                  );

                  if (groupPerms.length === 0) return null;

                  return (
                    <div key={group.label}>
                      <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-600">
                        {group.label}
                      </h4>
                      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                        {groupPerms.map((perm) => (
                          <label
                            key={perm.permissionId}
                            className="group flex cursor-pointer items-start gap-2.5"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500"
                              checked={form.permissionCodes.includes(perm.permissionCode)}
                              onChange={() => handleTogglePermission(perm.permissionCode)}
                            />
                            <span
                              className="text-sm font-medium text-slate-700 transition-colors group-hover:text-blue-700"
                              title={perm.permissionCode}
                            >
                              {perm.permissionName || perm.permissionCode}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!staff && (
              <p className="mt-4 rounded border border-orange-100 bg-orange-50 p-2 text-xs font-medium text-orange-600">
                <Icon name="info" size={14} className="mr-1 inline align-text-bottom" />
                Lưu ý: Nếu bạn chọn thủ công các quyền ở đây, hệ thống sẽ <b>ghi đè</b> toàn bộ
                quyền mặc định của vai trò đã chọn.
              </p>
            )}
          </div>

          <div className="sticky bottom-0 mt-8 flex justify-end gap-3 border-t border-slate-200 bg-white pb-2 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Icon name="save" size={18} />
              {staff ? 'Lưu cập nhật' : 'Tạo nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
