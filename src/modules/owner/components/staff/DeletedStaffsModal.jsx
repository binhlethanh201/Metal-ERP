import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { Modal } from '../../../../shared/components/Modal';
import { getDeletedStaffs, restoreStaff, permanentDeleteStaff } from '../../services/staffService';

const DeletedStaffsModal = ({ isOpen, onClose, onAction }) => {
  const [deletedStaffs, setDeletedStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isOpen) fetchDeletedStaffs();
  }, [isOpen]);

  const fetchDeletedStaffs = async () => {
    setLoading(true);
    try {
      const response = await getDeletedStaffs();
      if (response?.success && response?.data) {
        setDeletedStaffs(response.data);
      }
    } catch (error) {
      console.error('Error fetching deleted staffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await restoreStaff(userId);
      if (response?.success) {
        setDeletedStaffs((prev) => prev.filter((s) => s.userId !== userId));
        onAction?.('restore');
      }
    } catch (error) {
      console.error('Error restoring staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await permanentDeleteStaff(userId);
      if (response?.success) {
        setDeletedStaffs((prev) => prev.filter((s) => s.userId !== userId));
        setConfirmDelete(null);
        onAction?.('permanentDelete');
      }
    } catch (error) {
      console.error('Error permanently deleting staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nhân viên đã xóa" size="4xl">
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-[#999999]">
          <Icon name="sync" className="animate-spin text-3xl text-blue-600" />
          <p className="mt-3">Đang tải...</p>
        </div>
      </Modal>
    );
  }

  if (deletedStaffs.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nhân viên đã xóa" size="4xl">
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-slate-500 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
          <Icon name="folder_open" className="text-5xl text-slate-300 dark:text-[#666666]" />
          <p className="mt-4 font-medium">Không có nhân viên nào đã xóa</p>
          <p className="text-sm">
            Nhân viên bị xóa sẽ hiện ở đây trong 15 ngày trước khi bị xóa vĩnh viễn
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhân viên đã xóa"
      size="4xl"
      footer={
        <div className="flex w-full items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
          >
            Đóng
          </button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-[#999999]">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
            <tr>
              <th className="px-6 py-4 font-bold">Tên nhân viên</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">SĐT</th>
              <th className="px-6 py-4 font-bold">Ngày xóa</th>
              <th className="px-6 py-4 font-bold">Còn lại</th>
              <th className="px-6 py-4 text-right font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
            {deletedStaffs.map((staff) => (
              <tr key={staff.userId} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#272727]/60">
                <td className="px-6 py-4">
                  <div className="font-bold text-blue-900">{staff.fullName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">{staff.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-400 dark:text-[#808080]">{staff.phoneNumber || '---'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 dark:text-[#999999]">{formatDate(staff.deletedAt)}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                      staff.daysUntilPermanentDelete <= 3
                        ? 'bg-red-100 text-red-700'
                        : staff.daysUntilPermanentDelete <= 7
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        staff.daysUntilPermanentDelete <= 3
                          ? 'bg-red-600'
                          : staff.daysUntilPermanentDelete <= 7
                            ? 'bg-orange-600'
                            : 'bg-slate-600'
                      }`}
                    ></span>
                    {staff.daysUntilPermanentDelete} ngày
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {confirmDelete === staff.userId ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePermanentDelete(staff.userId)}
                        disabled={actionLoading === staff.userId}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === staff.userId ? 'Đang xóa...' : 'Xác nhận xóa'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleRestore(staff.userId)}
                        disabled={actionLoading === staff.userId}
                        className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      >
                        <Icon name="history" size={14} />
                        Khôi phục
                      </button>
                      <button
                        onClick={() => setConfirmDelete(staff.userId)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        <Icon name="delete" size={14} />
                        Xóa vĩnh viễn
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </Modal>
  );
};

export default DeletedStaffsModal;
