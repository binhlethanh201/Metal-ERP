import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getPermissionList,
  getPermissionMatrix,
  updateRolePermissions,
} from '../services/adminService';

const AdminRoleManagement = () => {
  const [matrix, setMatrix] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [matrixData, permissionData] = await Promise.all([
        getPermissionMatrix(),
        getPermissionList(),
      ]);

      setMatrix(Array.isArray(matrixData) ? matrixData : []);
      setAllPermissions(
        Array.isArray(permissionData) ? permissionData : []
      );
    } catch (err) {
      console.error('API error:', err);
      setError(
        err.message || 'Không tải được dữ liệu phân quyền'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý khi chọn một vai trò
  const handleSelectRole = (role) => {
    setSelectedRoleId(role.roleId);

    // Lấy danh sách ID quyền hiện tại của vai trò
    const currentPermissionIds = (role.permissions || []).map(
      (permission) => permission.permissionId
    );

    setEditedPermissions(currentPermissionIds);
  };

  // Bật hoặc tắt một quyền
  const handleTogglePermission = (permissionId) => {
    setEditedPermissions((previousPermissions) =>
      previousPermissions.includes(permissionId)
        ? previousPermissions.filter(
            (id) => id !== permissionId
          )
        : [...previousPermissions, permissionId]
    );
  };

  // Chọn hoặc bỏ chọn toàn bộ quyền trong một nhóm
  const handleToggleGroup = (
    groupPermissionIds,
    isAllChecked
  ) => {
    if (isAllChecked) {
      // Bỏ chọn toàn bộ quyền trong nhóm
      setEditedPermissions((previousPermissions) =>
        previousPermissions.filter(
          (id) => !groupPermissionIds.includes(id)
        )
      );
    } else {
      // Chọn toàn bộ quyền trong nhóm
      setEditedPermissions((previousPermissions) => {
        const permissionSet = new Set([
          ...previousPermissions,
          ...groupPermissionIds,
        ]);

        return Array.from(permissionSet);
      });
    }
  };

  // Lưu quyền của vai trò
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;

    setIsSaving(true);

    try {
      await updateRolePermissions(
        selectedRoleId,
        editedPermissions
      );

      alert('Cập nhật quyền thành công!');

      // Tải lại dữ liệu mới nhất
      await fetchData();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Cập nhật quyền thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // Nhóm các quyền thành những module lớn
  const groupedPermissions = useMemo(() => {
    const MODULE_MAP = {
      SALE: 'Bán hàng & Thu ngân',
      PAYMENT: 'Bán hàng & Thu ngân',
      SHIFT: 'Bán hàng & Thu ngân',
      PRINT: 'Bán hàng & Thu ngân',

      STOCK: 'Quản lý kho bãi & Sản phẩm',
      PRODUCT: 'Quản lý kho bãi & Sản phẩm',
      SUPPLIER: 'Quản lý kho bãi & Sản phẩm',

      CUSTOMER: 'Chăm sóc khách hàng',
      LOYALTY: 'Chăm sóc khách hàng',
      PROMOTION: 'Chăm sóc khách hàng',

      STAFF: 'Quản lý nhân sự',

      REPORT: 'Báo cáo & Hệ thống',
      SYSTEM: 'Báo cáo & Hệ thống',
    };

    const groups = {};

    allPermissions.forEach((permission) => {
      const permissionCode =
        permission.permissionCode || '';

      const parts = permissionCode.split('_');
      const prefix =
        parts.length > 1
          ? parts[0].toUpperCase()
          : 'OTHER';

      // Bỏ toàn bộ quyền thuộc Owner và các module không dành cho Staff
      if (
        prefix === 'OWNER' ||
        prefix === 'STAFF' ||
        prefix === 'SYSTEM' ||
        prefix === 'REPORT'
      ) {
        return;
      }

      const moduleName =
        MODULE_MAP[prefix] || 'Các quyền hạn khác';

      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }

      groups[moduleName].push(permission);
    });

    // Sắp xếp quyền theo bảng chữ cái trong từng nhóm
    Object.values(groups).forEach((permissionList) => {
      permissionList.sort((permissionA, permissionB) =>
        permissionA.permissionCode.localeCompare(
          permissionB.permissionCode
        )
      );
    });

    return groups;
  }, [allPermissions]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-500 dark:text-[#999999]">
        Đang tải dữ liệu hệ thống...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center font-bold text-red-600 dark:text-red-500">
        {error}
      </div>
    );
  }

  const selectedRole = matrix.find(
    (role) => role.roleId === selectedRoleId
  );

  const isSuperAdmin =
    selectedRole?.roleName?.toUpperCase() === 'ADMIN';

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      {/* Phần tiêu đề */}
      <div className="mb-6 flex shrink-0 items-center justify-between border-b border-slate-200 pb-3 dark:border-[#333333]">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Cấu hình vai trò & Phân quyền
          </h1>

          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            Kiểm soát bảo mật và phân quyền truy cập
          </p>
        </div>

        {selectedRoleId && !isSuperAdmin && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                handleSelectRole(selectedRole)
              }
              disabled={isSaving}
              className="rounded bg-slate-100 px-4 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
            >
              Hủy thay đổi
            </button>

            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={isSaving}
              className="flex items-center gap-2 rounded bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#003663] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Icon
                name={
                  isSaving
                    ? 'hourglass_empty'
                    : 'save'
                }
                size={16}
              />

              {isSaving
                ? 'Đang lưu...'
                : 'Lưu quyền hạn'}
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Cột trái: Danh sách vai trò */}
        <div className="flex h-[40vh] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f] lg:h-auto lg:w-80">
          <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              Chọn chức vụ
            </h2>
          </div>

          <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
            {matrix
              .filter((role) => {
                const roleName =
                  role.roleName?.toLowerCase() || '';

                // Chỉ hiển thị 2 loại nhân viên (không hiển thị Owner, Staff chung, Admin)
                return [
                  'salesstaff',
                  'inventorystaff',
                ].includes(roleName);
              })
              .map((role) => {
                const isSelected =
                  role.roleId === selectedRoleId;

                const permissionCount = (
                  role.permissions || []
                ).filter((permission) => {
                  const permissionCode =
                    permission.permissionCode || '';

                  return !permissionCode
                    .toUpperCase()
                    .startsWith('OWNER_');
                }).length;

                return (
                  <button
                    type="button"
                    key={role.roleId}
                    onClick={() =>
                      handleSelectRole(role)
                    }
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#004785] bg-[#004785] shadow-sm dark:border-blue-600 dark:bg-blue-600'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-900 dark:text-[#e5e5e5]'
                        }`}
                      >
                        {role.roleName === 'InventoryStaff' ? 'Inventory Staff' : role.roleName === 'SalesStaff' ? 'Sales Staff' : role.roleName}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-[#272727] dark:text-[#999999]'
                        }`}
                      >
                        {permissionCount} quyền
                      </span>
                    </div>

                    <div
                      className={`mt-1 text-[11px] ${
                        isSelected
                          ? 'text-white/80'
                          : 'text-slate-500 dark:text-[#999999]'
                      }`}
                    >
                      Nhấp để xem và cấu hình quyền
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Cột phải: Ma trận quyền hạn */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          {!selectedRoleId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-[#666666]">
              <Icon
                name="admin_panel_settings"
                size={48}
                className="mb-4 opacity-50"
              />

              <p className="text-sm font-bold text-slate-500 dark:text-[#999999]">
                Chưa chọn chức vụ nào.
              </p>

              <p className="text-xs">
                Hãy chọn một chức vụ ở cột bên trái để bắt đầu phân quyền.
              </p>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
                    Quyền hạn của:{' '}
                    <span className="text-[#004785] dark:text-blue-400">
                      {selectedRole?.roleName}
                    </span>
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-[#999999]">
                    Tích chọn các ô bên dưới để bật hoặc tắt quyền truy cập của từng module.
                  </p>
                </div>
              </div>

              <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
                {isSuperAdmin && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-500">
                    <Icon name="info" size={16} />

                    Super Admin được mặc định toàn quyền và không thể chỉnh sửa từ giao diện.
                  </div>
                )}

                {Object.entries(groupedPermissions).map(
                  ([groupName, permissions]) => {
                    const groupPermissionIds =
                      permissions.map(
                        (permission) =>
                          permission.permissionId
                      );

                    const isAllChecked =
                      groupPermissionIds.every((id) =>
                        editedPermissions.includes(id)
                      );

                    const isIndeterminate =
                      !isAllChecked &&
                      groupPermissionIds.some((id) =>
                        editedPermissions.includes(id)
                      );

                    return (
                      <div
                        key={groupName}
                        className="mb-6"
                      >
                        <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-[#333333]">
                          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                            <Icon
                              name="folder"
                              size={18}
                              className="text-[#004785] dark:text-blue-400"
                            />

                            {groupName}
                          </h3>

                          <label className="group flex cursor-pointer items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#004785] dark:text-[#999999] dark:group-hover:text-blue-400">
                              Chọn hết nhóm này
                            </span>

                            <input
                              type="checkbox"
                              disabled={isSuperAdmin}
                              checked={isAllChecked}
                              ref={(input) => {
                                if (input) {
                                  input.indeterminate =
                                    isIndeterminate;
                                }
                              }}
                              onChange={() =>
                                handleToggleGroup(
                                  groupPermissionIds,
                                  isAllChecked
                                )
                              }
                              className="h-4 w-4 rounded text-[#004785] focus:ring-[#004785] disabled:opacity-50 dark:text-blue-400"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
                          {permissions.map(
                            (permission) => {
                              const isChecked =
                                editedPermissions.includes(
                                  permission.permissionId
                                );

                              return (
                                <label
                                  key={
                                    permission.permissionId
                                  }
                                  className={`group flex items-start gap-2 ${
                                    isSuperAdmin
                                      ? 'cursor-not-allowed opacity-60'
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    disabled={isSuperAdmin}
                                    checked={isChecked}
                                    onChange={() =>
                                      handleTogglePermission(
                                        permission.permissionId
                                      )
                                    }
                                    className="mt-0.5 h-4 w-4 rounded border-slate-200 text-[#004785] focus:ring-[#004785] dark:border-[#333333] dark:text-blue-400"
                                  />

                                  <div>
                                    <div
                                      className={`text-xs font-bold transition-colors ${
                                        isChecked
                                          ? 'text-[#004785] dark:text-blue-400'
                                          : 'text-slate-900 group-hover:text-[#004785] dark:text-[#e5e5e5] dark:group-hover:text-blue-400'
                                      }`}
                                      title={permission.permissionName || permission.permissionCode}
                                    >
                                      {permission.permissionName || permission.permissionCode}
                                    </div>

                                    <div
                                      className="w-32 truncate text-[10px] leading-tight text-slate-500 dark:text-[#999999] md:w-48"
                                      title={permission.permissionCode}
                                    >
                                      {permission.permissionCode}
                                    </div>
                                  </div>
                                </label>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
