import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';

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

const PERMISSION_GROUPS = [
  {
    label: 'Sale / POS & Thu ngân',
    prefixes: ['SALE_', 'CUSTOMER_', 'LOYALTY_', 'PAYMENT_', 'PRINT_', 'PROMOTION_', 'SHIFT_'],
  },
  { label: 'Kho hàng & Kiểm kê (Stock / Inventory)', prefixes: ['STOCK_'] },
  { label: 'Sản phẩm (Product)', prefixes: ['PRODUCT_'] },
  { label: 'Nhà cung cấp & Công nợ (Supplier)', prefixes: ['SUPPLIER_'] },
  { label: 'Nhân sự & Phân quyền (Staff)', prefixes: ['STAFF_'] },
  { label: 'Hệ thống & Báo cáo (System / Owner)', prefixes: ['OWNER_', 'SYSTEM_', 'REPORT_'] },
];

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
  Staff: [],
};

const StaffModal = ({ isOpen, onClose, staff, permissions = [], onSave }) => {
  const [form, setForm] = useState(initialFormState);
  const [isCustomizing, setIsCustomizing] = useState(false);

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
              : staff.roles?.includes('SalesStaff')
                ? 'SalesStaff'
                : '',
          isActive: staff.isActive !== undefined ? staff.isActive : 1,
          permissionCodes: staff.permissionCodes || [],
        });
        setIsCustomizing((staff.permissionCodes || []).length > 0);
      } else {
        setForm(initialFormState);
        setIsCustomizing(false);
      }
    }
  }, [isOpen, staff]);

  const groupedPermissions = useMemo(() => {
    if (!permissions.length) return [];
    return PERMISSION_GROUPS.map((group) => {
      const items = permissions.filter((p) =>
        group.prefixes.some((prefix) => p.permissionCode.startsWith(prefix))
      );
      return { ...group, items };
    }).filter((g) => g.items.length > 0);
  }, [permissions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staff && (!form.username || !form.password)) {
      alert('Tên đăng nhập và Mật khẩu là bắt buộc khi tạo mới!');
      return;
    }

    if (staff && isCustomizing && form.permissionCodes.length === 0) {
      if (
        !window.confirm(
          'CẢNH BÁO: Bạn đã bỏ chọn tất cả quyền. Khi lưu, toàn bộ quyền cũ của nhân viên sẽ bị xóa sạch. Tiếp tục?'
        )
      ) {
        return;
      }
    }

    const submitData = { ...form };
    if (!staff && !isCustomizing && form.defaultRoleType) {
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

  const handleApplyRoleDefaults = () => {
    setIsCustomizing(true);
    if (form.defaultRoleType === 'Staff') {
      setForm((prev) => ({
        ...prev,
        permissionCodes: permissions.map((p) => p.permissionCode),
      }));
    } else {
      const defaults = DEFAULT_ROLE_PERMISSIONS[form.defaultRoleType] || [];
      const validDefaults = permissions
        .filter((p) => defaults.includes(p.permissionCode))
        .map((p) => p.permissionCode);
      setForm((prev) => ({ ...prev, permissionCodes: validDefaults }));
    }
  };

  const handleRoleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      defaultRoleType: e.target.value,
      permissionCodes: [],
    }));
    setIsCustomizing(false);
  };

  const selectCss =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#004785] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed';

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Đóng
      </Button>
      <Button variant="primary" type="submit" form="staff-form" className="flex items-center gap-2">
        <Icon name="save" size={18} />
        {staff ? 'Lưu thay đổi' : 'Tạo nhân viên'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div>
          <span className="block">
            {staff ? `Chi tiết nhân viên: ${staff.fullName}` : 'Thêm Nhân viên mới'}
          </span>
          {staff && (
            <span className="mt-1 text-xs font-normal text-slate-500">
              {staff.branchName ? `Chi nhánh: ${staff.branchName} — ` : ''}Bạn có thể kiểm tra và
              chỉnh sửa thông tin hoặc phân quyền trực tiếp tại đây.
            </span>
          )}
        </div>
      }
      footer={modalFooter}
    >
      <form id="staff-form" onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-2 gap-5">
          {!staff && (
            <Input
              label="Tên đăng nhập"
              required
              placeholder="VD: nguyenvan_a (Unique)"
              value={form.username || ''}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          )}

          <Input
            label="Mật khẩu"
            type="password"
            required={!staff}
            hint={staff ? '(Bỏ trống nếu không đổi)' : ''}
            placeholder="Nhập mật khẩu mới nếu muốn đổi..."
            value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Input
            label="Họ và tên"
            required
            placeholder="VD: Nguyễn Văn A"
            value={form.fullName || ''}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="VD: nguyenvana@gmail.com (Unique)"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Số điện thoại"
            placeholder="VD: 0912345678 (Unique nếu có)"
            value={form.phoneNumber || ''}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {staff ? 'Vai trò / Chức danh' : 'Vai trò mặc định'}
            </label>
            <select
              className={selectCss}
              value={form.defaultRoleType}
              onChange={handleRoleChange}
              disabled={!!staff}
            >
              <option value="SalesStaff">Sales Staff (Nhân viên Bán hàng)</option>
              <option value="InventoryStaff">Inventory Staff (Nhân viên Kho)</option>
              <option value="Staff">Staff (Nhân viên)</option>
              {!staff && <option value="">-- Không gán vai trò (Tuỳ chỉnh) --</option>}
            </select>
            {staff && (
              <p className="mt-1 text-xs italic text-slate-400">
                * Hệ thống không hỗ trợ đổi chức danh sau khi tạo. Bạn chỉ có thể sửa quyền bên
                dưới.
              </p>
            )}
          </div>

          {staff && (
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Trạng thái tài khoản
              </label>
              <select
                className={selectCss}
                value={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: Number(e.target.value) })}
              >
                <option value={1}>Đang hoạt động (ACTIVE)</option>
                <option value={0}>Khóa tài khoản (INACTIVE)</option>
              </select>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <label className="text-base font-bold text-slate-800">
                <Icon
                  name="shield"
                  size={20}
                  className="mr-2 inline align-text-bottom text-blue-600"
                />
                Phân quyền chi tiết ({form.permissionCodes.length} quyền đang chọn)
              </label>
              <p className="mt-0.5 text-xs text-slate-500">
                {!staff
                  ? 'Chế độ tạo mới: Tùy chỉnh quyền sẽ ghi đè hoàn toàn quyền mặc định của vai trò.'
                  : 'Chế độ xem & cập nhật: Tích hoặc bỏ tích để cập nhật quyền hạn cho nhân viên.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!staff && form.defaultRoleType && (
                <Button
                  size="sm"
                  variant={!isCustomizing ? 'primary' : 'secondary'}
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  {!isCustomizing ? '✓ Dùng quyền mặc định' : 'Chuyển sang quyền mặc định'}
                </Button>
              )}

              {(isCustomizing || staff) && form.defaultRoleType && (
                <button
                  type="button"
                  onClick={handleApplyRoleDefaults}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  Khôi phục bộ quyền mẫu {form.defaultRoleType}
                </button>
              )}
            </div>
          </div>

          {!permissions.length ? (
            <p className="flex items-center gap-2 py-4 text-sm italic text-slate-500">
              <Icon name="sync" className="animate-spin" /> Đang tải danh sách quyền từ hệ thống...
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
                              className={`text-sm font-medium transition-colors ${isChecked ? 'font-semibold text-blue-700' : 'text-slate-700 group-hover:text-black'}`}
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
      </form>
    </Modal>
  );
};

export default StaffModal;
