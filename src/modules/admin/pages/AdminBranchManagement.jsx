import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getAdminBranches,
  updateAdminBranch,
  deleteAdminBranch,
  restoreAdminBranch,
  hardDeleteAdminBranch,
  getUserList,
} from '../services/adminService';

const PAGE_SIZE = 20;

const AdminBranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchName: '',
    phone: '',
    address: '',
    city: '',
    type: '',
    managerUserId: '',
    isActive: 1,
  });
  const [formErrors, setFormErrors] = useState({});

  const validateBranchForm = (data) => {
    const errors = {};
    const trimmedBranchName = (data.branchName || '').trim();
    const trimmedPhone = (data.phone || '').trim();
    const trimmedAddress = (data.address || '').trim();
    const trimmedType = (data.type || '').trim();

    if (!trimmedBranchName) {
      errors.branchName = 'Tên cửa hàng là bắt buộc.';
    } else if (trimmedBranchName.length > 100) {
      errors.branchName = 'Tên cửa hàng không được vượt quá 100 ký tự.';
    }

    if (!trimmedPhone) {
      errors.phone = 'Số điện thoại là bắt buộc.';
    } else if (!/^(03|05|07|08|09)\d{8}$/.test(trimmedPhone)) {
      errors.phone =
        'Số điện thoại phải là số Việt Nam hợp lệ (10 số, bắt đầu bằng 03/05/07/08/09).';
    }

    if (!trimmedAddress) {
      errors.address = 'Địa chỉ là bắt buộc.';
    } else if (trimmedAddress.length < 5 || trimmedAddress.length > 255) {
      errors.address = 'Địa chỉ phải có từ 5 đến 255 ký tự.';
    }

    if (!trimmedType) {
      errors.type = 'Loại cửa hàng là bắt buộc.';
    } else if (trimmedType.length < 2 || trimmedType.length > 50) {
      errors.type = 'Loại cửa hàng phải có từ 2 đến 50 ký tự.';
    }

    return errors;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchesData, ownersData] = await Promise.all([
        getAdminBranches({ pageSize: 1000, isActive: showDeleted ? undefined : 1 }),
        getUserList({ role: 'owner', pageSize: 1000 }),
      ]);
      setBranches(branchesData?.items || []);
      setOwners(ownersData?.items || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách cửa hàng.');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const openEditModal = (branch) => {
    setEditingBranch(branch);
    setFormData({
      branchName: branch.branchName || '',
      phone: branch.phone || '',
      address: branch.address || '',
      city: branch.city || '',
      type: branch.type || '',
      managerUserId: branch.managerUserId || '',
      isActive: branch.isActive !== undefined ? branch.isActive : 1,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateBranchForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      branchName: formData.branchName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      type: formData.type.trim(),
      managerUserId: formData.managerUserId || undefined,
      isActive: Number(formData.isActive),
    };

    try {
      await updateAdminBranch(editingBranch.branchId, payload);
      alert('Cập nhật cửa hàng thành công');
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  const handleDelete = async (branch) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xoá nháp cửa hàng "${branch.branchName}"? Cửa hàng sẽ bị ẩn khỏi hệ thống nhưng có thể khôi phục hoặc xoá hẳn sau.`
      )
    )
      return;
    try {
      await deleteAdminBranch(branch.branchId);
      alert('Đã xoá nháp cửa hàng.');
      fetchData();
    } catch (err) {
      console.error('Soft delete branch error:', err);
      alert(err.message || 'Xoá nháp thất bại');
    }
  };

  const handleRestore = async (branch) => {
    if (!window.confirm(`Khôi phục cửa hàng "${branch.branchName}"?`)) return;
    try {
      await restoreAdminBranch(branch.branchId);
      alert('Đã khôi phục cửa hàng.');
      fetchData();
    } catch (err) {
      console.error('Restore branch error:', err);
      alert(err.message || 'Khôi phục thất bại');
    }
  };

  const handleHardDelete = async (branch) => {
    if (
      !window.confirm(`XOÁ HẲN cửa hàng "${branch.branchName}"?\nHành động này không thể hoàn tác.`)
    )
      return;
    if (!window.confirm('Bạn chắc chắn 100%? Dữ liệu sẽ bị xoá vĩnh viễn.')) return;
    try {
      await hardDeleteAdminBranch(branch.branchId);
      alert('Đã xoá hẳn cửa hàng.');
      fetchData();
    } catch (err) {
      console.error('Hard delete branch error:', err);
      alert(err.message || 'Xoá hẳn thất bại');
    }
  };

  const filtered = branches.filter(
    (b) =>
      !search ||
      (b.branchName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.phone || '').includes(search) ||
      (b.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedBranches = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">Quản lý Cửa hàng</h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Danh sách cửa hàng toàn hệ thống.
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#333333] dark:bg-[#1a1a1a]">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-[#333333]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
              Danh sách Cửa hàng
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-[#333333] dark:text-[#999999]">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#808080]">
                <Icon name="search" size={16} />
              </div>
              <input
                placeholder="Tìm theo tên, SĐT, địa chỉ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs outline-none transition-colors focus:border-[#004785] dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4] dark:placeholder:text-[#808080]"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-[#b3b3b3]">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => {
                  setShowDeleted(e.target.checked);
                  setPage(1);
                }}
                className="h-3.5 w-3.5 rounded accent-[#004785]"
              />
              Hiện cả đã xoá nháp
            </label>
            <button
              onClick={fetchData}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
              title="Làm mới"
            >
              <Icon name="sync" size={18} />
            </button>
          </div>
        </div>

        {/* TABLE */}
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
          ) : pagedBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-[#808080]">
              <Icon name="store" size={40} className="mb-2 opacity-50" />
              <p className="text-sm font-semibold">Không có cửa hàng nào.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-900 dark:text-[#e5e5e5]">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-[#333333] dark:text-[#999999]">
                  <th className="px-4 py-3">Tên Cửa Hàng</th>
                  <th className="px-4 py-3">Chủ Cửa Hàng</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Địa Chỉ</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#333333]">
                {pagedBranches.map((b) => (
                  <tr
                    key={b.branchId}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
                  >
                    <td className="px-4 py-3 font-bold">{b.branchName}</td>
                    <td className="px-4 py-3">{b.managerFullName || b.managerEmail || '—'}</td>
                    <td className="px-4 py-3">{b.phone || '—'}</td>
                    <td className="max-w-[200px] truncate px-4 py-3">{b.address || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {b.isActive ? 'Hoạt động' : 'Đã xoá nháp'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#004785] dark:hover:bg-[#333333] dark:hover:text-blue-400"
                          title="Sửa"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        {b.isActive ? (
                          <button
                            onClick={() => handleDelete(b)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                            title="Xoá nháp"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(b)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                              title="Khôi phục"
                            >
                              <Icon name="restore" size={16} />
                            </button>
                            <button
                              onClick={() => handleHardDelete(b)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-500"
                              title="Xoá hẳn (không thể hoàn tác)"
                            >
                              <Icon name="delete" size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                value={PAGE_SIZE}
                onChange={() => {}}
                className="rounded border border-slate-300 px-2 py-1 text-xs outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
              >
                <option value={20}>20 dòng</option>
              </select>
            </div>
            <span>
              {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(page * PAGE_SIZE, filtered.length)} trong tổng số {filtered.length} cửa hàng
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
              Trang {page} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#b3b3b3] dark:hover:bg-[#333333]"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#333333] dark:bg-[#0f0f0f]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-[#333333]">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">
                Sửa Cửa Hàng
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:text-[#666666] dark:hover:text-[#e5e5e5]"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                    Tên cửa hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-transparent p-2 text-xs text-slate-900 outline-none dark:text-[#e5e5e5] ${formErrors.branchName ? 'border-red-500' : 'border-slate-200 dark:border-[#333333]'} focus:border-[#004785] dark:focus:border-blue-500`}
                  />
                  {formErrors.branchName && (
                    <p className="mt-1 text-[10px] text-red-500">{formErrors.branchName}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-transparent p-2 text-xs text-slate-900 outline-none dark:text-[#e5e5e5] ${formErrors.phone ? 'border-red-500' : 'border-slate-200 dark:border-[#333333]'} focus:border-[#004785] dark:focus:border-blue-500`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-[10px] text-red-500">{formErrors.phone}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                    Loại cửa hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border bg-transparent p-2 text-xs text-slate-900 outline-none dark:text-[#e5e5e5] ${formErrors.type ? 'border-red-500' : 'border-slate-200 dark:border-[#333333]'} focus:border-[#004785] dark:focus:border-blue-500`}
                  />
                  {formErrors.type && (
                    <p className="mt-1 text-[10px] text-red-500">{formErrors.type}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full rounded-lg border bg-transparent p-2 text-xs text-slate-900 outline-none dark:text-[#e5e5e5] ${formErrors.address ? 'border-red-500' : 'border-slate-200 dark:border-[#333333]'} focus:border-[#004785] dark:focus:border-blue-500`}
                />
                {formErrors.address && (
                  <p className="mt-1 text-[10px] text-red-500">{formErrors.address}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                  Chủ cửa hàng
                </label>
                <select
                  name="managerUserId"
                  value={formData.managerUserId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-transparent p-2 text-xs text-slate-900 outline-none focus:border-[#004785] dark:border-[#333333] dark:text-[#e5e5e5] dark:focus:border-blue-500 [&>option]:bg-white dark:[&>option]:bg-[#0f0f0f]"
                >
                  <option value="">-- Chưa gán Chủ cửa hàng --</option>
                  {owners.map((owner) => (
                    <option key={owner.userId} value={owner.userId}>
                      {owner.fullName || owner.userName} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive === 1}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded accent-[#004785]"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs font-semibold text-slate-700 dark:text-[#b3b3b3]"
                >
                  Trạng thái Hoạt động
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-[#333333]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-[#272727] dark:text-[#e5e5e5] dark:hover:bg-[#333333]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#004785] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Cập nhật
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
