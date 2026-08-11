import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getPermissionList,
  getPermissionMatrix,
  updateRolePermissions,
} from '../services/adminService';
import PageBasedPermissionSelector from '../../owner/components/staff/PageBasedPermissionSelector';
import { getAllCodesForPage, PAGE_PERMISSION_GROUPS, PERMISSION_TO_VIEW, getSubPermissionCodes } from '../../owner/config/pagePermissionMapping';

const AdminRoleManagement = () => {
  const [matrix, setMatrix] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
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
      setAllPermissions(Array.isArray(permissionData) ? permissionData : []);
    } catch (err) {
      console.error('API error:', err);
      setError(err.message || 'Không tải được dữ liệu phân quyền');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build map: permissionCode -> permissionId
  const codeToId = {};
  allPermissions.forEach((p) => {
    codeToId[p.permissionCode] = p.permissionId;
  });

  const handleSelectRole = (role) => {
    // Khong reset khi bam vao vai tro dang chon
    if (role.roleId === selectedRoleId && selectedCodes.length > 0) return;
    setSelectedRoleId(role.roleId);
    const codes = (role.permissions || []).map((p) => p.permissionCode).filter(Boolean);
    // Cleanup: xoa VIEW permission khong con quyen con nao
    const viewCodes = new Set(PAGE_PERMISSION_GROUPS.map((p) => p.viewPermission));
    const cleaned = codes.filter((c) => {
      if (!viewCodes.has(c)) return true;
      const page = PAGE_PERMISSION_GROUPS.find((p) => p.viewPermission === c);
      if (!page) return true;
      return page.subPermissions.some((sub) => {
        const subCodes = getSubPermissionCodes(sub);
        return subCodes.some((sc) => codes.includes(sc));
      });
    });
    setSelectedCodes(cleaned);
  };

  const handleTogglePermission = (codes) => {
    const codeList = Array.isArray(codes) ? codes : [codes];
    const firstCode = codeList[0];
    setSelectedCodes((prev) => {
      const allChecked = codeList.every((c) => prev.includes(c));
      if (allChecked) {
        // Bỏ chọn toàn bộ nhóm quyền con
        const next = prev.filter((c) => !codeList.includes(c));
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
              return next.filter((c) => c !== viewPermission);
            }
          }
        }
        return next;
      }
      // Chọn quyền con -> tự động thêm VIEW nếu chưa có
      const viewPermission = PERMISSION_TO_VIEW[firstCode];
      const next = [...prev];
      codeList.forEach((c) => {
        if (!next.includes(c)) next.push(c);
      });
      if (viewPermission && !next.includes(viewPermission)) {
        next.push(viewPermission);
      }
      return next;
    });
  };

  const handleTogglePage = (page, viewOn) => {
    setSelectedCodes((prev) => {
      const nextSet = new Set(prev);
      const allCodes = getAllCodesForPage(page);
      if (viewOn) {
        allCodes.forEach((c) => nextSet.delete(c));
      } else {
        nextSet.add(page.viewPermission);
      }
      return [...nextSet];
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setIsSaving(true);
    try {
      // Cleanup: xoa VIEW permission khong con quyen con nao
      let cleanedCodes = [...selectedCodes];
      PAGE_PERMISSION_GROUPS.forEach((page) => {
        const hasAnySub = page.subPermissions.some((sub) => {
          const subCodes = getSubPermissionCodes(sub);
          return subCodes.some((c) => cleanedCodes.includes(c));
        });
        if (!hasAnySub && cleanedCodes.includes(page.viewPermission)) {
          cleanedCodes = cleanedCodes.filter((c) => c !== page.viewPermission);
        }
      });

      const permissionIds = cleanedCodes
        .map((code) => codeToId[code])
        .filter(Boolean);

      // Tim tat ca role ID cung loai (ca "SalesStaff" va "Sales Staff") de update dong bo
      const selectedRole = matrix.find((r) => r.roleId === selectedRoleId);
      const roleName = (selectedRole?.roleName || '').toLowerCase();
      let siblingIds = [selectedRoleId];

      if (roleName === 'salesstaff' || roleName === 'sales staff') {
        const other = matrix.find((r) =>
          r.roleId !== selectedRoleId &&
          ((r.roleName || '').toLowerCase() === 'salesstaff' || (r.roleName || '').toLowerCase() === 'sales staff')
        );
        if (other) siblingIds.push(other.roleId);
      } else if (roleName === 'inventorystaff' || roleName === 'inventory staff') {
        const other = matrix.find((r) =>
          r.roleId !== selectedRoleId &&
          ((r.roleName || '').toLowerCase() === 'inventorystaff' || (r.roleName || '').toLowerCase() === 'inventory staff')
        );
        if (other) siblingIds.push(other.roleId);
      }

      // Update tat ca cac role siblings
      const results = await Promise.all(siblingIds.map((id) => updateRolePermissions(id, permissionIds)));
      console.log('Save results:', results);

      await fetchData();
      alert('Cập nhật quyền thành công!');
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Cập nhật quyền thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-500 dark:text-[#999999]">
        Đang tải dữ liệu hệ thống...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center font-bold text-red-600 dark:text-red-500">{error}</div>;
  }

  const selectedRole = matrix.find((role) => role.roleId === selectedRoleId);
  const isSuperAdmin = selectedRole?.roleName?.toUpperCase() === 'ADMIN';

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      {/* Tiêu đề */}
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
              onClick={() => handleSelectRole(selectedRole)}
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
              <Icon name={isSaving ? 'hourglass_empty' : 'save'} size={16} />
              {isSaving ? 'Đang lưu...' : 'Lưu quyền hạn'}
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
            {(() => {
              // Deduplicate: gop "Sales Staff" + "SalesStaff" thanh 1, "Inventory Staff" + "InventoryStaff" thanh 1
              const deduped = {};
              matrix.forEach((role) => {
                const name = (role.roleName || '').toLowerCase();
                let key = null;
                if (name === 'salesstaff' || name === 'sales staff') key = 'SalesStaff';
                if (name === 'inventorystaff' || name === 'inventory staff') key = 'InventoryStaff';
                if (!key) return;
                if (!deduped[key]) {
                  deduped[key] = { ...role, roleName: key, permissions: [...(role.permissions || [])] };
                } else {
                  // Merge permissions
                  const existingCodes = new Set(deduped[key].permissions.map(p => p.permissionCode));
                  (role.permissions || []).forEach(p => {
                    if (!existingCodes.has(p.permissionCode)) {
                      deduped[key].permissions.push(p);
                    }
                  });
                }
              });
              return Object.values(deduped).map((role) => {
                const isSelected = role.roleId === selectedRoleId;

                return (
                  <button
                    type="button"
                    key={role.roleId}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? 'border-[#004785] bg-[#004785] shadow-sm dark:border-blue-600 dark:bg-blue-600'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-[#e5e5e5]'}`}>
                        {role.roleName}
                      </span>
                    </div>
                    <div className={`mt-1 text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-[#999999]'}`}>
                      Nhấp để xem và cấu hình quyền
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Cột phải: Phân quyền theo Trang */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          {!selectedRoleId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-[#666666]">
              <Icon name="admin_panel_settings" size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-bold text-slate-500 dark:text-[#999999]">
                Chưa chọn chức vụ nào.
              </p>
              <p className="text-xs">Hãy chọn một chức vụ ở cột bên trái để bắt đầu phân quyền.</p>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
                    Quyền hạn của:{' '}
                    <span className="text-[#004785] dark:text-blue-400">
                      {selectedRole?.roleName === 'Sales Staff' ? 'SalesStaff' :
                       selectedRole?.roleName === 'Inventory Staff' ? 'InventoryStaff' :
                       selectedRole?.roleName}
                    </span>
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-[#999999]">
                    Bật / tắt Switch trang và chọn quyền con để phân quyền chi tiết.
                  </p>
                </div>
              </div>

              <div className="no-scrollbar flex-1 overflow-y-auto p-5">
                {isSuperAdmin ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-500">
                    <Icon name="info" size={16} />
                    Super Admin được mặc định toàn quyền và không thể chỉnh sửa từ giao diện.
                  </div>
                ) : (
                  <PageBasedPermissionSelector
                    selectedCodes={selectedCodes}
                    onTogglePage={handleTogglePage}
                    onTogglePermission={handleTogglePermission}
                  />
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
