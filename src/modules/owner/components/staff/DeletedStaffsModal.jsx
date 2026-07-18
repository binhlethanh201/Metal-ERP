import React, { useState, useEffect } from 'react';
import Icon from '../../../../shared/components/Icon';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
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
        setDeletedStaffs(prev => prev.filter(s => s.userId !== userId));
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
        setDeletedStaffs(prev => prev.filter(s => s.userId !== userId));
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhân viên đã xóa"
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="sync" className="animate-spin text-2xl text-blue-600" />
          <span className="ml-2 text-slate-600">Đang tải...</span>
        </div>
      ) : deletedStaffs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Icon name="folder_open" className="text-5xl text-slate-300" />
          <p className="mt-4 font-medium">Không có nhân viên nào đã xóa</p>
          <p className="text-sm">Danh sách sẽ trống nếu chưa có nhân viên nào bị xóa</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                <th className="px-4 py-3">Tên nhân viên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ngày xóa</th>
                <th className="px-4 py-3">Còn lại</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {deletedStaffs.map((staff) => (
                <tr
                  key={staff.userId}
                  className="border-b border-slate-100 text-sm hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium">{staff.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{staff.email}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(staff.deletedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      staff.daysUntilPermanentDelete <= 3
                        ? 'bg-red-100 text-red-700'
                        : staff.daysUntilPermanentDelete <= 7
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {staff.daysUntilPermanentDelete} ngày
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(staff.userId)}
                        disabled={actionLoading === staff.userId}
                        className="flex items-center gap-1 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <Icon name="restore" size={16} />
                        Khôi phục
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDelete(staff.userId)}
                        className="flex items-center gap-1 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Icon name="delete" size={16} />
                        Xóa vĩnh viễn
                      </Button>
                    </div>

                    {confirmDelete === staff.userId && (
                      <div className="mt-2 rounded-lg bg-red-50 p-3">
                        <p className="mb-2 text-sm text-red-700">
                          Xác nhận xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handlePermanentDelete(staff.userId)}
                            disabled={actionLoading === staff.userId}
                          >
                            {actionLoading === staff.userId ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

export default DeletedStaffsModal;
