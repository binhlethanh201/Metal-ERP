import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import Icon from '../../../../shared/components/Icon';
import { getStaffs, toggleStaffStatus, permanentDeleteStaff } from '../../services/staffService';

const HiddenStaffsModal = ({ isOpen, onClose, onAction }) => {
  const [hiddenStaffs, setHiddenStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchHiddenStaffs();
    }
  }, [isOpen]);

  const fetchHiddenStaffs = async () => {
    setLoading(true);
    try {
      const response = await getStaffs({ page: 1, pageSize: 100, view: 'hidden' });
      if (response?.success && response?.data) {
        const items = response.data.items || response.data || [];
        setHiddenStaffs(items);
      }
    } catch (error) {
      console.error('Error fetching hidden staffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await toggleStaffStatus(userId);
      if (response?.success) {
        setHiddenStaffs((prev) => prev.filter((s) => s.userId !== userId));
        onAction?.('activate');
      }
    } catch (error) {
      console.error('Error activating staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await permanentDeleteStaff(userId);
      if (response?.success) {
        setHiddenStaffs((prev) => prev.filter((s) => s.userId !== userId));
        setConfirmDelete(null);
        onAction?.('permanentDelete');
      }
    } catch (error) {
      console.error('Error permanently deleting staff:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const footer = (
    <div className="flex w-full items-center justify-end">
      <button
        onClick={onClose}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#333333]"
      >
        Đóng
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nhân viên đã ẩn" size="4xl" footer={footer}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-[#999999]">
          <Icon name="sync" className="animate-spin text-3xl text-blue-600" />
          <p className="mt-3">Đang tải...</p>
        </div>
      ) : hiddenStaffs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-slate-500 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
          <Icon name="eye-off" className="text-5xl text-slate-300 dark:text-[#666666]" />
          <p className="mt-4 font-medium">Không có nhân viên nào đã ẩn</p>
          <p className="text-sm">
            Nhân viên bị ẩn (IsActive=0) sẽ hiện ở đây. Bạn có thể kích hoạt lại hoặc xóa vĩnh viễn.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-[#999999]">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-[#1a1a1a] dark:text-[#999999]">
                <tr>
                  <th className="px-6 py-4 font-bold">Tên nhân viên</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">SĐT</th>
                  <th className="px-6 py-4 font-bold">Vai trò</th>
                  <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                {hiddenStaffs.map((staff) => (
                  <tr
                    key={staff.userId}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-[#272727]/60"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-900 dark:text-blue-400">{staff.fullName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700 dark:text-[#b3b3b3]">{staff.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400 dark:text-[#808080]">
                        {staff.phoneNumber || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 dark:text-[#999999]">
                        {staff.roles?.join(', ') || 'Chưa gán'}
                      </div>
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
                            onClick={() => handleActivate(staff.userId)}
                            disabled={actionLoading === staff.userId}
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          >
                            <Icon name="user-check" size={14} />
                            Kích hoạt
                          </button>
                          <button
                            onClick={() => setConfirmDelete(staff.userId)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            <Icon name="trash-2" size={14} />
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
      )}
    </Modal>
  );
};

export default HiddenStaffsModal;
