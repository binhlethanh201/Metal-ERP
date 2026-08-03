import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import StaffModal from '../../owner/components/staff/StaffModal';
import CreateAccountModal from '../components/account/CreateAccountModal';
import { getUserList, createOwner, createStaff, getRoleList, getPermissionList, getAdminBranches } from '../services/adminService';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [branches, setBranches] = useState([]);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getUserList({ status: statusFilter, pageSize: 1000 }), 
      getRoleList(),
      getPermissionList(),
      getAdminBranches({ pageSize: 1000 })
    ])
      .then(([userData, roleData, permData, branchData]) => {
        const list = Array.isArray(userData) ? userData : userData?.items || [];
        setUsers(list);
        setRoles(Array.isArray(roleData) ? roleData : []);
        setPermissions(Array.isArray(permData) ? permData : []);
        setBranches(branchData?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError(err.message || 'Không tải được danh sách tài khoản');
        setLoading(false);
      });
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData, statusFilter]);

  const handleCreateUser = async (formData) => {
    try {
      const submitData = {
        ...formData,
        roleName: formData.defaultRoleType,
        permissionCodes: formData.customPermissionCodes,
      };

      if (submitData.roleName === 'Owner') {
        await createOwner(submitData);
      } else {
        await createStaff(submitData);
      }
      alert('Tạo người dùng thành công!');
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Create error:', err);
      alert(err.message || 'Tạo người dùng thất bại');
    }
  };

  const renderUsersTable = () => {
    const filtered = users.filter(
      (u) =>
        !searchTerm ||
        (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading)
      return <div className="p-8 text-center text-xs text-slate-500 dark:text-[#999999]">Đang tải...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-[#999999]">Không có dữ liệu.</div>
      );

    return (
      <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            <th className="px-4 py-3">ID & Email người dùng</th>
            <th className="px-4 py-3">Họ Tên</th>
            <th className="px-4 py-3">Vai trò (Roles)</th>
            <th className="px-4 py-3 text-center">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {filtered.map((user) => {
            const isActive = user.isActive === 1 || user.isActive === true;
            return (
              <tr key={user.userId} className="transition-colors hover:bg-white dark:bg-[#0f0f0f]">
                <td className="px-4 py-3">
                  <div className="font-mono text-[11px] font-bold text-slate-900 dark:text-[#e5e5e5]">
                    {user.email}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-[#666666]">{user.userId}</div>
                </td>
                <td className="px-4 py-3 font-bold">{user.fullName || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set((user.roles || []).map((r) => {
                      const lower = (r.roleName || '').toLowerCase().replace(/\s+/g, '');
                      let displayRole = r.roleName;
                      if (lower.includes('sales')) displayRole = 'Nhân viên Bán hàng';
                      else if (lower.includes('inventory')) displayRole = 'Nhân viên Kho';
                      else if (lower === 'staff') displayRole = 'Nhân viên';
                      else if (lower === 'owner') displayRole = 'Chủ cửa hàng';
                      return displayRole;
                    }))).map((displayRole, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-[#004785] dark:bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                        >
                          {displayRole}
                        </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-sm px-2 py-1 text-[10px] font-bold ${user.status === 'DELETED' || user.status === 'PERMANENT_DELETED'
                        ? 'bg-gray-200 text-gray-800'
                        : isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {user.status === 'DELETED' || user.status === 'PERMANENT_DELETED'
                      ? 'ĐÃ XÓA'
                      : isActive
                        ? 'ĐANG HOẠT ĐỘNG'
                        : 'ĐÃ KHÓA'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => navigate(`/admin/users/${user.userId}`)}
                    className="ml-auto flex items-center gap-1 rounded-md bg-slate-100 dark:bg-[#272727] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[#004785] dark:bg-blue-600 hover:text-white"
                  >
                    <Icon name="visibility" size={14} /> CHI TIẾT
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Quản lý Người Dùng
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            QUẢN TRỊ TÀI KHOẢN TOÀN HỆ THỐNG
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded bg-[#004785] dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#004785] dark:bg-blue-600/90"
        >
          <Icon name="person_add" size={16} /> Thêm Người Dùng
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2 shadow-sm">
        {/* SEARCH BAR */}
        <div className="relative w-80">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#666666]"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-3 py-2 pl-9 text-xs font-semibold outline-none transition-colors focus:border-[#004785] focus:bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-[#e5e5e5] placeholder:text-slate-400"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-1">
          {[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'suspended', label: 'Đã khóa' },
            { value: 'deleted', label: 'Đã xóa' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-md px-4 py-2 text-xs font-bold transition-all ${statusFilter === tab.value
                  ? 'bg-[#004785] text-white shadow-sm'
                  : 'text-slate-500 dark:text-[#999999] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-sm">
        {error ? (
          <div className="p-8 text-center font-bold text-red-600 dark:text-red-500">{error}</div>
        ) : (
          renderUsersTable()
        )}
      </div>

      <StaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
        permissions={permissions}
        isAdminContext={true}
        roles={roles}
        branches={branches}
      />
    </div>
  );
};

export default AdminUserManagement;
