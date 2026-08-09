import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import CreateAccountModal from '../components/account/CreateAccountModal';
import { getUserList, createOwner, createStaff, getRoleList, getAdminBranches } from '../services/adminService';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // Branch dropdown state
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const branchDropdownRef = useRef(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getUserList({ pageSize: 1000 }),
      getUserList({ status: 'deleted', pageSize: 1000 }),
      getRoleList(),
      getAdminBranches({ pageSize: 1000 }),
    ])
      .then(([activeData, deletedData, roleData, branchData]) => {
        const activeList = Array.isArray(activeData) ? activeData : activeData?.items || [];
        const deletedList = Array.isArray(deletedData) ? deletedData : deletedData?.items || [];
        setAllUsers([...activeList, ...deletedList]);
        setRoles(Array.isArray(roleData) ? roleData : []);
        setBranches(branchData?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError(err.message || 'Không tải được danh sách tài khoản');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) {
        setBranchDropdownOpen(false);
        setBranchSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBranchName = branchFilter
    ? branches.find((b) => b.branchId === branchFilter)?.branchName || 'Tất cả cửa hàng'
    : 'Tất cả cửa hàng';

  const uniqueBranches = [...new Map(branches.map((b) => [b.branchId, b])).values()];

  const branchSearchTrimmed = branchSearch.trim().toLowerCase();
  const filteredBranches = branchSearchTrimmed
    ? uniqueBranches.filter((b) => (b.branchName || '').toLowerCase().includes(branchSearchTrimmed))
    : uniqueBranches;

  const handleCreateUser = async (formData) => {
    try {
      if (formData.roleName === 'Owner') {
        await createOwner(formData);
      } else {
        await createStaff(formData);
      }
      alert('Tạo người dùng thành công!');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Create error:', err);
      alert(err.message || 'Tạo người dùng thất bại');
    }
  };

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      !search ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && (u.isActive === 1 || u.isActive === true) && u.status !== 'DELETED' && u.status !== 'PERMANENT_DELETED') ||
      (statusFilter === 'suspended' && (u.isActive === 0 || u.isActive === false) && u.status !== 'DELETED' && u.status !== 'PERMANENT_DELETED') ||
      (statusFilter === 'deleted' && (u.status === 'DELETED' || u.status === 'PERMANENT_DELETED'));

    const matchesRole =
      !roleFilter ||
      (u.roles || []).some((r) => {
        const name = (r.roleName || '').replace(/\s+/g, '').toLowerCase();
        const filter = roleFilter.replace(/\s+/g, '').toLowerCase();
        return name === filter;
      });

    const matchesBranch =
      !branchFilter ||
      u.defaultBranchId === branchFilter;

    return matchesSearch && matchesStatus && matchesRole && matchesBranch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const tabs = [
    { value: '', label: 'Tất cả', count: allUsers.length },
    { value: 'active', label: 'Đang hoạt động', count: allUsers.filter((u) => (u.isActive === 1 || u.isActive === true) && u.status !== 'DELETED' && u.status !== 'PERMANENT_DELETED').length },
    { value: 'suspended', label: 'Đã khóa', count: allUsers.filter((u) => (u.isActive === 0 || u.isActive === false) && u.status !== 'DELETED' && u.status !== 'PERMANENT_DELETED').length },
    { value: 'deleted', label: 'Đã xóa', count: allUsers.filter((u) => u.status === 'DELETED' || u.status === 'PERMANENT_DELETED').length },
  ];

  const activeCounts = {
    '': tabs[0].count,
    active: tabs[1].count,
    suspended: tabs[2].count,
    deleted: tabs[3].count,
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Quản lý Người Dùng</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Quản trị tài khoản toàn hệ thống.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#004785] px-4 py-2 text-base font-medium text-white transition-all duration-150 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Icon name="add" size={20} />
          Thêm Người Dùng
        </button>
      </div>

      {/* TABS + SEARCH */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 dark:border-[#333333]">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-[#004785] text-[#004785] dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[#999999] dark:hover:text-[#e5e5e5]'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-100 text-[#004785] dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-[#333333] dark:text-[#999999]'
                    }`}
                  >
                    {activeCounts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-colors focus:border-[#004785] dark:border-[#404040] dark:text-[#b3b3b3] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
            >
              <option value="">Tất cả vai trò</option>
              {(() => {
                const seen = new Set();
                const deduped = [];
                roles.forEach((r) => {
                  const name = (r.roleName || '').toLowerCase();
                  if (name === 'admin' || name === 'communityuser' || name === 'staff') return;
                  let key = null;
                  if (name === 'salesstaff' || name === 'sales staff') key = 'SalesStaff';
                  if (name === 'inventorystaff' || name === 'inventory staff') key = 'InventoryStaff';
                  if (!key) key = r.roleName;
                  if (seen.has(key)) return;
                  seen.add(key);
                  deduped.push({ ...r, roleName: key });
                });
                return deduped.map((r) => (
                  <option key={r.roleId} value={r.roleName}>{r.roleName}</option>
                ));
              })()}
            </select>

            <div className="relative" ref={branchDropdownRef}>
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition-colors ${
                  branchFilter
                    ? 'border-[#004785] text-[#004785] dark:border-blue-500 dark:text-blue-400'
                    : 'border-slate-200 text-slate-600 dark:border-[#404040] dark:text-[#b3b3b3]'
                } hover:border-[#004785] dark:hover:border-blue-500`}
              >
                <span className="max-w-[140px] truncate">{selectedBranchName}</span>
                <Icon name="chevron_down" size={14} className={branchDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {branchDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
                  <div className="border-b border-slate-100 p-2 dark:border-[#333333]">
                    <div className="relative">
                      <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]" />
                      <input
                        placeholder="Tìm cửa hàng..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto">
                    {!branchSearchTrimmed && (
                      <button
                        type="button"
                        onClick={() => { setBranchFilter(''); setBranchDropdownOpen(false); setBranchSearch(''); setPage(1); }}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a] ${!branchFilter ? 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-[#b3b3b3]'}`}
                      >
                        Tất cả cửa hàng
                      </button>
                    )}
                    {filteredBranches.map((b) => (
                      <button
                        key={b.branchId}
                        type="button"
                        onClick={() => { setBranchFilter(b.branchId); setBranchDropdownOpen(false); setBranchSearch(''); setPage(1); }}
                        className={`w-full truncate px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a] ${branchFilter === b.branchId ? 'bg-blue-50 text-[#004785] dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-[#b3b3b3]'}`}
                      >
                        {b.branchName}
                      </button>
                    ))}
                    {branchSearchTrimmed && filteredBranches.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-[#808080]">Không tìm thấy cửa hàng</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-56">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]">
                  <Icon name="search" size={18} />
                </div>
                <input
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 pl-10 text-sm transition-colors focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:placeholder:text-[#808080]"
              />
            </div>
          </div>
        </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="sync" className="mr-2 animate-spin text-xl" />
              <span className="text-sm font-semibold">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center font-bold text-red-600 dark:text-red-500">{error}</div>
          ) : pagedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="inbox" size={40} className="mb-2 opacity-50" />
              <p className="text-sm font-semibold">Không có dữ liệu.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#333333] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Họ Tên</th>
                  <th className="px-4 py-3">Cửa Hàng</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                {pagedUsers.map((user) => {
                  const isActive = user.isActive === 1 || user.isActive === true;
                  const isDeleted = user.status === 'DELETED' || user.status === 'PERMANENT_DELETED';
                  return (
                    <tr key={user.userId} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 dark:text-[#e5e5e5]">{user.email}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-[#666666]">ID: {user.userId}</p>
                      </td>
                      <td className="px-4 py-3 font-bold">{user.fullName || '—'}</td>
                      <td className="px-4 py-3 text-[11px] font-semibold text-[#004785] dark:text-blue-400">
                        {user.defaultBranchName || user.branchName || user.branch?.branchName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(user.roles || []).map((r) => (
                            <span
                              key={r.roleId}
                              className="rounded bg-[#004785] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-blue-600"
                            >
                              {r.roleName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isDeleted
                              ? 'bg-slate-100 text-slate-500 dark:bg-[#333333] dark:text-[#999999]'
                              : isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {isDeleted ? 'Đã xóa' : isActive ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/users/${user.userId}`)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
                          title="Chi tiết"
                        >
                          <Icon name="visibility" size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 dark:border-[#333333]">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
              >
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
                <option value={100}>100 dòng</option>
              </select>
            </div>
            <span>
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} trong tổng số {filtered.length} người dùng
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </button>
            <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
              Trang {page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
        roles={roles}
        branches={branches}
      />
    </div>
  );
};

export default AdminUserManagement;