import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { hasRole } from '../../../../shared/utils/roleRedirect';

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
  { label: 'Nhân sự & Phân quyền (Staff)', prefixes: ['STAFF_', 'REPORT_'] },
];

// Ghi đè tên hiển thị khi backend trả về tên thiếu dấu tiếng Việt
const PERMISSION_NAME_OVERRIDES = {
  SHIFT_CREATE: 'Mở ca làm việc',
  SHIFT_DELETE: 'Xóa ca làm việc',
  SHIFT_UPDATE: 'Cập nhật ca làm việc',
  REPORT_VIEW: 'Báo cáo',
};

// Thứ tự ưu tiên hiển thị trong mỗi nhóm: Read → Create → Update → Delete
const PERMISSION_ACTION_ORDER = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

const permissionActionPriority = (code) => {
  const upper = (code || '').toUpperCase();
  const idx = PERMISSION_ACTION_ORDER.findIndex((action) => upper.endsWith(`_${action}`));
  return idx === -1 ? PERMISSION_ACTION_ORDER.length : idx;
};

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

// Checkbox chọn tất cả theo nhóm, hỗ trợ trạng thái "chọn một phần" (indeterminate)
const GroupSelectCheckbox = ({ codes, selectedCodes, onToggle }) => {
  const ref = useRef(null);
  const allChecked = codes.length > 0 && codes.every((c) => selectedCodes.includes(c));
  const someChecked = codes.length > 0 && codes.some((c) => selectedCodes.includes(c)) && !allChecked;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500 dark:border-[#404040]"
      checked={allChecked}
      onChange={() => onToggle(codes, allChecked)}
    />
  );
};

const StaffModal = ({ isOpen, onClose, staff, permissions = [], onSave, isAdminContext = false }) => {
  const [form, setForm] = useState(initialFormState);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        setForm({
          ...staff,
          password: '',
          defaultRoleType: hasRole(staff.roles, 'InventoryStaff')
            ? 'InventoryStaff'
            : hasRole(staff.roles, 'Staff')
              ? 'Staff'
              : hasRole(staff.roles, 'SalesStaff')
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
      const items = permissions
        .filter((p) => group.prefixes.some((prefix) => p.permissionCode.startsWith(prefix)))
        .sort((a, b) => {
          // Sắp theo thứ tự prefix (SALE_ → CUSTOMER_ → ...) trước
          const prefixDiff =
            group.prefixes.findIndex((prefix) => (a.permissionCode || '').startsWith(prefix)) -
            group.prefixes.findIndex((prefix) => (b.permissionCode || '').startsWith(prefix));
          if (prefixDiff !== 0) return prefixDiff;
          // Trong cùng prefix, sắp theo Read → Create → Update → Delete
          const actionDiff =
            permissionActionPriority(a.permissionCode) - permissionActionPriority(b.permissionCode);
          if (actionDiff !== 0) return actionDiff;
          return (a.permissionCode || '').localeCompare(b.permissionCode || '');
        });
      return { ...group, items };
    }).filter((g) => g.items.length > 0);
  }, [permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staff && form.defaultRoleType !== 'Owner' && (!form.username || !form.password)) {
      alert('Tên đăng nhập và Mật khẩu là bắt buộc khi tạo mới!');
      return;
    }
    if (!staff && form.defaultRoleType === 'Owner' && !form.password) {
      alert('Mật khẩu là bắt buộc khi tạo tài khoản Owner!');
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
    if (!staff) {
      submitData.customPermissionCodes = submitData.permissionCodes;
      // Do NOT delete permissionCodes so parent components can read it if they expect it
      // Do NOT set customPermissionCodes to [] because the backend Role DB might have empty permissions.
      // We explicitly send the default permissions to the backend to create them.
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

  const handleToggleGroup = (group, currentlyAllChecked) => {
    setIsCustomizing(true);
    const codes = group.items.map((p) => p.permissionCode);
    setForm((prev) => {
      const nextSet = new Set(prev.permissionCodes);
      if (currentlyAllChecked) {
        codes.forEach((c) => nextSet.delete(c));
      } else {
        codes.forEach((c) => nextSet.add(c));
      }
      return { ...prev, permissionCodes: [...nextSet] };
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
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[#004785] focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#b3b3b3] dark:disabled:bg-[#1a1a1a]';

  const modalFooter = (
    <div className="flex w-full items-center justify-end gap-2">
      <Button variant="primary" type="submit" form="staff-form" className="flex items-center gap-2">
        <Icon name="save" size={18} />
        {staff ? 'Lưu thay đổi' : isAdminContext ? 'Tạo người dùng' : 'Tạo nhân viên'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div>
          <span className="block">
            {staff ? `Chi tiết: ${staff.fullName}` : isAdminContext ? 'Thêm Người dùng mới' : 'Thêm Nhân viên mới'}
          </span>
          {staff && (
            <span className="mt-1 text-xs font-normal text-slate-500 dark:text-[#999999]">
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
          {!staff && form.defaultRoleType !== 'Owner' && (
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
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              {staff ? 'Vai trò / Chức danh' : 'Vai trò mặc định'}
            </label>
            <select
              className={selectCss}
              value={form.defaultRoleType}
              onChange={handleRoleChange}
              disabled={!!staff}
            >
              {isAdminContext && <option value="Owner">Chủ cửa hàng (Owner)</option>}
              <option value="SalesStaff">Nhân viên Bán hàng</option>
              <option value="InventoryStaff">Nhân viên Kho</option>
              <option value="Staff">Nhân viên</option>
              {!staff && <option value="">-- Không gán vai trò (Tuỳ chỉnh) --</option>}
            </select>
            {staff && (
              <p className="mt-1 text-xs italic text-slate-400 dark:text-[#808080]">
                * Hệ thống không hỗ trợ đổi chức danh sau khi tạo. Bạn chỉ có thể sửa quyền bên
                dưới.
              </p>
            )}
          </div>

          {staff && (
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
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

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-[#333333]">
            <div>
              <label className="text-base font-bold text-slate-800 dark:text-[#e5e5e5]">
                <Icon
                  name="shield"
                  size={20}
                  className="mr-2 inline align-text-bottom text-blue-600"
                />
                Phân quyền chi tiết ({form.defaultRoleType === 'Owner' ? 'Tất cả quyền' : `${form.permissionCodes.length} quyền đang chọn`})
              </label>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#999999]">
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
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  Khôi phục bộ quyền mẫu {form.defaultRoleType}
                </button>
              )}
            </div>
          </div>

          {!permissions.length ? (
            <p className="flex items-center gap-2 py-4 text-sm italic text-slate-500 dark:text-[#999999]">
              <Icon name="sync" className="animate-spin" /> Đang tải danh sách quyền từ hệ thống...
            </p>
          ) : !isCustomizing && !staff && form.defaultRoleType ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6 text-center dark:border-blue-900/50 dark:bg-blue-900/20">
              <Icon name="verified_user" size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                Đang áp dụng bộ quyền tự động cho chức danh [{form.defaultRoleType}]
              </h4>
              <p className="mx-auto mt-1 max-w-lg text-xs text-blue-700 dark:text-blue-400">
                Nhân viên sẽ tự động nhận đầy đủ các quyền chuẩn được thiết lập sẵn trong hệ thống
                khi khởi tạo.
              </p>
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-800 underline hover:text-black dark:text-blue-400 dark:hover:text-blue-200"
              >
                <Icon name="edit" size={14} /> Tôi muốn tự chọn / ghi đè quyền thủ công
              </button>
            </div>
          ) : form.defaultRoleType === 'Owner' ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6 text-center dark:border-blue-900/50 dark:bg-blue-900/20">
              <Icon name="admin_panel_settings" size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                Tài khoản Chủ cửa hàng (Owner)
              </h4>
              <p className="mx-auto mt-1 max-w-lg text-xs text-blue-700 dark:text-blue-400">
                Chủ cửa hàng mặc định có toàn quyền truy cập vào tất cả các chức năng và chi nhánh trên hệ thống. Không cần cấu hình phân quyền chi tiết.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedPermissions.map((group) => (
                <div key={group.label}>
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#999999]">
                      {group.label}
                    </h4>
                    <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-[#808080] dark:hover:text-blue-400">
                      <GroupSelectCheckbox
                        codes={group.items.map((p) => p.permissionCode)}
                        selectedCodes={form.permissionCodes}
                        onToggle={(codes, currentlyAllChecked) =>
                          handleToggleGroup(group, currentlyAllChecked)
                        }
                      />
                      Chọn tất cả
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f] sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((perm) => {
                      const isChecked = form.permissionCodes.includes(perm.permissionCode);
                      return (
                        <label
                          key={perm.permissionId}
                          className="group flex cursor-pointer items-start gap-2.5 rounded p-1 hover:bg-slate-50 dark:hover:bg-[#272727]"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500 dark:border-[#404040]"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.permissionCode)}
                          />
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-medium transition-colors ${isChecked ? 'font-semibold text-blue-700 dark:text-blue-400' : 'text-slate-700 group-hover:text-black dark:text-[#b3b3b3] dark:group-hover:text-[#e5e5e5]'}`}
                            >
                              {PERMISSION_NAME_OVERRIDES[perm.permissionCode] || perm.permissionName || perm.permissionCode}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 dark:text-[#808080]">
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
