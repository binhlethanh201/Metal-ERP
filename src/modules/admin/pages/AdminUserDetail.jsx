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
} from '../services/adminService';
import ConfirmActionModal from '../components/ConfirmActionModal';
import AssignRoleModal from '../components/account/AssignRoleModal';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    message: '',
  });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: '', phoneNumber: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, activityData, roleData] = await Promise.all([
        getUserDetail(id),
        getUserActivities(id),
        getRoleList(),
      ]);
      setUser(userData);
      setActivities(Array.isArray(activityData) ? activityData : []);
      setRoles(Array.isArray(roleData) ? roleData : []);
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

  const handleToggleLock = async () => {
    try {
      const isLocking = user.isActive === 1 || user.isActive === true;
      await changeUserStatus(id, !isLocking);
      alert(isLocking ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
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

  if (loading || !user)
    return (
      <div className="p-8 text-center font-bold text-on-surface-variant">
        Đang tải chi tiết người dùng...
      </div>
    );

  const isActive = user.isActive === 1 || user.isActive === true;

  return (
    <div className="space-y-6">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate('/admin/users')}
        className="hover:text-primary-variant flex items-center gap-2 text-sm font-bold text-primary transition-colors"
      >
        <Icon name="arrow_back" size={18} /> QUAY LẠI DANH SÁCH
      </button>

      {/* HEADER CHI TIẾT */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-2xl font-bold uppercase text-on-primary-container shadow-inner">
            {(user.fullName || user.email).charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              {user.fullName || 'Chưa cập nhật tên'}
            </h1>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${isActive ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-red-200 bg-red-100 text-red-800'}`}
              >
                {isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ BỊ KHÓA'}
              </span>
              {(user.roles || []).map((r) => (
                <span
                  key={r.roleId}
                  className="rounded-full border border-secondary-container/50 bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container"
                >
                  {r.roleName}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC IN ĐẬM RÕ RÀNG */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-outline bg-surface-container-low px-5 py-3 text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:border-primary hover:text-primary"
          >
            <Icon name="edit" size={18} /> Sửa Thông Tin
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-outline bg-surface-container-low px-5 py-3 text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:border-primary hover:text-primary"
          >
            <Icon name="manage_accounts" size={18} /> Phân Quyền
          </button>

          <button
            onClick={handleResetPassword}
            className="flex items-center gap-2 rounded-lg border-2 border-outline bg-surface-container-low px-5 py-3 text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:border-primary hover:text-primary"
          >
            <Icon name="key" size={18} /> Cấp Lại Mật Khẩu
          </button>

          <button
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                type: 'lock',
                title: isActive ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN',
                message: `Bạn có chắc chắn muốn ${isActive ? 'khóa' : 'mở khóa'} tài khoản này?`,
              })
            }
            className={`flex items-center gap-2 rounded-lg border-2 px-5 py-3 text-xs font-black uppercase tracking-wider shadow-sm transition-all ${isActive ? 'border-error text-error hover:bg-error-container/30' : 'border-green-600 text-green-600 hover:bg-green-100/50'}`}
          >
            <Icon name={isActive ? 'lock' : 'lock_open'} size={18} />{' '}
            {isActive ? 'Khóa Tài Khoản' : 'Mở Khóa'}
          </button>
        </div>
      </div>

      {/* LỊCH SỬ HOẠT ĐỘNG */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-on-surface">
            <Icon name="history" size={20} className="text-primary" /> Lịch sử hoạt động gần đây
          </h2>
        </div>
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="py-10 text-center font-bold text-on-surface-variant">
              Chưa có lịch sử hoạt động nào được ghi nhận.
            </div>
          ) : (
            <div className="relative ml-4 space-y-8 border-l-2 border-outline-variant pb-4">
              {activities.map((log, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
                  <div className="text-sm font-black uppercase text-on-surface">{log.action}</div>
                  <div className="mt-1 text-xs font-bold text-primary">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm font-medium text-on-surface-variant shadow-sm">
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
        onConfirm={handleToggleLock}
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

      {/* Sửa thông tin Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="mb-4 text-base font-bold text-on-surface">Cập Nhật Thông Tin</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phoneNumber: e.target.value })
                  }
                  className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary/90"
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
