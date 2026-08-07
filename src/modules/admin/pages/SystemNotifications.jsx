import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import { Modal } from '../../../shared/components/Modal';
import {
  getNotificationList,
  createNotification,
  updateNotification,
  sendNotification,
  deleteNotification,
  getAdminBranches,
} from '../services/adminService';

const EMPTY_FORM = {
  notificationId: null,
  title: '',
  content: '',
  targetType: 'ALL_USERS',
  branchId: '',
  priority: 'NORMAL',
};

const SystemNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [detailNotif, setDetailNotif] = useState(null);

  // Unified modal for create + edit
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

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

  const filteredNotifications =
    statusFilter === 'ALL'
      ? notifications
      : notifications.filter((n) => (n.status || '').toUpperCase() === statusFilter);
  const pagedFiltered = filteredNotifications.slice((page - 1) * pageSize, page * pageSize);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));

  const TARGET_LABEL = {
    ALL: 'Tất cả người dùng',
    OWNER: 'Chủ cửa hàng',
    STAFF: 'Nhân viên',
    COMMUNITY: 'Cộng đồng',
  };
  const STATUS_LABEL = {
    DRAFT: 'Nháp',
    SENT: 'Đã gửi',
    CANCELLED: 'Đã hủy',
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setFormModalOpen(true);
  };

  const openEditModal = (notif) => {
    setFormData({
      notificationId: notif.notificationId,
      title: notif.title || '',
      content: notif.content || '',
      targetType:
        notif.target === 'ALL' ? 'ALL_USERS' : notif.target === 'OWNER' ? 'OWNERS' : 'STAFFS',
      branchId: notif.branchId || '',
      priority: notif.isUrgent ? 'HIGH' : 'NORMAL',
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content)
      return alert('Vui lòng nhập Tiêu đề và Nội dung!');

    const isEdit = !!formData.notificationId;
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        target:
          formData.targetType === 'ALL_USERS'
            ? 'ALL'
            : formData.targetType === 'OWNERS'
              ? 'OWNER'
              : 'STAFF',
        branchId: formData.branchId || null,
        isUrgent: formData.priority === 'HIGH',
      };

      if (isEdit) {
        await updateNotification(formData.notificationId, payload);
        alert('Cập nhật thông báo thành công!');
      } else {
        await createNotification(payload);
        alert('Tạo thông báo thành công!');
      }
      setFormModalOpen(false);
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

  const isEdit = !!formData.notificationId;

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
            Thông Báo Hệ Thống
          </h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Quản lý và phát sóng thông báo cho người dùng.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold text-white hover:bg-black"
        >
          <Icon name="add" className="text-sm" /> Tạo thông báo
        </button>
      </div>

      {/* LIST */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-[#333333]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
              Danh sách Thông báo
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-[#333333] dark:text-[#999999]">
              {filteredNotifications.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#004785] dark:border-[#333333] dark:text-[#d4d4d4]"
              title="Lọc theo trạng thái"
            >
              <option value="ALL">Tất cả</option>
              <option value="DRAFT">Nháp</option>
              <option value="SENT">Đã gửi</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <button
              onClick={fetchNotifications}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
              title="Làm mới"
            >
              <Icon name="sync" size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="sync" className="mr-2 animate-spin text-xl" />
              <span className="text-sm font-semibold">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center font-bold text-red-600 dark:text-red-500">
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="campaign" size={40} className="mb-2 opacity-50" />
              <p className="text-sm font-semibold">
                {statusFilter === 'ALL'
                  ? 'Không có thông báo nào.'
                  : `Không có thông báo ở trạng thái "${STATUS_LABEL[statusFilter] || statusFilter}".`}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:text-[#999999]">
                  <th className="px-4 py-3">Tiêu đề</th>
                  <th className="px-4 py-3">Ưu tiên</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                {pagedFiltered.map((n) => {
                  const isDraft = n.status === 'DRAFT';
                  const isSent = n.status === 'SENT';
                  const isCancelled = n.status === 'CANCELLED';
                  return (
                    <tr
                      key={n.notificationId}
                      onClick={() => setDetailNotif(n)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="max-w-xs truncate text-sm font-bold text-slate-900 dark:text-[#e5e5e5]"
                          title={n.title}
                        >
                          {n.title}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400 dark:text-[#808080]">
                          {new Date(n.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            n.isUrgent
                              ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-[#333333] dark:text-[#999999]'
                          }`}
                        >
                          {n.isUrgent ? 'Khẩn' : 'Thường'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isSent
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : isCancelled
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {isSent ? 'Đã gửi' : isCancelled ? 'Đã hủy' : 'Nháp'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {isDraft && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSend(n.notificationId); }}
                                className="rounded-lg p-2 text-[#004785] transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                title="Gửi ngay"
                              >
                                <Icon name="send" size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(n); }}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
                                title="Sửa"
                              >
                                <Icon name="edit" size={16} />
                              </button>
                            </>
                          )}
                          {(isDraft || isCancelled) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(n.notificationId); }}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-500"
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
              {filteredNotifications.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filteredNotifications.length)} trong tổng số{' '}
              {filteredNotifications.length} thông báo
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
              Trang {page} / {filteredTotalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(filteredTotalPages, p + 1))}
              disabled={page >= filteredTotalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* FORM MODAL (create + edit) */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEdit ? 'Sửa Thông Báo' : 'Tạo Thông Báo Mới'}
        size="2xl"
        footer={
          <div className="flex w-full justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Icon name="save" size={16} /> {isEdit ? 'Lưu' : 'Tạo Nháp'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500"
              placeholder="VD: Lịch bảo trì hệ thống"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleFormChange}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500"
              placeholder="Nội dung chi tiết..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Đối tượng
              </label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
              >
                <option value="ALL_USERS">Tất cả người dùng</option>
                <option value="OWNERS">Chủ cửa hàng</option>
                <option value="STAFFS">Nhân viên</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Mức độ ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
              >
                <option value="LOW">Thấp</option>
                <option value="NORMAL">Bình thường</option>
                <option value="HIGH">Cao (Khẩn cấp)</option>
              </select>
            </div>
          </div>

          {(formData.targetType === 'OWNERS' || formData.targetType === 'STAFFS') && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Cửa hàng (Không bắt buộc)
              </label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none transition-colors focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
              >
                <option value="">-- Tất cả cửa hàng --</option>
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName} - {b.managerFullName || b.managerEmail || 'Chưa gắn chủ'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailNotif}
        onClose={() => setDetailNotif(null)}
        title="Chi tiết thông báo"
        size="2xl"
      >
        {detailNotif && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {detailNotif.title || '(Không có tiêu đề)'}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#999999]">
                  Tạo lúc{' '}
                  {detailNotif.createdAt
                    ? new Date(detailNotif.createdAt).toLocaleString('vi-VN')
                    : '—'}
                  {detailNotif.createdByName ? ` bởi ${detailNotif.createdByName}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    detailNotif.status === 'SENT'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : detailNotif.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {STATUS_LABEL[detailNotif.status] || detailNotif.status || '—'}
                </span>
                {detailNotif.isUrgent && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Khẩn cấp
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-[#d4d4d4]">
                {detailNotif.content || '(Không có nội dung)'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div className="font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Đối tượng
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {TARGET_LABEL[detailNotif.target] || detailNotif.target || '—'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div className="font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Cửa hàng
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {detailNotif.branchName ||
                    (detailNotif.branchId
                      ? detailNotif.branchId.slice(0, 8) + '…'
                      : 'Tất cả cửa hàng')}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
                <div className="font-semibold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                  Đã gửi lúc
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                  {detailNotif.sentAt ? new Date(detailNotif.sentAt).toLocaleString('vi-VN') : '—'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3 dark:border-[#333333]">
              <button
                type="button"
                onClick={() => setDetailNotif(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemNotifications;