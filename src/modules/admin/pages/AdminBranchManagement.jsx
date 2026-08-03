import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getAdminBranches,
  createAdminBranch,
  updateAdminBranch,
  deleteAdminBranch,
  getUserList,
} from '../services/adminService';

const AdminBranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchName: '',
    phone: '',
    address: '',
    managerUserId: '',
    isActive: 1,
  });

  const fetchBranchesAndOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchesData, ownersData] = await Promise.all([
        getAdminBranches({ pageSize: 100 }),
        getUserList({ role: 'owner', pageSize: 1000 })
      ]);
      setBranches(branchesData?.items || []);
      setOwners(ownersData?.items || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách cửa hàng hoặc chủ cửa hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranchesAndOwners();
  }, [fetchBranchesAndOwners]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({ branchName: '', phone: '', address: '', managerUserId: '', isActive: 1 });
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      branchName: branch.branchName || '',
      phone: branch.phone || '',
      address: branch.address || '',
      managerUserId: branch.managerUserId || '',
      isActive: branch.isActive !== undefined ? branch.isActive : 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branchName) return alert('Vui lòng nhập tên cửa hàng');

    const payload = {
      ...formData,
      managerUserId: formData.managerUserId || undefined,
      isActive: Number(formData.isActive),
    };

    try {
      if (editingBranch) {
        await updateAdminBranch(editingBranch.branchId, payload);
        alert('Cập nhật cửa hàng thành công');
      } else {
        await createAdminBranch(payload);
        alert('Tạo cửa hàng thành công');
      }
      setShowModal(false);
      fetchBranchesAndOwners();
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá cửa hàng này?')) return;
    try {
      await deleteAdminBranch(id);
      alert('Đã xoá cửa hàng');
      fetchBranchesAndOwners();
    } catch (err) {
      alert(err.message || 'Xoá thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Quản lý Cửa hàng
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-slate-500 dark:text-[#999999]">
            DANH SÁCH CỬA HÀNG TOÀN HỆ THỐNG
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded bg-[#004785] px-4 py-2 text-xs font-bold text-white hover:bg-[#004785]/90 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Icon name="add" size={16} /> Tạo Cửa Hàng
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333333] dark:bg-[#0f0f0f]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#333333] dark:bg-[#1a1a1a]">
          <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
            Danh sách Cửa hàng
          </h2>
          <button
            onClick={fetchBranchesAndOwners}
            className="text-[#004785] hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>

        <div className="overflow-x-auto p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center font-bold text-red-600">{error}</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[10px] font-bold uppercase text-slate-500 dark:border-[#333333] dark:bg-[#0f0f0f] dark:text-[#999999]">
                  <th className="px-4 py-3">Tên Cửa Hàng</th>
                  <th className="px-4 py-3">Thông Tin Liên Hệ</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#333333]">
                {branches.map((b) => (
                  <tr key={b.branchId} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3 font-bold">{b.branchName}</td>
                    <td className="px-4 py-3">
                      <div>{b.phone || '-'}</div>
                      <div className="text-slate-500">{b.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded px-2 py-1 text-[10px] font-bold ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {b.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
                          title="Sửa"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.branchId)}
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-500"
                          title="Xoá"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      Không có cửa hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL TẠO/SỬA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-[#0f0f0f] dark:border dark:border-[#333333]">
            <h3 className="mb-4 text-lg font-bold uppercase tracking-tight text-slate-900 dark:text-[#e5e5e5]">
              {editingBranch ? 'Sửa Cửa Hàng' : 'Thêm Cửa Hàng Mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Tên cửa hàng *</label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  className="w-full rounded border border-slate-200 bg-transparent p-2 text-xs text-slate-900 dark:border-[#333333] dark:text-[#e5e5e5]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded border border-slate-200 bg-transparent p-2 text-xs text-slate-900 dark:border-[#333333] dark:text-[#e5e5e5]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Địa chỉ</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded border border-slate-200 bg-transparent p-2 text-xs text-slate-900 dark:border-[#333333] dark:text-[#e5e5e5]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive === 1}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-[#b3b3b3]">
                  Trạng thái Hoạt động
                </label>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">Chủ cửa hàng</label>
                <select
                  name="managerUserId"
                  value={formData.managerUserId}
                  onChange={handleInputChange}
                  className="w-full rounded border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-600 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0f0f0f] dark:[&>option]:text-[#e5e5e5]"
                >
                  <option value="">-- Chưa gán Chủ cửa hàng --</option>
                  {owners.map(owner => (
                    <option key={owner.userId} value={owner.userId}>
                      {owner.fullName || owner.userName} ({owner.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">Chọn một Chủ cửa hàng (Owner) để quản lý cửa hàng này.</p>
              </div>
              <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded bg-slate-100 px-4 py-2 text-xs font-bold hover:bg-slate-200 dark:bg-[#272727] dark:hover:bg-[#333333]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#004785] px-4 py-2 text-xs font-bold text-white hover:bg-[#004785]/90 dark:bg-blue-600"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBranchManagement;
