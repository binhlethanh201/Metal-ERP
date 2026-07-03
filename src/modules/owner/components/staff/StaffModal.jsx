import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';

const initialFormState = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  defaultRoleType: 'SalesStaff',
  isActive: 1,
  permissionCodes: [],
};

// Định nghĩa các nhóm quyền chuẩn theo PermissionConstants của Backend
const PERMISSION_GROUPS = [
  {
    label: 'Sale / POS & Thu ngân',
    prefixes: ['SALE_', 'CUSTOMER_', 'LOYALTY_', 'PAYMENT_', 'PRINT_', 'PROMOTION_', 'SHIFT_'],
  },
  {
    label: 'Kho hàng & Kiểm kê (Stock / Inventory)',
    prefixes: ['STOCK_'],
  },
  {
    label: 'Sản phẩm (Product)',
    prefixes: ['PRODUCT_'],
  },
  {
    label: 'Nhà cung cấp & Công nợ (Supplier)',
    prefixes: ['SUPPLIER_'],
  },
  {
    label: 'Nhân sự & Phân quyền (Staff)',
    prefixes: ['STAFF_'],
  },
  {
    label: 'Hệ thống & Báo cáo (System / Owner)',
    prefixes: ['OWNER_', 'SYSTEM_', 'REPORT_'],
  },
];

// Gợi ý bộ quyền chuẩn cho từng Role (Để hỗ trợ người dùng chọn nhanh / biết Role đó có gì)
const DEFAULT_ROLE_PERMISSIONS = {
  SalesStaff: [
    'CUSTOMER_VIEW',
    'CUSTOMER_CREATE',
    'CUSTOMER_UPDATE',
    'SALE_VIEW',
    'SALE_CREATE',
    'SALE_UPDATE',
    'LOYALTY_VIEW',
    'PAYMENT_VIEW',
    'PAYMENT_CREATE',
    'PRINT_VIEW',
    'PROMOTION_VIEW',
    'SHIFT_VIEW',
    'PRODUCT_VIEW',
    'STOCK_VIEW',
  ],
  InventoryStaff: [
    'SUPPLIER_VIEW',
    'SUPPLIER_CREATE',
    'SUPPLIER_UPDATE',
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'STOCK_VIEW',
    'STOCK_INWARD_CREATE',
    'STOCK_INWARD_UPDATE',
    'STOCK_OUTWARD_CREATE',
    'STOCK_OUTWARD_UPDATE',
    'STOCK_CHECK_VIEW',
    'STOCK_CHECK_CREATE',
  ],
  Staff: [], // Cấp quản lý/Toàn quyền -> Thường sẽ chọn tất cả hoặc theo cấu hình hệ thống
};

const StaffModal = ({ isOpen, onClose, staff, permissions = [], onSave }) => {
  const [form, setForm] = useState(initialFormState);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        // Chế độ UPDATE (PUT)
        setForm({
          ...staff,
          password: '',
          defaultRoleType: staff.roles?.includes('InventoryStaff')
            ? 'InventoryStaff'
            : staff.roles?.includes('Staff')
              ? 'Staff'
              : staff.roles?.includes('SalesStaff')
                ? 'SalesStaff'
                : '',
          isActive: staff.isActive !== undefined ? staff.isActive : 1,
          permissionCodes: staff.permissionCodes || [],
        });
        // Khi Update, mặc định coi như đang chỉnh sửa bộ quyền hiện tại của Staff
        setIsCustomizing((staff.permissionCodes || []).length > 0);
      } else {
        // Chế độ CREATE (POST)
        setForm(initialFormState);
        setIsCustomizing(false); // Mặc định để customPermissionCodes rỗng (Backend tự nhận theo Role)
      }
    }
  }, [isOpen, staff]);

  // Phân nhóm permissions tải từ API vào các Group hiển thị UI
  const groupedPermissions = useMemo(() => {
    if (!permissions.length) return [];

    return PERMISSION_GROUPS.map((group) => {
      const items = permissions.filter((p) =>
        group.prefixes.some((prefix) => p.permissionCode.startsWith(prefix))
      );
      return { ...group, items };
    }).filter((g) => g.items.length > 0);
  }, [permissions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staff && (!form.username || !form.password)) {
      alert('Tên đăng nhập và Mật khẩu là bắt buộc khi tạo mới!');
      return;
    }

    // Kiểm tra và xác nhận hành vi của PUT (Full Replace)
    if (staff && isCustomizing && form.permissionCodes.length === 0) {
      if (
        !window.confirm(
          'CẢNH BÁO: Bạn đã bỏ chọn tất cả quyền. Khi lưu, toàn bộ quyền cũ của nhân viên sẽ bị xóa sạch. Tiếp tục?'
        )
      ) {
        return;
      }
    }

    // Chuẩn bị payload nộp lên trang cha
    const submitData = { ...form };
    if (!staff && !isCustomizing && form.defaultRoleType) {
      // Khi Tạo mới và dùng quyền mặc định theo Role -> gửi mảng rỗng để Backend tự động áp dụng
      submitData.permissionCodes = [];
    }

    onSave(submitData);
  };

  const handleTogglePermission = (code) => {
    setIsCustomizing(true);
    setForm((prev) => {
      const current = prev.permissionCodes;
      const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
      return { ...prev, permissionCodes: next };
    });
  };

  // Chọn nhanh toàn bộ quyền mẫu của Role (Để ghi đè thủ công)
  const handleApplyRoleDefaults = () => {
    setIsCustomizing(true);
    if (form.defaultRoleType === 'Staff') {
      // Chọn tất cả quyền khả dụng từ API
      setForm((prev) => ({
        ...prev,
        permissionCodes: permissions.map((p) => p.permissionCode),
      }));
    } else {
      const defaults = DEFAULT_ROLE_PERMISSIONS[form.defaultRoleType] || [];
      const validDefaults = permissions
        .filter((p) => defaults.includes(p.permissionCode))
        .map((p) => p.permissionCode);

      setForm((prev) => ({
        ...prev,
        permissionCodes: validDefaults,
      }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setForm((prev) => ({
      ...prev,
      defaultRoleType: newRole,
      permissionCodes: [],
    }));
    setIsCustomizing(false);
  };

  const inputCss =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500';

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
                  placeholder="VD: nguyenvan_a (Unique)"
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
                placeholder="VD: nguyenvana@gmail.com (Unique)"
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
                placeholder="VD: 0912345678 (Unique nếu có)"
                className={inputCss}
                value={form.phoneNumber || ''}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {staff ? 'Vai trò hiện tại' : 'Vai trò mặc định'}
              </label>
              <select
                className={inputCss}
                value={form.defaultRoleType}
                onChange={handleRoleChange}
                disabled={!!staff} // API PUT không cho đổi Role
              >
                <option value="SalesStaff">Sales Staff (Nhân viên Bán hàng)</option>
                <option value="InventoryStaff">Inventory Staff (Nhân viên Kho)</option>
                <option value="Staff">Staff (Nhân viên)</option>
                {!staff && <option value="">-- Không gán vai trò (Tuỳ chỉnh) --</option>}
              </select>
              {staff && (
                <span className="mt-1 block text-xs italic text-slate-400">
                  * API cập nhật không hỗ trợ đổi chức danh/vai trò.
                </span>
              )}
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
                  <option value={1}>Đang hoạt động (ACTIVE)</option>
                  <option value={0}>Khóa tài khoản (INACTIVE)</option>
                </select>
              </div>
            )}
          </div>

          {/* VÙNG QUẢN LÝ PHÂN QUYỀN (Dựa trên API /available-permissions) */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <label className="text-base font-bold text-slate-800">
                  <Icon
                    name="Key_Icon"
                    size={20}
                    className="mr-2 inline align-text-bottom text-blue-600"
                  />
                  Phân quyền chi tiết
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  {!staff
                    ? 'Chế độ tạo mới: Tùy chỉnh quyền sẽ ghi đè hoàn toàn quyền mặc định của vai trò.'
                    : 'Chế độ cập nhật: Ghi đè bộ quyền hiện tại của nhân viên.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!staff && form.defaultRoleType && (
                  <button
                    type="button"
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                      !isCustomizing
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {!isCustomizing ? '✓ Dùng quyền mặc định' : 'Chuyển sang quyền mặc định'}
                  </button>
                )}

                {(isCustomizing || staff) && form.defaultRoleType && (
                  <button
                    type="button"
                    onClick={handleApplyRoleDefaults}
                    className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    Chọn nhanh mẫu của {form.defaultRoleType}
                  </button>
                )}
              </div>
            </div>

            {!permissions.length ? (
              <p className="flex items-center gap-2 py-4 text-sm italic text-slate-500">
                <Icon name="sync" className="animate-spin" /> Đang tải danh sách quyền từ hệ
                thống...
              </p>
            ) : !isCustomizing && !staff && form.defaultRoleType ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6 text-center">
                <Icon name="verified_user" size={32} className="mx-auto mb-2 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-900">
                  Đang áp dụng bộ quyền tự động cho chức danh [{form.defaultRoleType}]
                </h4>
                <p className="mx-auto mt-1 max-w-lg text-xs text-blue-700">
                  Nhân viên sẽ tự động nhận đầy đủ các quyền chuẩn được thiết lập sẵn trong hệ thống
                  khi khởi tạo.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-800 underline hover:text-black"
                >
                  <Icon name="edit" size={14} /> Tôi muốn tự chọn / ghi đè quyền thủ công
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedPermissions.map((group) => (
                  <div key={group.label}>
                    <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((perm) => {
                        const isChecked = form.permissionCodes.includes(perm.permissionCode);
                        return (
                          <label
                            key={perm.permissionId}
                            className="group flex cursor-pointer items-start gap-2.5 rounded p-1 hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.permissionCode)}
                            />
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-medium transition-colors ${
                                  isChecked
                                    ? 'font-semibold text-blue-700'
                                    : 'text-slate-700 group-hover:text-black'
                                }`}
                              >
                                {perm.permissionName || perm.permissionCode}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                {perm.permissionCode}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
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
