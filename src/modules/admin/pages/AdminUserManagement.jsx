import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import CreateAccountModal from '../components/account/CreateAccountModal';
import { getUserList, createUser, getRoleList } from '../services/adminService';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([getUserList(), getRoleList()])
      .then(([userData, roleData]) => {
        const list = Array.isArray(userData) ? userData : userData?.items || [];
        setUsers(list);
        setRoles(Array.isArray(roleData) ? roleData : []);
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

  const handleCreateUser = async (formData) => {
    try {
      await createUser(formData);
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
      return <div className="p-8 text-center text-xs text-on-surface-variant">Đang tải...</div>;
    if (filtered.length === 0)
      return (
        <div className="p-8 text-center text-xs text-on-surface-variant">Không có dữ liệu.</div>
      );

    return (
      <table className="w-full text-left text-xs text-on-surface">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            <th className="px-4 py-3">User ID & Email</th>
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
              <tr key={user.userId} className="transition-colors hover:bg-surface-container-lowest">
                <td className="px-4 py-3">
                  <div className="font-mono text-[11px] font-bold text-on-surface">
                    {user.email}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-outline">{user.userId}</div>
                </td>
                <td className="px-4 py-3 font-bold">{user.fullName || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(user.roles || []).map((r) => (
                      <span
                        key={r.roleId}
                        className="rounded bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary-container"
                      >
                        {r.roleName}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-sm px-2 py-1 text-[10px] font-bold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {isActive ? 'ACTIVE' : 'LOCKED'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => navigate(`/admin/users/${user.userId}`)}
                    className="ml-auto flex items-center gap-1 rounded-md bg-surface-container-high px-3 py-1.5 text-xs font-bold transition-colors hover:bg-primary hover:text-on-primary"
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
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Quản lý Người Dùng
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            QUẢN TRỊ TÀI KHOẢN TOÀN HỆ THỐNG
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm hover:bg-primary/90"
        >
          <Icon name="person_add" size={16} /> Thêm Người Dùng
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-xs font-semibold text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
        {error ? (
          <div className="p-8 text-center font-bold text-error">{error}</div>
        ) : (
          renderUsersTable()
        )}
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
        roles={roles}
      />
    </div>
  );
};

export default AdminUserManagement;
