import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import { getDeletedStaffs, restoreStaff, permanentDeleteStaff } from '../../services/staffService';

const DeletedStaffsModal = ({ isOpen, onClose, onSuccess }) => {
  const [deletedStaffs, setDeletedStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedStaffs();
    }
  }, [isOpen]);

  const fetchDeletedStaffs = async () => {
    setLoading(true);
    try {
      const response = await getDeletedStaffs();
      if (response?.data?.success && response?.data?.data) {
        setDeletedStaffs(response.data.data);
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
      if (response?.data?.success) {
        setDeletedStaffs((prev) => prev.filter((s) => s.userId !== userId));
        onSuccess?.('restore');
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
      if (response?.data?.success) {
        setDeletedStaffs((prev) => prev.filter((s) => s.userId !== userId));
        setConfirmDelete(null);
        onSuccess?.('permanentDelete');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Icon name="delete" size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Nhân viên đã xóa</h2>
              <p className="text-xs text-slate-500">Tự động xóa vĩnh viễn sau 15 ngày</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Icon name="sync" className="animate-spin text-3xl text-blue-600" />
              <p className="mt-3">Đang tải...</p>
            </div>
          ) : deletedStaffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Icon name="folder_open" className="text-5xl text-slate-300" />
              <p className="mt-4 font-medium">Không có nhân viên nào đã xóa</p>
              <p className="text-sm">Nhân viên bị xóa sẽ hiện ở đây trong 15 ngày</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Tên nhân viên</th>
                  <th className="px-4 py-3 font-bold">Email</th>
                  <th className="px-4 py-3 font-bold">Ngày xóa</th>
                  <th className="px-4 py-3 font-bold">Còn lại</th>
                  <th className="px-4 py-3 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deletedStaffs.map((staff) => (
                  <tr key={staff.userId} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{staff.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{staff.email}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(staff.deletedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        staff.daysUntilPermanentDelete <= 3
                          ? 'bg-red-100 text-red-700'
                          : staff.daysUntilPermanentDelete <= 7
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          staff.daysUntilPermanentDelete <= 3
                            ? 'bg-red-600'
                            : staff.daysUntilPermanentDelete <= 7
                              ? 'bg-orange-600'
                              : 'bg-slate-600'
                        }`}></span>
                        {staff.daysUntilPermanentDelete} ngày
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
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
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRestore(staff.userId)}
                            disabled={actionLoading === staff.userId}
                            className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                          >
                            <Icon name="restore" size={14} />
                            Khôi phục
                          </button>
                          <button
                            onClick={() => setConfirmDelete(staff.userId)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletedStaffsModal;
