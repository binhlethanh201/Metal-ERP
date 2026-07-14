import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getNotificationList,
  createNotification,
  updateNotification,
  sendNotification,
  cancelNotification,
  deleteNotification,
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
    priority: 'NORMAL',
    scheduledFor: '',
  });

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
      priority: 'NORMAL',
      scheduledFor: '',
    });
  };

  const handleEditClick = (notif) => {
    setEditingId(notif.notificationId);
    setFormData({
      title: notif.title || '',
      content: notif.content || '',
      targetType: notif.targetType || 'ALL_USERS',
      priority: notif.priority || 'NORMAL',
      scheduledFor: notif.scheduledFor
        ? new Date(notif.scheduledFor).toISOString().slice(0, 16)
        : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert('Vui lòng nhập Tiêu đề và Nội dung!');

    try {
      const payload = { ...formData };
      if (!payload.scheduledFor) payload.scheduledFor = null;

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
      <div className="border-b border-outline-variant pb-3">
        <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
          Thông Báo Hệ Thống
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
          QUẢN LÝ VÀ PHÁT SÓNG THÔNG BÁO CHO NGƯỜI DÙNG
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT TRÁI: FORM */}
        <div className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface">
              {editingId ? 'Sửa Thông Báo (Nháp)' : 'Tạo Thông Báo Mới'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="VD: Lịch bảo trì hệ thống"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                Nội dung *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="4"
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
                placeholder="Nội dung chi tiết..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                  Đối tượng
                </label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  className="w-full rounded border border-outline-variant p-2 text-xs outline-none"
                >
                  <option value="ALL_USERS">Tất cả người dùng</option>
                  <option value="OWNERS">Chỉ Chủ cửa hàng</option>
                  <option value="STAFFS">Chỉ Nhân viên</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                  Mức độ ưu tiên
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded border border-outline-variant p-2 text-xs outline-none"
                >
                  <option value="LOW">Thấp</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Cao (Khẩn cấp)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                Lên lịch gửi (Không bắt buộc)
              </label>
              <input
                type="datetime-local"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                className="w-full rounded border border-outline-variant p-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-outline-variant pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded bg-surface-container-high px-3 py-2 text-xs font-bold hover:bg-surface-container-highest"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary/90"
              >
                <Icon name="save" size={16} /> {editingId ? 'Lưu Nháp' : 'Tạo Nháp'}
              </button>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: LIST */}
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3">
            <h2 className="text-sm font-bold uppercase tracking-tight text-on-surface">
              Danh sách Thông báo
            </h2>
            <button
              onClick={fetchNotifications}
              className="hover:text-primary-variant text-primary"
            >
              <Icon name="refresh" size={18} />
            </button>
          </div>
          <div className="overflow-x-auto p-0">
            {loading ? (
              <div className="p-8 text-center text-xs">Đang tải...</div>
            ) : error ? (
              <div className="p-8 text-center font-bold text-error">{error}</div>
            ) : (
              <table className="w-full text-left text-xs text-on-surface">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-lowest text-[10px] font-bold uppercase text-on-surface-variant">
                    <th className="px-4 py-3">Tiêu đề</th>
                    <th className="px-4 py-3">Ưu tiên</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {notifications.map((n) => {
                    const isDraft = n.status === 'DRAFT' || n.status === 'SCHEDULED';
                    return (
                      <tr
                        key={n.notificationId}
                        className="transition-colors hover:bg-surface-container-lowest"
                      >
                        <td className="px-4 py-3">
                          <div
                            className="max-w-xs truncate text-sm font-bold text-on-surface"
                            title={n.title}
                          >
                            {n.title}
                          </div>
                          <div className="mt-0.5 text-[10px] text-on-surface-variant">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[9px] font-bold ${n.priority === 'HIGH' ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'}`}
                          >
                            {n.priority}
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
                                  className="rounded p-1 text-primary hover:bg-primary-container"
                                  title="Gửi ngay"
                                >
                                  <Icon name="send" size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditClick(n)}
                                  className="rounded p-1 text-outline hover:bg-surface-container-high hover:text-on-surface"
                                  title="Sửa"
                                >
                                  <Icon name="edit" size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancel(n.notificationId)}
                                  className="rounded p-1 text-outline hover:bg-error-container hover:text-error"
                                  title="Hủy lịch"
                                >
                                  <Icon name="cancel" size={16} />
                                </button>
                              </>
                            )}
                            {(isDraft || n.status === 'CANCELLED') && (
                              <button
                                onClick={() => handleDelete(n.notificationId)}
                                className="rounded p-1 text-outline hover:bg-error-container hover:text-error"
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
                      <td colSpan="4" className="px-4 py-8 text-center text-on-surface-variant">
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
