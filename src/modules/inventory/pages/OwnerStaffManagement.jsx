import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../../services/apiClient';

// ================================================================
// Constants
// ================================================================
const PERM_GROUPS = [
  {
    group: 'Bán hàng',
    items: [
      { code: 'Order:View', label: 'Xem đơn hàng', desc: 'Xem danh sách & chi tiết' },
      { code: 'Order:Create', label: 'Tạo đơn hàng', desc: 'Lập đơn mới cho khách' },
      { code: 'Order:Cancel', label: 'Huỷ đơn hàng', desc: 'Huỷ đơn chưa xử lý' },
      { code: 'Customer:View', label: 'Xem khách hàng', desc: 'Tra cứu thông tin KH' },
    ],
  },
  {
    group: 'Kho hàng',
    items: [
      { code: 'Stock:Import', label: 'Nhập kho', desc: 'Tạo phiếu nhập hàng' },
      { code: 'Stock:Approve', label: 'Duyệt nhập kho', desc: 'Xác nhận phiếu nhập' },
      { code: 'Inventory:View', label: 'Xem tồn kho', desc: 'Kiểm tra số lượng hàng' },
      { code: 'Stock:Transfer', label: 'Chuyển kho', desc: 'Điều chuyển giữa kho' },
    ],
  },
  {
    group: 'Báo cáo',
    items: [{ code: 'Report:View', label: 'Xem báo cáo', desc: 'Xem thống kê doanh thu' }],
  },
];

const SALES_DEFAULTS = ['Order:View', 'Order:Create', 'Customer:View'];
const INV_DEFAULTS = ['Stock:Import', 'Stock:Approve', 'Inventory:View'];
const PAGE_SIZE = 10;

// ================================================================
// Helpers
// ================================================================
const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'NV';
};

/**
 * OwnerStaffDto không có field `role`.
 * Suy ra vai trò từ permissionCodes để hiển thị UI.
 */
const inferRole = (permissionCodes = []) => {
  const hasSales = SALES_DEFAULTS.some((p) => permissionCodes.includes(p));
  const hasInv = INV_DEFAULTS.some((p) => permissionCodes.includes(p));
  if (hasSales && !hasInv) return 'SalesStaff';
  if (hasInv && !hasSales) return 'InventoryStaff';
  if (permissionCodes.length > 0) return 'Staff';
  return '';
};

// ================================================================
// Sub-components
// ================================================================
const RoleBadge = ({ permissionCodes = [] }) => {
  const role = inferRole(permissionCodes);
  if (role === 'SalesStaff')
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
        🛒 Bán hàng
      </span>
    );
  if (role === 'InventoryStaff')
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        📦 Kho hàng
      </span>
    );
  if (role === 'Staff')
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        👤 Nhân viên
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      Chưa có
    </span>
  );
};

const StatusBadge = ({ isActive }) =>
  isActive === 1 || isActive === true ? (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Hoạt động
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Đã khoá
    </span>
  );

// ================================================================
// Main component
// ================================================================
const OwnerStaffManagement = () => {
  // ---------- list state ----------
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // ---------- panel state ----------
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [editStaff, setEditStaff] = useState(null); // full OwnerStaffDto being edited
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'branch'

  // ---------- form state ----------
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
  });
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [quickRole, setQuickRole] = useState('');

  // assign-branch input (only used in edit mode / branch tab)
  const [assignBranchId, setAssignBranchId] = useState('');

  // ---------- feedback ----------
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ================================================================
  // Load list
  // ================================================================
  const loadStaffs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '100' });
      const res = await apiGet(`/api/owner/staffs?${params.toString()}`);
      // API trả về ApiResponse<PaginatedResponse<OwnerStaffDto>>
      const items = res?.data?.items ?? res?.items ?? [];
      setStaffs(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Không thể tải danh sách nhân viên.');
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffs();
  }, [loadStaffs]);

  // ================================================================
  // Client-side filter + pagination
  // ================================================================
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffs.filter((st) => {
      const matchSearch =
        !q ||
        (st.fullName ?? '').toLowerCase().includes(q) ||
        (st.email ?? '').toLowerCase().includes(q);
      const matchRole = !roleFilter || inferRole(st.permissionCodes) === roleFilter;
      return matchSearch && matchRole;
    });
  }, [staffs, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStaffs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ================================================================
  // Panel helpers
  // ================================================================
  const resetPanel = () => {
    setMode('create');
    setEditStaff(null);
    setActiveTab('info');
    setFormData({ fullName: '', email: '', username: '', password: '', phoneNumber: '' });
    setSelectedPerms([]);
    setQuickRole('');
    setAssignBranchId('');
    setError('');
    setSuccess('');
  };

  const openCreate = () => resetPanel();

  const openEdit = (staff) => {
    setMode('edit');
    setEditStaff(staff);
    setActiveTab('info');
    setFormData({
      fullName: staff.fullName ?? '',
      email: staff.email ?? '',
      username: '',
      password: '',
      phoneNumber: staff.phoneNumber ?? '',
    });
    const perms = staff.permissionCodes ?? [];
    setSelectedPerms(perms);
    const role = inferRole(perms);
    setQuickRole(role === 'SalesStaff' || role === 'InventoryStaff' ? role : '');
    setAssignBranchId('');
    setError('');
    setSuccess('');
  };

  // ================================================================
  // Permission helpers
  // ================================================================
  const applyQuickRole = (role) => {
    setQuickRole(role);
    if (role === 'SalesStaff') setSelectedPerms([...SALES_DEFAULTS]);
    else if (role === 'InventoryStaff') setSelectedPerms([...INV_DEFAULTS]);
    else setSelectedPerms([]);
  };

  const togglePerm = (code) => {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
    setQuickRole('');
  };

  // ================================================================
  // Submit: POST /api/owner/staffs
  // ================================================================
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ họ tên, email, tên đăng nhập và mật khẩu.');
      return;
    }

    /**
     * Backend (CreateStaffWithPermissionRequest):
     * - Nếu có defaultRoleType ("SalesStaff" | "InventoryStaff")
     *     → backend tự gán permission, KHÔNG đọc customPermissionCodes
     * - Nếu KHÔNG có defaultRoleType
     *     → backend đọc customPermissionCodes (có thể rỗng [])
     *
     * Quan trọng: CHỈ gửi một trong hai, không gửi cả hai.
     */
    const useQuickRole = quickRole === 'SalesStaff' || quickRole === 'InventoryStaff';

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      fullName: formData.fullName.trim(),
      password: formData.password,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      // Chỉ gửi một trong hai field bên dưới:
      ...(useQuickRole ? { defaultRoleType: quickRole } : { customPermissionCodes: selectedPerms }),
    };

    setSubmitting(true);
    try {
      await apiPost('/api/owner/staffs', payload);
      setSuccess('Tài khoản nhân viên đã được tạo thành công.');
      await loadStaffs();
      setTimeout(resetPanel, 1500);
    } catch (err) {
      // ApiResponse trả về: { success, message, errors[] }
      const apiMsg = err?.data?.message || err?.response?.data?.message;
      const apiErrors = err?.data?.errors || err?.response?.data?.errors;
      const detail = Array.isArray(apiErrors) && apiErrors.length > 0 ? apiErrors.join(', ') : null;
      setError(detail || apiMsg || err.message || 'Lỗi khi tạo nhân viên.');
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================================
  // Submit: PUT /api/owner/staffs/{id}
  // Payload: UpdateStaffPermissionRequest
  // ================================================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.email) {
      setError('Vui lòng điền đầy đủ họ tên và email.');
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      permissionCodes: selectedPerms, // field đúng theo UpdateStaffPermissionRequest
    };

    setSubmitting(true);
    try {
      await apiPut(`/api/owner/staffs/${editStaff.userId}`, payload);
      setSuccess('Đã lưu thay đổi thành công.');
      await loadStaffs();
    } catch (err) {
      const apiMsg = err?.data?.message || err?.response?.data?.message;
      const apiErrors = err?.data?.errors || err?.response?.data?.errors;
      const detail = Array.isArray(apiErrors) && apiErrors.length > 0 ? apiErrors.join(', ') : null;
      setError(detail || apiMsg || err.message || 'Lỗi khi cập nhật nhân viên.');
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================================
  // PUT /api/owner/staffs/{id}/toggle-status
  // ================================================================
  const toggleStatus = async (staff, e) => {
    e.stopPropagation();
    setError('');
    setSuccess('');
    try {
      await apiPut(`/api/owner/staffs/${staff.userId}/toggle-status`);
      setSuccess(`Đã ${staff.isActive === 1 ? 'khoá' : 'mở'} tài khoản ${staff.fullName}.`);
      await loadStaffs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Lỗi khi đổi trạng thái.');
    }
  };

  // ================================================================
  // POST /api/owner/staffs/{id}/assign-branch
  // ================================================================
  const handleAssignBranch = async () => {
    if (!assignBranchId.trim()) {
      setError('Vui lòng nhập Branch ID.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await apiPost(`/api/owner/staffs/${editStaff.userId}/assign-branch`, {
        branchId: assignBranchId.trim(),
      });
      setSuccess('Đã gán chi nhánh thành công.');
      setAssignBranchId('');
      const updated = await apiGet(`/api/owner/staffs/${editStaff.userId}`);
      const dto = updated?.data ?? updated;
      setEditStaff(dto);
      await loadStaffs();
    } catch (err) {
      setError(err?.data?.message || err.message || 'Lỗi khi gán chi nhánh.');
    }
  };

  // ================================================================
  // DELETE /api/owner/staffs/{id}/unassign-branch/{branchId}
  // ================================================================
  const handleUnassignBranch = async (branchId) => {
    setError('');
    setSuccess('');
    try {
      await apiDelete(`/api/owner/staffs/${editStaff.userId}/unassign-branch/${branchId}`);
      setSuccess('Đã gỡ chi nhánh thành công.');
      const updated = await apiGet(`/api/owner/staffs/${editStaff.userId}`);
      const dto = updated?.data ?? updated;
      setEditStaff(dto);
      await loadStaffs();
    } catch (err) {
      setError(err?.data?.message || err.message || 'Lỗi khi gỡ chi nhánh.');
    }
  };

  // ================================================================
  // Render
  // ================================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân viên</h1>
        <p className="text-sm text-slate-500">
          Thêm tài khoản, phân công quyền hạn và quản lý nhân viên trong chi nhánh của bạn.
        </p>
      </div>

      {/* Global alerts (toggle-status, etc.) */}
      {success && !editStaff && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}
      {error && !editStaff && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          ✗ {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ============================================================
            LEFT — Staff list
        ============================================================ */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Danh sách nhân viên</h2>
              <p className="text-sm text-slate-500">{filtered.length} nhân viên</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              ➕ Thêm nhân viên
            </button>
          </div>

          {/* Search & filter */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-purple-400 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-sm text-slate-400">🔍</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
            >
              <option value="">Tất cả vai trò</option>
              <option value="SalesStaff">Nhân viên bán hàng</option>
              <option value="InventoryStaff">Nhân viên kho</option>
              <option value="Staff">Nhân viên khác</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nhân viên</th>
                  {/* <th className="px-4 py-3 text-left font-medium text-slate-600">Chi nhánh</th> */}
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Vai trò</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Quyền hạn</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : paginatedStaffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      👥 Không có nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  paginatedStaffs.map((st) => {
                    const isActive = st.isActive === 1 || st.isActive === true;
                    const perms = st.permissionCodes ?? [];
                    return (
                      <tr
                        key={st.userId}
                        onClick={() => openEdit(st)}
                        className="cursor-pointer border-b border-slate-200 transition hover:bg-slate-50"
                      >
                        {/* Nhân viên */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                              {getInitials(st.fullName)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{st.fullName}</div>
                              <div className="text-xs text-slate-500">{st.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Chi nhánh */}
                        {/* <td className="px-4 py-3 text-xs text-slate-600">
                          {st.branchName ?? <span className="text-slate-400">—</span>}
                        </td> */}

                        {/* Vai trò */}
                        <td className="px-4 py-3">
                          <RoleBadge permissionCodes={perms} />
                        </td>

                        {/* Quyền hạn */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {perms.slice(0, 2).map((p) => (
                              <span
                                key={p}
                                className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                              >
                                {p}
                              </span>
                            ))}
                            {perms.length > 2 && (
                              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                                +{perms.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-3">
                          <StatusBadge isActive={st.isActive} />
                        </td>

                        {/* Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => toggleStatus(st, e)}
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {isActive ? 'Khoá' : 'Mở'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              {filtered.length > 0
                ? `Hiển thị ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} trong ${filtered.length}`
                : '0 kết quả'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
              >
                ←
              </button>
              <span className="px-1 py-1">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded px-3 py-1 hover:bg-slate-100 disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT — Create / Edit panel
        ============================================================ */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          {/* Panel header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {mode === 'create'
                  ? 'Thêm nhân viên mới'
                  : (editStaff?.fullName ?? 'Cài đặt tài khoản')}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? 'Điền thông tin và cấp quyền' : 'Cập nhật thông tin & quyền'}
              </p>
            </div>
            {mode === 'edit' && (
              <button
                onClick={resetPanel}
                className="text-xl leading-none text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Panel alerts */}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ✗ {error}
            </div>
          )}

          {/* Tabs — only in edit mode */}
          {mode === 'edit' && (
            <div className="mb-4 flex gap-2 border-b border-slate-200 pb-2">
              {['info'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === tab
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'info' ? '📋 Thông tin' : '🏢 Chi nhánh'}
                </button>
              ))}
            </div>
          )}

          {/* ---- TAB: INFO (create or edit) ---- */}
          {(mode === 'create' || activeTab === 'info') && (
            <form onSubmit={mode === 'create' ? handleCreate : handleUpdate} className="space-y-4">
              {/* Họ tên + SĐT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nhanvien@email.com"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  required
                />
              </div>

              {/* Username + Password — chỉ hiện khi tạo mới */}
              {mode === 'create' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="nhanvien01"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Chi nhánh hiện tại (chỉ hiện trong edit, dùng tab Branch để thay đổi) */}
              {/* {mode === 'edit' && (
                <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  🏢 Chi nhánh hiện tại:{' '}
                  <span className="font-medium text-slate-800">
                    {editStaff?.branchName ?? <em className="text-slate-400">Chưa có</em>}
                  </span>
                  {editStaff?.branchId && (
                    <span className="ml-1 text-slate-400">({editStaff.branchId})</span>
                  )}
                </div>
              )} */}

              <hr className="border-slate-200" />

              {/* Phân quyền */}
              <div>
                <p className="mb-1 text-sm font-medium text-slate-900">🔒 Cấp quyền tài khoản</p>
                <p className="mb-3 text-xs text-slate-500">
                  Chọn nhanh theo vai trò hoặc tuỳ chỉnh từng quyền:
                </p>

                {/* Quick role buttons */}
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { role: 'SalesStaff', label: 'Bán hàng', icon: '🛒' },
                    { role: 'InventoryStaff', label: 'Kho hàng', icon: '📦' },
                    { role: '', label: 'Tuỳ chỉnh', icon: '⚙️' },
                  ].map(({ role, label, icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => applyQuickRole(role)}
                      className={`rounded border-2 px-3 py-2 text-center text-xs font-medium transition ${
                        quickRole === role
                          ? role === 'SalesStaff'
                            ? 'border-purple-400 bg-purple-100 text-purple-700'
                            : role === 'InventoryStaff'
                              ? 'border-green-400 bg-green-100 text-green-700'
                              : 'border-slate-400 bg-slate-100 text-slate-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mb-0.5">{icon}</div>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Permission checkboxes */}
                <div className="space-y-3">
                  {PERM_GROUPS.map((grp) => (
                    <div key={grp.group}>
                      <p className="mb-2 text-xs font-medium text-slate-600">{grp.group}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {grp.items.map((item) => (
                          <label
                            key={item.code}
                            className={`flex cursor-pointer items-start gap-2 rounded border px-2 py-1.5 text-xs transition ${
                              selectedPerms.includes(item.code)
                                ? 'border-purple-300 bg-purple-50'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPerms.includes(item.code)}
                              onChange={() => togglePerm(item.code)}
                              className="mt-0.5 accent-purple-600"
                            />
                            <div>
                              <div className="font-medium text-slate-900">{item.label}</div>
                              <div className="text-slate-500">{item.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {submitting
                    ? 'Đang lưu…'
                    : mode === 'create'
                      ? '💾 Tạo tài khoản'
                      : '💾 Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={resetPanel}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Huỷ
                </button>
              </div>
            </form>
          )}

          {/* ---- TAB: BRANCH (edit only) ---- */}
          {mode === 'edit' && activeTab === 'branch' && (
            <div className="space-y-4">
              {/* Chi nhánh hiện tại */}
              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Chi nhánh hiện tại</p>
                {editStaff?.branchId ? (
                  <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-800">
                      🏢 {editStaff.branchName ?? editStaff.branchId}
                    </span>
                    <button
                      onClick={() => handleUnassignBranch(editStaff.branchId)}
                      className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      ✕ Gỡ
                    </button>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">Chưa được gán vào chi nhánh nào.</p>
                )}
              </div>

              {/* Gán chi nhánh mới — POST /{id}/assign-branch */}
              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Gán chi nhánh mới</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignBranchId}
                    onChange={(e) => setAssignBranchId(e.target.value)}
                    placeholder="Branch ID (UUID)"
                    className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    onClick={handleAssignBranch}
                    className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Gán
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Nhập đúng UUID của chi nhánh. Nhân viên không thể gán 2 lần vào cùng chi nhánh.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerStaffManagement;
