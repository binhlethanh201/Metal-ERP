import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Input from '../../../../shared/components/Input';
import { hasRole } from '../../../../shared/utils/roleRedirect';
import PageBasedPermissionSelector from './PageBasedPermissionSelector';
import { getAllCodesForPage, PERMISSION_TO_VIEW, PAGE_PERMISSION_GROUPS, getSubPermissionCodes } from '../../config/pagePermissionMapping';
import { apiGet } from '../../../../services/apiClient';
import ENDPOINTS from '../../../../services/endpoints';

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

// Fallback cung - dung khi API chua tra ve
const FALLBACK_ROLE_PERMISSIONS = {
  SalesStaff: [
    'CUSTOMER_VIEW','CUSTOMER_CREATE','CUSTOMER_UPDATE',
    'SALE_VIEW','SALE_CREATE','SALE_UPDATE',
    'PAYMENT_VIEW','PAYMENT_CREATE',
    'PRINT_VIEW','PROMOTION_VIEW',
    'SHIFT_VIEW',
    'PRODUCT_VIEW','STOCK_VIEW',
  ],
  InventoryStaff: [
    'SUPPLIER_VIEW','SUPPLIER_CREATE','SUPPLIER_UPDATE',
    'PRODUCT_VIEW','PRODUCT_CREATE','PRODUCT_UPDATE',
    'STOCK_VIEW',
    'STOCK_INWARD_CREATE','STOCK_INWARD_UPDATE',
    'STOCK_OUTWARD_CREATE','STOCK_OUTWARD_UPDATE',
    'STOCK_CHECK_VIEW','STOCK_CHECK_CREATE',
  ],
};

const StaffModal = ({ isOpen, onClose, staff, permissions = [], onSave, isAdminContext = false }) => {
  const [form, setForm] = useState(initialFormState);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [rolePermissions, setRolePermissions] = useState(FALLBACK_ROLE_PERMISSIONS);
  const lastStaffIdRef = useRef(null);

  // Fetch role permissions tu API (dong bo voi Admin cau hinh)
  useEffect(() => {
    if (!isOpen) return;
    apiGet(ENDPOINTS.OWNER.STAFF_ROLE_PERMISSIONS)
      .then((res) => {
        const data = res?.data || res;
        if (data && (data.SalesStaff || data.InventoryStaff)) {
          setRolePermissions(data);
          // Auto-apply role defaults cho new staff khi chua customize
          if (!staff && !isCustomizing) {
            const defaults = data[form.defaultRoleType] || [];
            const validDefaults = permissions
              .filter((p) => defaults.includes(p.permissionCode))
              .map((p) => p.permissionCode);
            if (validDefaults.length > 0) {
              setForm((prev) => ({ ...prev, permissionCodes: validDefaults }));
            }
          }
        }
      })
      .catch(() => {
        // Dung fallback
      });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) {
      lastStaffIdRef.current = null;
      return;
    }
    if (staff) {
      const staffId = staff.userId;
      // Chi reset form khi mo modal cho 1 nhan vien khac
      if (staffId !== lastStaffIdRef.current) {
        lastStaffIdRef.current = staffId;
        // Cleanup: xoa VIEW permission khong con quyen con nao
        const rawCodes = staff.permissionCodes || [];
        const viewCodes = new Set(PAGE_PERMISSION_GROUPS.map((p) => p.viewPermission));
        const cleanedCodes = rawCodes.filter((c) => {
          if (!viewCodes.has(c)) return true;
          const page = PAGE_PERMISSION_GROUPS.find((p) => p.viewPermission === c);
          if (!page) return true;
          return page.subPermissions.some((sub) => {
            const subCodes = getSubPermissionCodes(sub);
            return subCodes.some((sc) => rawCodes.includes(sc));
          });
        });
        setForm({
          ...staff,
          password: '',
          defaultRoleType: hasRole(staff.roles, 'InventoryStaff')
            ? 'InventoryStaff'
            : hasRole(staff.roles, 'SalesStaff')
              ? 'SalesStaff'
              : 'SalesStaff',
          isActive: staff.isActive !== undefined ? staff.isActive : 1,
          permissionCodes: cleanedCodes,
        });
        setIsCustomizing(staff.hasCustomPermissions || cleanedCodes.length > 0);
      }
    } else {
      lastStaffIdRef.current = null;
      setForm(initialFormState);
      setIsCustomizing(false);
    }
  }, [isOpen, staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate email format
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Email không đúng định dạng. Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!staff && form.defaultRoleType !== 'Owner' && (!form.username || !form.password)) {
      alert('Tên đăng nhập và Mật khẩu là bắt buộc khi tạo mới!');
      return;
    }
    if (!staff && form.defaultRoleType === 'Owner' && !form.password) {
      alert('Mật khẩu là bắt buộc khi tạo tài khoản Owner!');
      return;
    }
    if (staff && isCustomizing && form.permissionCodes.length === 0) {
      if (!window.confirm('CẢNH BÁO: Bạn đã bỏ chọn tất cả quyền. Tiếp tục?')) return;
    }

    // Cleanup: xoa VIEW permission khong con quyen con nao
    let cleanedCodes = [...form.permissionCodes];
    PAGE_PERMISSION_GROUPS.forEach((page) => {
      const hasAnySub = page.subPermissions.some((sub) => {
        const subCodes = getSubPermissionCodes(sub);
        return subCodes.some((c) => cleanedCodes.includes(c));
      });
      if (!hasAnySub && cleanedCodes.includes(page.viewPermission)) {
        cleanedCodes = cleanedCodes.filter((c) => c !== page.viewPermission);
      }
    });

    const submitData = { ...form, permissionCodes: cleanedCodes };
    if (!staff) submitData.customPermissionCodes = submitData.permissionCodes;
    onSave(submitData);
  };

  const handleTogglePermission = (codes) => {
    setIsCustomizing(true);
    const codeList = Array.isArray(codes) ? codes : [codes];
    const firstCode = codeList[0];
    setForm((prev) => {
      const current = prev.permissionCodes;
      const allChecked = codeList.every((c) => current.includes(c));
      if (allChecked) {
        // Bỏ chọn toàn bộ nhóm quyền con
        const next = current.filter((c) => !codeList.includes(c));
        // Nếu không còn quyền con nào khác trong cùng trang, bỏ luôn VIEW
        const viewPermission = PERMISSION_TO_VIEW[firstCode];
        if (viewPermission && next.includes(viewPermission)) {
          const pageForCode = PAGE_PERMISSION_GROUPS.find((page) =>
            page.subPermissions.some((sub) => {
              const subCodes = Array.isArray(sub.codes) ? sub.codes : sub.code ? [sub.code] : [];
              return subCodes.some((c) => codeList.includes(c));
            })
          );
          if (pageForCode) {
            const stillHasSub = pageForCode.subPermissions.some((sub) => {
              const subCodes = Array.isArray(sub.codes) ? sub.codes : sub.code ? [sub.code] : [];
              return subCodes.some((c) => !codeList.includes(c) && next.includes(c));
            });
            if (!stillHasSub) {
              return { ...prev, permissionCodes: next.filter((c) => c !== viewPermission) };
            }
          }
        }
        return { ...prev, permissionCodes: next };
      }
      // Chọn quyền con -> tự động thêm VIEW nếu chưa có
      const viewPermission = PERMISSION_TO_VIEW[firstCode];
      const next = [...current];
      codeList.forEach((c) => {
        if (!next.includes(c)) next.push(c);
      });
      if (viewPermission && !next.includes(viewPermission)) {
        next.push(viewPermission);
      }
      return { ...prev, permissionCodes: next };
    });
  };

  const handleTogglePage = (page, viewOn) => {
    setIsCustomizing(true);
    const allCodes = getAllCodesForPage(page);
    setForm((prev) => {
      const nextSet = new Set(prev.permissionCodes);
      if (viewOn) {
        // Tắt Switch chính -> bỏ tích toàn bộ (VIEW + tất cả quyền con)
        allCodes.forEach((c) => nextSet.delete(c));
      } else {
        // Bật Switch chính -> chỉ thêm VIEW, không tự động thêm quyền con
        nextSet.add(page.viewPermission);
      }
      return { ...prev, permissionCodes: [...nextSet] };
    });
  };

  const handleApplyRoleDefaults = () => {
    setIsCustomizing(true);
    const defaults = rolePermissions[form.defaultRoleType] || FALLBACK_ROLE_PERMISSIONS[form.defaultRoleType] || [];
    const validDefaults = permissions
      .filter((p) => defaults.includes(p.permissionCode))
      .map((p) => p.permissionCode);
    setForm((prev) => ({ ...prev, permissionCodes: validDefaults }));
  };

  const handleRoleChange = (e) => {
    setForm((prev) => ({ ...prev, defaultRoleType: e.target.value, permissionCodes: [] }));
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
              {staff.branchName ? `Chi nhánh: ${staff.branchName} — ` : ''}
              Bạn có thể kiểm tra và chỉnh sửa thông tin hoặc phân quyền trực tiếp tại đây.
            </span>
          )}
        </div>
      }
      footer={modalFooter}
    >
      <form id="staff-form" onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-2 gap-5">
          {!staff && form.defaultRoleType !== 'Owner' && (
            <Input label="Tên đăng nhập" required placeholder="VD: nguyenvan_a"
              value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          )}
          <Input label="Mật khẩu" type="password" required={!staff} hint={staff ? '(Bỏ trống nếu không đổi)' : ''}
            placeholder="Nhập mật khẩu..." value={form.password || ''}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Input label="Họ và tên" required placeholder="VD: Nguyễn Văn A"
            value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Email" type="email" required placeholder="VD: nguyenvana@gmail.com"
            value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Số điện thoại" placeholder="VD: 0912345678"
            value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />

          <div className="w-full">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              {staff ? 'Vai trò / Chức danh' : 'Vai trò mặc định'}
            </label>
            <select className={selectCss} value={form.defaultRoleType} onChange={handleRoleChange} disabled={!!staff}>
              {isAdminContext && <option value="Owner">Chủ cửa hàng (Owner)</option>}
              <option value="SalesStaff">Nhân viên Bán hàng</option>
              <option value="InventoryStaff">Nhân viên Kho</option>
            </select>
            {staff && (
              <p className="mt-1 text-xs italic text-slate-400 dark:text-[#808080]">
                * Hệ thống không hỗ trợ đổi chức danh sau khi tạo. Bạn chỉ có thể sửa quyền bên dưới.
              </p>
            )}
          </div>

          {staff && (
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">Trạng thái tài khoản</label>
              <select className={selectCss} value={form.isActive} onChange={(e) => setForm({ ...form, isActive: Number(e.target.value) })}>
                <option value={1}>Đang hoạt động</option>
                <option value={0}>Khóa tài khoản</option>
              </select>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-[#333333] dark:bg-[#1a1a1a]/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-[#333333]">
            <div>
              <label className="text-base font-bold text-slate-800 dark:text-[#e5e5e5]">
                <Icon name="shield" size={20} className="mr-2 inline align-text-bottom text-blue-600" />
                Phân quyền chi tiết ({form.defaultRoleType === 'Owner' ? 'Tất cả quyền' : `${form.permissionCodes.length} quyền đang chọn`})
              </label>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#999999]">
                {!staff ? 'Chọn quyền theo Trang. Bật trang để tự động thêm toàn bộ quyền thao tác.' : 'Cập nhật quyền hạn cho nhân viên.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!staff && form.defaultRoleType && (
                <Button size="sm" variant={!isCustomizing ? 'primary' : 'secondary'}
                  onClick={() => setIsCustomizing(!isCustomizing)}>
                  {!isCustomizing ? '✓ Dùng quyền mặc định' : 'Chuyển sang quyền mặc định'}
                </Button>
              )}
              {(isCustomizing || staff) && form.defaultRoleType && (
                <button type="button" onClick={handleApplyRoleDefaults}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
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
                Nhân viên sẽ tự động nhận đầy đủ các quyền chuẩn được thiết lập sẵn trong hệ thống khi khởi tạo.
              </p>
              <button type="button" onClick={() => setIsCustomizing(true)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-800 underline hover:text-black dark:text-blue-400 dark:hover:text-blue-200">
                <Icon name="edit" size={14} /> Tôi muốn tự chọn / ghi đè quyền thủ công
              </button>
            </div>
          ) : form.defaultRoleType === 'Owner' ? (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6 text-center dark:border-blue-900/50 dark:bg-blue-900/20">
              <Icon name="admin_panel_settings" size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Tài khoản Chủ cửa hàng (Owner)</h4>
              <p className="mx-auto mt-1 max-w-lg text-xs text-blue-700 dark:text-blue-400">
                Chủ cửa hàng mặc định có toàn quyền truy cập vào tất cả các chức năng. Không cần cấu hình phân quyền chi tiết.
              </p>
            </div>
          ) : (
            <PageBasedPermissionSelector
              selectedCodes={form.permissionCodes}
              onTogglePage={handleTogglePage}
              onTogglePermission={handleTogglePermission}
            />
          )}
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;
