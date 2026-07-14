import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([getPermissionMatrix(), getPermissionList()])
      .then(([matrixData, permData]) => {
        setMatrix(Array.isArray(matrixData) ? matrixData : []);
        setAllPermissions(Array.isArray(permData) ? permData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError(err.message || 'Không tải được dữ liệu phân quyền');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle role selection
  const handleSelectRole = (role) => {
    setSelectedRoleId(role.roleId);
    // Extract array of permission IDs that this role currently has
    const currentPermIds = (role.permissions || []).map((p) => p.permissionId);
    setEditedPermissions(currentPermIds);
  };

  const handleTogglePermission = (permissionId) => {
    setEditedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleGroup = (groupPermIds, isAllChecked) => {
    if (isAllChecked) {
      // Bỏ check toàn bộ group
      setEditedPermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      // Check toàn bộ group
      setEditedPermissions((prev) => {
        const newSet = new Set([...prev, ...groupPermIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      await updateRolePermissions(selectedRoleId, editedPermissions);
      alert('Cập nhật quyền thành công!');
      await fetchData(); // Reload to get fresh matrix
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // Nhóm các quyền thành 5 Modules lớn cho dễ nhìn
  const groupedPermissions = useMemo(() => {
    const MODULE_MAP = {
      SALE: 'Bán hàng & Thu ngân',
      PAYMENT: 'Bán hàng & Thu ngân',
      SHIFT: 'Bán hàng & Thu ngân',
      PRINT: 'Bán hàng & Thu ngân',

      STOCK: 'Quản lý Kho bãi & Sản phẩm',
      PRODUCT: 'Quản lý Kho bãi & Sản phẩm',
      SUPPLIER: 'Quản lý Kho bãi & Sản phẩm',

      CUSTOMER: 'Chăm sóc Khách hàng',
      LOYALTY: 'Chăm sóc Khách hàng',
      PROMOTION: 'Chăm sóc Khách hàng',

      STAFF: 'Nhân sự & Chủ cửa hàng',
      OWNER: 'Nhân sự & Chủ cửa hàng',

      REPORT: 'Báo cáo & Hệ thống',
      SYSTEM: 'Báo cáo & Hệ thống',
    };

    const groups = {};
    allPermissions.forEach((p) => {
      const parts = p.permissionCode.split('_');
      const prefix = parts.length > 1 ? parts[0].toUpperCase() : 'OTHER';

      const moduleName = MODULE_MAP[prefix] || 'Các quyền hạn khác';

      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(p);
    });

    // Sort quyền theo alphabet bên trong từng nhóm cho gọn
    Object.values(groups).forEach((list) => {
      list.sort((a, b) => a.permissionCode.localeCompare(b.permissionCode));
    });

    return groups;
  }, [allPermissions]);

  if (loading)
    return (
      <div className="p-8 text-center text-xs font-bold text-on-surface-variant">
        Đang tải dữ liệu hệ thống...
      </div>
    );
  if (error) return <div className="p-8 text-center font-bold text-error">{error}</div>;

  const selectedRole = matrix.find((r) => r.roleId === selectedRoleId);
  const isSuperAdmin = selectedRole?.roleName?.toUpperCase() === 'ADMIN';

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Cấu hình Vai Trò & Phân Quyền
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            KIỂM SOÁT BẢO MẬT VÀ PHÂN QUYỀN TRUY CẬP
          </p>
        </div>
        {selectedRoleId && !isSuperAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => handleSelectRole(selectedRole)}
              disabled={isSaving}
              className="rounded bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
            <button
              onClick={handleSavePermissions}
              disabled={isSaving}
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Icon name={isSaving ? 'hourglass_empty' : 'save'} size={16} />
              {isSaving ? 'Đang lưu...' : 'Lưu Quyền Hạn'}
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* CỘT TRÁI: DANH SÁCH ROLE */}
        <div className="flex h-[40vh] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:h-auto lg:w-80">
          <div className="shrink-0 border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface">
              Chọn Chức Vụ (Role)
            </h2>
          </div>
          <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
            {matrix
              .filter((r) =>
                ['owner', 'staff', 'salesstaff', 'inventorystaff'].includes(
                  r.roleName.toLowerCase()
                )
              )
              .map((role) => {
                const isSelected = role.roleId === selectedRoleId;
                const permCount = (role.permissions || []).length;
                return (
                  <button
                    key={role.roleId}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full rounded-lg px-4 py-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary-container bg-primary-container shadow-sm'
                        : 'border-transparent hover:bg-surface-container-low'
                    } border`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}
                      >
                        {role.roleName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}
                      >
                        {permCount} quyền
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-[11px] ${isSelected ? 'text-on-primary-container/80' : 'text-on-surface-variant'}`}
                    >
                      {role.roleName === 'Admin'
                        ? 'Toàn quyền hệ thống (Không thể sửa)'
                        : 'Nhấp để xem và cấu hình'}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* CỘT PHẢI: MA TRẬN QUYỀN HẠN */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {!selectedRoleId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-outline">
              <Icon name="admin_panel_settings" size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-bold text-on-surface-variant">Chưa chọn chức vụ nào.</p>
              <p className="text-xs">Hãy chọn một chức vụ ở cột bên trái để bắt đầu phân quyền.</p>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface">
                    Quyền hạn của: <span className="text-primary">{selectedRole?.roleName}</span>
                  </h2>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">
                    Tích chọn các ô bên dưới để bật/tắt quyền truy cập từng Module.
                  </p>
                </div>
              </div>

              <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
                {isSuperAdmin && (
                  <div className="flex items-center gap-2 rounded-lg border border-error-container bg-error-container/20 px-4 py-3 text-xs font-bold text-error">
                    <Icon name="info" size={16} /> Super Admin được mặc định toàn quyền và bị chặn
                    chỉnh sửa từ Server.
                  </div>
                )}

                {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                  const groupPermIds = perms.map((p) => p.permissionId);
                  const isAllChecked = groupPermIds.every((id) => editedPermissions.includes(id));
                  const isIndeterminate =
                    !isAllChecked && groupPermIds.some((id) => editedPermissions.includes(id));

                  return (
                    <div key={groupName} className="mb-6">
                      <div className="mb-3 flex items-center justify-between border-b border-outline-variant pb-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-on-surface">
                          <Icon name="folder" size={18} className="text-primary" /> {groupName}
                        </h3>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <span className="text-[11px] font-bold text-on-surface-variant group-hover:text-primary">
                            Chọn hết nhóm này
                          </span>
                          <input
                            type="checkbox"
                            disabled={isSuperAdmin}
                            checked={isAllChecked}
                            ref={(input) => {
                              if (input) input.indeterminate = isIndeterminate;
                            }}
                            onChange={() => handleToggleGroup(groupPermIds, isAllChecked)}
                            className="h-4 w-4 rounded text-primary focus:ring-primary disabled:opacity-50"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
                        {perms.map((p) => {
                          const isChecked = editedPermissions.includes(p.permissionId);
                          return (
                            <label
                              key={p.permissionId}
                              className={`group flex cursor-pointer items-start gap-2 ${isSuperAdmin ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              <input
                                type="checkbox"
                                disabled={isSuperAdmin}
                                checked={isChecked}
                                onChange={() => handleTogglePermission(p.permissionId)}
                                className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                              />
                              <div>
                                <div
                                  className={`text-xs font-bold transition-colors ${isChecked ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}
                                >
                                  {p.permissionCode}
                                </div>
                                <div
                                  className="w-32 truncate text-[10px] leading-tight text-on-surface-variant md:w-48"
                                  title={p.permissionName}
                                >
                                  {p.permissionName || 'Cấp quyền truy cập'}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
