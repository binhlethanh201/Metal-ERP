import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import {
  getUserDetail,
  getUserActivities,
  changeUserStatus,
  resetUserPassword,
  getRoleList,
  assignUserRoles,
  updateUser,
  softDeleteUser,
  permanentDeleteUser,
  restoreUser,
  assignUserBranch,
  getAdminBranches,
} from '../services/adminService';
import ConfirmActionModal from '../components/ConfirmActionModal';
import AssignRoleModal from '../components/account/AssignRoleModal';
import AssignBranchModal from '../components/account/AssignBranchModal';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
  });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignBranchModalOpen, setIsAssignBranchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: '', phoneNumber: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, activityData, roleData, branchData] = await Promise.all([
        getUserDetail(id),
        getUserActivities(id),
        getRoleList(),
        getAdminBranches({ pageSize: 1000 }),
      ]);
      setUser(userData);
      setActivities(Array.isArray(activityData) ? activityData : []);
      setRoles(Array.isArray(roleData) ? roleData : []);
      setBranches(branchData?.items || []);
      setEditFormData({
        fullName: userData?.fullName || '',
        phoneNumber: userData?.phoneNumber || '',
      });
    } catch (error) {
      console.error('Lỗi tải chi tiết:', error);
      alert('Không thể tải dữ liệu người dùng!');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetPassword = async () => {
    const newPass = window.prompt(
      `Nhập mật khẩu mới cho tài khoản ${user.email}:\n(Ít nhất 6 ký tự)`
    );
    if (!newPass) return;
    if (newPass.length < 6) return alert('Mật khẩu phải có ít nhất 6 ký tự!');
    try {
      await resetUserPassword(id, newPass);
      alert('Đặt lại mật khẩu thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi khi đặt lại mật khẩu');
    }
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmModal.type === 'lock') {
        const isLocking = user.isActive === 1 || user.isActive === true;
        await changeUserStatus(id, !isLocking);
        alert(isLocking ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      } else if (confirmModal.type === 'soft_delete') {
        await softDeleteUser(id);
        alert('Đã xóa mềm tài khoản!');
      } else if (confirmModal.type === 'restore') {
        await restoreUser(id);
        alert('Đã khôi phục tài khoản!');
      } else if (confirmModal.type === 'permanent_delete') {
        await permanentDeleteUser(id);
        alert('Đã xóa vĩnh viễn tài khoản!');
      }
      setConfirmModal({ isOpen: false });
      fetchData();
    } catch (err) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleAssignRoles = async (userId, roleIds) => {
    try {
      await assignUserRoles(userId, roleIds);
      alert('Cập nhật quyền thành công!');
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Cập nhật quyền thất bại');
    }
  };

  const handleAssignBranch = async (userId, branchId) => {
    try {
      await assignUserBranch(userId, branchId);
      alert('Gán cửa hàng thành công!');
      setIsAssignBranchModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Gán cửa hàng thất bại');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, editFormData);
      alert('Cập nhật thông tin thành công!');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Cập nhật thông tin thất bại');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 dark:text-[#808080]">
        <Icon name="sync" className="mr-2 animate-spin text-xl" />
        <span className="text-sm font-semibold">Đang tải chi tiết người dùng...</span>
      </div>
    );
  }

  const isActive = user.isActive === 1 || user.isActive === true;
  const isDeleted = user.status === 'DELETED' || user.status === 'PERMANENT_DELETED';

  return (
    <div className="w-full space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-[#004785] dark:text-[#999999] dark:hover:text-blue-400"
      >
        <Icon name="arrow_back" size={18} /> Quay lại danh sách
      </button>

      {/* HEADER */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a] md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004785] text-2xl font-bold uppercase text-white shadow-inner dark:bg-blue-600">
            {(user.fullName || user.email).charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e5e5e5]">
              {user.fullName || 'Chưa cập nhật tên'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
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
              {(user.roles || []).map((r) => (
                <span
                  key={r.roleId}
                  className="rounded-full bg-[#004785] px-2.5 py-1 text-[10px] font-bold text-white dark:bg-blue-600"
                >
                  {r.roleName}
                </span>
              ))}
              {user.defaultBranchName && (
                <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#004785] dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <Icon name="storefront" size={12} /> {user.defaultBranchName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#004785] hover:text-[#004785] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Icon name="edit" size={16} /> Sửa
              </button>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#004785] hover:text-[#004785] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Icon name="manage_accounts" size={16} /> Phân quyền
              </button>

              <button
                onClick={() => setIsAssignBranchModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#004785] hover:text-[#004785] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Icon name="storefront" size={16} /> Gán cửa hàng
              </button>

              <button
                onClick={handleResetPassword}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-[#004785] hover:text-[#004785] dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#e5e5e5] dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                <Icon name="key" size={16} /> Cấp lại MK
              </button>

              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    type: 'lock',
                    title: isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
                    message: `Bạn có chắc chắn muốn ${isActive ? 'khóa' : 'mở khóa'} tài khoản này?`,
                  })
                }
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  isActive
                    ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30'
                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30'
                }`}
              >
                <Icon name={isActive ? 'lock' : 'lock_open'} size={16} />
                {isActive ? 'Khóa' : 'Mở khóa'}
              </button>

              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    type: 'soft_delete',
                    title: 'Xóa tài khoản',
                    message: 'Bạn có chắc chắn muốn xóa tài khoản này? Tài khoản sẽ chuyển sang trạng thái Đã xóa và có thể khôi phục.',
                  })
                }
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                <Icon name="delete" size={16} /> Xóa
              </button>
            </>
          )}

          {user.status === 'DELETED' && (
            <>
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    type: 'restore',
                    title: 'Khôi phục tài khoản',
                    message: 'Khôi phục tài khoản này để tiếp tục sử dụng?',
                  })
                }
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <Icon name="restore" size={16} /> Khôi phục
              </button>

              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    type: 'permanent_delete',
                    title: 'Xóa vĩnh viễn',
                    message: 'Bạn có chắc chắn xóa VĨNH VIỄN tài khoản này? Hành động này không thể hoàn tác.',
                  })
                }
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-[#0f0f0f] dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Icon name="delete_forever" size={16} /> Xóa vĩnh viễn
              </button>
            </>
          )}
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'User ID', value: user.userId, icon: 'tag' },
          { label: 'Email', value: user.email, icon: 'mail' },
          { label: 'Số điện thoại', value: user.phoneNumber || '—', icon: 'phone' },
          { label: 'Ngày tạo', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—', icon: 'calendar_today' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 dark:text-[#808080]">
              <Icon name={item.icon} size={14} />
              {item.label}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5] break-all">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ACTIVITY HISTORY */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-[#333333]">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="history" size={18} className="text-[#004785] dark:text-blue-400" />
            Lịch sử hoạt động
          </h2>
        </div>
        <div className="p-5">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="inbox" size={40} className="mb-2 opacity-50" />
              <p className="text-sm font-semibold">Chưa có lịch sử hoạt động nào.</p>
            </div>
          ) : (
            <div className="relative ml-4 space-y-6 border-l-2 border-slate-200 pb-4 dark:border-[#333333]">
              {activities.map((log, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-[#004785] ring-4 ring-white dark:bg-blue-600 dark:ring-[#0f0f0f]" />
                  <div className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">{log.action}</div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-[#808080]">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#b3b3b3]">
                    {log.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xác nhận"
      />

      <AssignRoleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleAssignRoles}
        roles={roles}
        user={user}
      />

      <AssignBranchModal
        isOpen={isAssignBranchModalOpen}
        onClose={() => setIsAssignBranchModalOpen(false)}
        onSave={handleAssignBranch}
        branches={branches}
        user={user}
      />

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
            <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-[#e5e5e5]">Cập nhật thông tin</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5] dark:focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#004785] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;