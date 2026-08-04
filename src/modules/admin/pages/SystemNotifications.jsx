import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getNotificationList,
  createNotification,
  updateNotification,
  sendNotification,
  cancelNotification,
  deleteNotification,
  getAdminBranches,
} from '../services/adminService';

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetType: 'ALL_USERS',
    branchId: '',
    priority: 'NORMAL',
    scheduledFor: '',
  });

  const [branches, setBranches] = useState([]);

  const fetchBranches = useCallback(async () => {
    try {
      const data = await getAdminBranches({ pageSize: 100 });
      setBranches(data?.items || []);
    } catch (err) {
      console.error('Lỗi tải danh sách cửa hàng', err);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    getNotificationList()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError('Không tải được danh sách thông báo.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      targetType: 'ALL_USERS',
      branchId: '',
      priority: 'NORMAL',
      scheduledFor: '',
    });
  };

  const handleEditClick = (notif) => {
    setEditingId(notif.notificationId);
    setFormData({
      title: notif.title || '',
      content: notif.content || '',
      targetType: notif.target === 'ALL' ? 'ALL_USERS' : notif.target === 'OWNER' ? 'OWNERS' : 'STAFFS',
      branchId: notif.branchId || '',
      priority: notif.isUrgent ? 'HIGH' : 'NORMAL',
      scheduledFor: notif.scheduledAt
        ? new Date(notif.scheduledAt).toISOString().slice(0, 16)
        : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert('Vui lòng nhập Tiêu đề và Nội dung!');

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        target: formData.targetType === 'ALL_USERS' ? 'ALL' : formData.targetType === 'OWNERS' ? 'OWNER' : 'STAFF',
        branchId: formData.branchId || null,
        isUrgent: formData.priority === 'HIGH',
        scheduledAt: formData.scheduledFor || null
      };

      if (editingId) {
        await updateNotification(editingId, payload);
        alert('Cập nhật thông báo thành công!');
      } else {
        await createNotification(payload);
        alert('Tạo thông báo thành công!');
      }
      resetForm();
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleSend = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn PHÁT SÓNG thông báo này ngay lập tức?')) return;
    try {
      await sendNotification(id);
      alert('Đã gửi thông báo!');
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Lỗi gửi thông báo');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Hủy bỏ thông báo này?')) return;
    try {
      await cancelNotification(id);
      alert('Đã hủy thông báo!');
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Lỗi hủy thông báo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa vĩnh viễn thông báo này?')) return;
    try {
      await deleteNotification(id);
      alert('Đã xóa thông báo!');
      fetchNotifications();
    } catch (err) {
      alert(err.message || 'Lỗi xóa thông báo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-[#333333] pb-3">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
          Thông Báo Hệ Thống
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
          QUẢN LÝ VÀ PHÁT SÓNG THÔNG BÁO CHO NGƯỜI DÙNG
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT TRÁI: FORM */}
        <div className="h-fit rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-sm">
          <div className="border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              {editingId ? 'Sửa Thông Báo (Nháp)' : 'Tạo Thông Báo Mới'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600"
                placeholder="VD: Lịch bảo trì hệ thống"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                Nội dung *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="4"
                className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600"
                placeholder="Nội dung chi tiết..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                  Đối tượng
                </label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0f0f0f] dark:[&>option]:text-[#e5e5e5]"
                >
                  <option value="ALL_USERS">Tất cả người dùng</option>
                  <option value="OWNERS">Chủ cửa hàng</option>
                  <option value="STAFFS">Nhân viên</option>
                </select>
              </div>
              
              {(formData.targetType === 'OWNERS' || formData.targetType === 'STAFFS') && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                    Cửa hàng (Không bắt buộc)
                  </label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0f0f0f] dark:[&>option]:text-[#e5e5e5]"
                  >
                    <option value="">-- Tất cả cửa hàng --</option>
                    {branches.map(b => (
                      <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                  Mức độ ưu tiên
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0f0f0f] dark:[&>option]:text-[#e5e5e5]"
                >
                  <option value="LOW">Thấp</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Cao (Khẩn cấp)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500 dark:text-[#999999]">
                Lên lịch gửi (Không bắt buộc)
              </label>
              <input
                type="datetime-local"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                className="w-full rounded border border-slate-200 dark:border-[#333333] bg-transparent text-slate-900 dark:text-[#e5e5e5] p-2 text-xs outline-none focus:border-[#004785] dark:focus:border-blue-600 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-[#333333] pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded bg-slate-100 dark:bg-[#272727] px-3 py-2 text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#333333]"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-[#004785] dark:bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-[#004785] dark:bg-blue-600/90"
              >
                <Icon name="save" size={16} /> {editingId ? 'Lưu Nháp' : 'Tạo Nháp'}
              </button>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: LIST */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              Danh sách Thông báo
            </h2>
            <button
              onClick={fetchNotifications}
              className="text-[#004785] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Icon name="refresh" size={18} />
            </button>
          </div>
          <div className="overflow-x-auto p-0">
            {loading ? (
              <div className="p-8 text-center text-xs">Đang tải...</div>
            ) : error ? (
              <div className="p-8 text-center font-bold text-red-600 dark:text-red-500">{error}</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] text-[10px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                    <th className="px-4 py-3">Tiêu đề</th>
                    <th className="px-4 py-3">Ưu tiên</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
                  {notifications.map((n) => {
                    const isDraft = n.status === 'DRAFT' || n.status === 'SCHEDULED';
                    return (
                      <tr
                        key={n.notificationId}
                        className="transition-colors hover:bg-white dark:bg-[#0f0f0f]"
                      >
                        <td className="px-4 py-3">
                          <div
                            className="max-w-xs truncate text-sm font-bold text-slate-900 dark:text-[#e5e5e5]"
                            title={n.title}
                          >
                            {n.title}
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-500 dark:text-[#999999]">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[9px] font-bold ${n.isUrgent ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500' : 'bg-slate-100 dark:bg-[#272727] text-slate-500 dark:text-[#999999]'}`}
                          >
                            {n.isUrgent ? 'HIGH' : 'NORMAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${n.status === 'SENT' ? 'bg-green-100 text-green-800' : n.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {isDraft && (
                              <>
                                <button
                                  onClick={() => handleSend(n.notificationId)}
                                  className="rounded p-1 text-[#004785] dark:text-blue-400 hover:bg-[#004785] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                                  title="Gửi ngay"
                                >
                                  <Icon name="send" size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditClick(n)}
                                  className="rounded p-1 text-slate-400 dark:text-[#666666] hover:bg-slate-100 dark:hover:bg-[#272727] hover:text-slate-900 dark:hover:text-[#e5e5e5]"
                                  title="Sửa"
                                >
                                  <Icon name="edit" size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancel(n.notificationId)}
                                  className="rounded p-1 text-slate-400 dark:text-[#666666] hover:bg-red-50 dark:bg-red-900/30 hover:text-red-600 dark:text-red-500"
                                  title="Hủy lịch"
                                >
                                  <Icon name="cancel" size={16} />
                                </button>
                              </>
                            )}
                            {(isDraft || n.status === 'CANCELLED') && (
                              <button
                                onClick={() => handleDelete(n.notificationId)}
                                className="rounded p-1 text-slate-400 dark:text-[#666666] hover:bg-red-50 dark:bg-red-900/30 hover:text-red-600 dark:text-red-500"
                                title="Xóa vĩnh viễn"
                              >
                                <Icon name="delete" size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-500 dark:text-[#999999]">
                        Không có thông báo nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemNotifications;

