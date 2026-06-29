import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../../shared/components/Card';
import {
  createSupplier,
  deleteSupplier,
  getSupplier,
  getSuppliers,
  updateSupplier,
} from '../services/inventoryService';

const emptyForm = {
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  taxCode: '',
  groupName: '',
  bankAccount: '',
  bankName: '',
  website: '',
  address: '',
  notes: '',
  status: 1,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
};

const getStatusLabel = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'inactive' || normalized === '0') return 'Ngừng hợp tác';
  if (normalized === 'active' || normalized === '1') return 'Đang hợp tác';
  return 'Đang hợp tác';
};

const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'inactive' || normalized === '0') return 'bg-slate-100 text-slate-700';
  return 'bg-emerald-50 text-emerald-700';
};

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [groupOptions, setGroupOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers({ pageNumber: 1, pageSize: 100 });
      const payload = response?.data ?? response;
      const list = Array.isArray(payload) ? payload : (payload?.items ?? []);
      const groups = Array.isArray(payload?.distinctGroups)
        ? payload.distinctGroups.filter(Boolean)
        : Array.from(new Set(list.map((item) => item.groupName).filter(Boolean)));
      setSuppliers(list);
      setGroupOptions(groups);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const keyword = search.toLowerCase();
    return suppliers.filter((supplier) => {
      const haystack =
        `${supplier.name || ''} ${supplier.groupName || ''} ${supplier.contactPhone || ''} ${supplier.contactEmail || ''} ${supplier.address || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(keyword);
      const normalizedStatus = String(supplier.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          (normalizedStatus === 'active' || normalizedStatus === '1')) ||
        (statusFilter === 'inactive' &&
          (normalizedStatus === 'inactive' || normalizedStatus === '0'));
      const matchesGroup =
        groupFilter === 'all' ||
        String(supplier.groupName || '').toLowerCase() === groupFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [search, statusFilter, groupFilter, suppliers]);

  const summary = useMemo(() => {
    const totalDebt = filteredSuppliers.reduce(
      (sum, supplier) => sum + Number(supplier.currentDebt || 0),
      0
    );
    const overdueDebt = filteredSuppliers.reduce(
      (sum, supplier) => sum + Number(supplier.dueDebt || 0),
      0
    );
    const activeSuppliers = filteredSuppliers.filter((supplier) => {
      const normalizedStatus = String(supplier.status || '').toLowerCase();
      return normalizedStatus === 'active' || normalizedStatus === '1';
    }).length;
    return {
      totalDebt,
      overdueDebt,
      activeSuppliers,
    };
  }, [filteredSuppliers]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedSupplier(null);
    setFormData(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openDetailModal = async (supplier) => {
    setModalMode('detail');
    setSelectedSupplier(null);
    setFormData(emptyForm);
    setError('');
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const response = await getSupplier(supplier.id);
      const detail = response?.data ?? response;
      setSelectedSupplier(detail);
      setFormData({
        supplierName: detail.name || '',
        contactPerson: detail.contactPerson || '',
        contactPhone: detail.contactPhone || '',
        contactEmail: detail.contactEmail || '',
        taxCode: detail.taxCode || '',
        groupName: detail.groupName || '',
        bankAccount: detail.bankAccount || '',
        bankName: detail.bankName || '',
        website: detail.website || '',
        address: detail.address || '',
        notes: detail.notes || '',
        status: detail.status === 'inactive' ? 0 : 1,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin nhà cung cấp');
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = async (supplier) => {
    setModalMode('edit');
    setSelectedSupplier(null);
    setFormData(emptyForm);
    setError('');
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      const response = await getSupplier(supplier.id);
      const detail = response?.data ?? response;
      setSelectedSupplier(detail);
      setFormData({
        supplierName: detail.name || '',
        contactPerson: detail.contactPerson || '',
        contactPhone: detail.contactPhone || '',
        contactEmail: detail.contactEmail || '',
        taxCode: detail.taxCode || '',
        groupName: detail.groupName || '',
        bankAccount: detail.bankAccount || '',
        bankName: detail.bankName || '',
        website: detail.website || '',
        address: detail.address || '',
        notes: detail.notes || '',
        status: detail.status === 'inactive' ? 0 : 1,
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin nhà cung cấp');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setFormData(emptyForm);
    setModalLoading(false);
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        supplierName: formData.supplierName.trim(),
        contactPerson: formData.contactPerson.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        taxCode: formData.taxCode.trim(),
        groupName: formData.groupName.trim(),
        bankAccount: formData.bankAccount.trim(),
        bankName: formData.bankName.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        status: Number(formData.status),
      };

      if (!payload.supplierName) {
        throw new Error('Tên nhà cung cấp là bắt buộc');
      }

      if (modalMode === 'edit' && selectedSupplier?.id) {
        await updateSupplier(selectedSupplier.id, payload);
      } else {
        await createSupplier(payload);
      }

      await loadSuppliers();
      closeModal();
    } catch (err) {
      setError(err.message || 'Không thể lưu nhà cung cấp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Bạn có chắc muốn ngừng hợp tác với ${supplier.name || 'nhà cung cấp'}?`)) {
      return;
    }

    try {
      setDeletingId(supplier.id);
      await deleteSupplier(supplier.id);
      await loadSuppliers();
    } catch (err) {
      setError(err.message || 'Không thể xóa nhà cung cấp');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý nhà cung cấp</h1>
          <p className="mt-1 text-sm text-slate-600">
            Theo dõi danh sách nhà cung cấp, công nợ và thực hiện thao tác tạo sửa xem chi tiết,
            xóa.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-xl bg-[#0f4c81] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b3c68]"
        >
          + Thêm nhà cung cấp
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card padding="p-4">
          <p className="text-sm text-slate-500">Tổng nhà cung cấp</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{filteredSuppliers.length}</p>
          <p className="mt-2 text-sm text-emerald-600">Đang hoạt động tốt</p>
        </Card>
        <Card padding="p-4">
          <p className="text-sm text-slate-500">Tổng công nợ</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(summary.totalDebt)}
          </p>
          <p className="mt-2 text-sm text-slate-500">Tổng số tiền phải trả</p>
        </Card>
        <Card padding="p-4">
          <p className="text-sm text-slate-500">Nợ cần ưu tiên</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {formatCurrency(summary.overdueDebt)}
          </p>
          <p className="mt-2 text-sm text-slate-500">Đã đến hạn hoặc sắp đến hạn</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <Card header="Danh sách nhà cung cấp">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên, nhóm, số điện thoại..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              >
                <option value="all">Tất cả nhóm</option>
                {groupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Ngừng hợp tác</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Nhà cung cấp</th>
                    <th className="px-3 py-2 font-medium">Liên hệ</th>
                    <th className="px-3 py-2 font-medium">Công nợ</th>
                    <th className="px-3 py-2 font-medium">Trạng thái</th>
                    <th className="px-3 py-2 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="rounded-xl bg-slate-50 text-slate-700">
                      <td className="rounded-l-xl px-3 py-3">
                        <div className="font-semibold text-slate-900">{supplier.name}</div>
                        <div className="text-xs text-slate-500">{supplier.address || '---'}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div>{supplier.contactPhone || '---'}</div>
                        <div className="text-xs text-slate-500">
                          {supplier.contactEmail || '---'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(supplier.currentDebt || 0)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Đã mua: {formatCurrency(supplier.totalPurchased || 0)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(supplier.status)}`}
                        >
                          {getStatusLabel(supplier.status)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Tạo: {formatDate(supplier.createdAt)}
                        </div>
                      </td>
                      <td className="rounded-r-xl px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openDetailModal(supplier)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(supplier)}
                            disabled={deletingId === supplier.id}
                            className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                          >
                            {deletingId === supplier.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card header="Tổng quan công nợ">
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{supplier.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(supplier.currentDebt || 0)} đang nợ
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(supplier.status)}`}
                    >
                      {getStatusLabel(supplier.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card header="Gợi ý làm việc">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Ưu tiên gọi thanh toán các nhà cung cấp có công nợ đang tăng.</li>
              <li>• Kiểm tra thông tin ngân hàng, mã số thuế trước khi tạo đơn nhập.</li>
              <li>• Đồng bộ công nợ với phiếu nhập và phiếu chi mỗi ngày.</li>
            </ul>
          </Card>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {modalMode === 'create'
                    ? 'Thêm nhà cung cấp'
                    : modalMode === 'edit'
                      ? 'Cập nhật nhà cung cấp'
                      : 'Thông tin nhà cung cấp'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalMode === 'detail'
                    ? 'Xem thông tin chi tiết nhà cung cấp.'
                    : 'Điền đầy đủ thông tin để lưu dữ liệu.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            {modalLoading ? (
              <div className="mt-6 py-10 text-center text-sm text-slate-500">
                Đang tải chi tiết...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Tên nhà cung cấp</span>
                    <input
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Người liên hệ</span>
                    <input
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Số điện thoại</span>
                    <input
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Email</span>
                    <input
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Mã số thuế</span>
                    <input
                      name="taxCode"
                      value={formData.taxCode}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Nhóm NCC</span>
                    <input
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Số tài khoản</span>
                    <input
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Ngân hàng</span>
                    <input
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Website</span>
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="mb-1 block">Trạng thái</span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={modalMode === 'detail'}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                    >
                      <option value={1}>Đang hợp tác</option>
                      <option value={0}>Ngừng hợp tác</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Địa chỉ</span>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={modalMode === 'detail'}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Ghi chú</span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={modalMode === 'detail'}
                    rows="4"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none disabled:bg-slate-100"
                  />
                </label>

                {modalMode !== 'detail' && (
                  <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-[#0f4c81] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b3c68] disabled:opacity-60"
                    >
                      {submitting ? 'Đang lưu...' : modalMode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
