/**
 * CustomerManagement Page - Quản lý khách hàng trong POS
 * API: /pos/customers - GET list, POST create, PUT update
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { getCustomers, createCustomer, updateCustomer } from '../services/posService';
import { CUSTOMER_GROUPS } from '../data/posMockData';

const GROUP_COLORS = {
  'Cá nhân': 'info',
  'Doanh nghiệp': 'primary',
  'Đại lý': 'warning',
  'Nhà thầu': 'success',
};

const INITIAL_FORM = { name: '', phone: '', email: '', address: '', group: 'Cá nhân', notes: '' };

// Map API customer sang format local
const mapCustomer = (c) => ({
  id: c.customerId || c.id,
  customerId: c.customerId,
  name: c.customerName || '',
  phone: c.phoneNumber || '',
  email: c.email || '',
  address: c.address || '',
  group: c.group || 'Cá nhân',
  notes: c.notes || '',
  totalSpent: parseFloat(c.totalSpent || 0),
  orderCount: parseInt(c.orderCount || 0),
  lastVisit: c.lastVisit || '-',
  createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '-',
});

// Validate SĐT Việt Nam
const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

// Mock data fallback khi API lỗi
const MOCK_CUSTOMERS = [
  {
    id: 1,
    customerId: '1',
    name: 'Nguyễn Văn A',
    phone: '0903123456',
    email: '',
    address: 'Hà Nội',
    group: 'Cá nhân',
    notes: '',
    totalSpent: 5000000,
    orderCount: 12,
    lastVisit: '2026-06-28',
    createdAt: '01/01/2026',
  },
  {
    id: 2,
    customerId: '2',
    name: 'Công ty TNHH XD Minh Phát',
    phone: '02839998888',
    email: 'info@minhphat.vn',
    address: 'TP.HCM',
    group: 'Doanh nghiệp',
    notes: '',
    totalSpent: 85000000,
    orderCount: 45,
    lastVisit: '2026-06-29',
    createdAt: '01/01/2026',
  },
  {
    id: 3,
    customerId: '3',
    name: 'Trần Thị B',
    phone: '0903123457',
    email: '',
    address: 'Hà Nội',
    group: 'Cá nhân',
    notes: '',
    totalSpent: 1200000,
    orderCount: 3,
    lastVisit: '2026-06-25',
    createdAt: '15/03/2026',
  },
  {
    id: 4,
    customerId: '4',
    name: 'Đại lý Tuấn Kiệt',
    phone: '0908123456',
    email: '',
    address: 'Bình Dương',
    group: 'Đại lý',
    notes: '',
    totalSpent: 25000000,
    orderCount: 18,
    lastVisit: '2026-06-27',
    createdAt: '01/02/2026',
  },
  {
    id: 5,
    customerId: '5',
    name: 'Nhà thầu Quang Vinh',
    phone: '0905123456',
    email: '',
    address: 'Đồng Nai',
    group: 'Nhà thầu',
    notes: '',
    totalSpent: 120000000,
    orderCount: 8,
    lastVisit: '2026-06-20',
    createdAt: '01/01/2026',
  },
];

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('Tất cả');
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const userRoles = Array.isArray(user?.roles) ? user?.roles : user?.role ? [user?.role] : [];
  const isOwner = userRoles.some((r) => r.toLowerCase() === 'owner');

  // Load customers
  const fetchCustomers = useCallback(async () => {
    // Owner không có quyền gọi POS API (backend chỉ hỗ trợ SalesStaff)
    if (isOwner) {
      setCustomers(MOCK_CUSTOMERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      const items = Array.isArray(data) ? data : data?.items || [];
      setCustomers(items.map(mapCustomer));
    } catch (err) {
      console.error('Lỗi lấy khách hàng:', err);
      setError(err.message);
      setCustomers(MOCK_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = useMemo(() => {
    let list = customers;
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(kw) || c.phone.includes(kw));
    }
    if (groupFilter !== 'Tất cả') {
      list = list.filter((c) => c.group === groupFilter);
    }
    return list;
  }, [customers, search, groupFilter]);

  const activeCustomers = customers.filter((c) => c.orderCount > 0);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  const isSelectedInList = selected && filtered.some((c) => c.id === selected.id);

  const handleSelect = useCallback((customer) => {
    setSelected(customer);
  }, []);

  // ---- Validation ----
  const validateForm = (data) => {
    const errs = {};
    const name = data.name.trim();
    const phone = data.phone.trim();
    const email = data.email.trim();

    // Tên: bắt buộc, 2-100 ký tự
    if (!name) errs.name = 'Vui lòng nhập tên khách hàng';
    else if (name.length < 2) errs.name = 'Tên phải có ít nhất 2 ký tự';
    else if (name.length > 100) errs.name = 'Tên không được quá 100 ký tự';

    // SĐT: bắt buộc, validate
    if (!phone) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d+$/.test(phone)) errs.phone = 'SĐT chỉ được chứa số';
    else if (!isValidPhone(phone))
      errs.phone = 'SĐT không hợp lệ (bắt đầu 03/05/07/08/09, đúng 10 số)';

    // Email: không bắt buộc, nếu có thì validate
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Email không đúng định dạng (vd: abc@domain.com)';

    // Địa chỉ: không bắt buộc, giới hạn độ dài
    if (data.address && data.address.length > 200)
      errs.address = 'Địa chỉ không được quá 200 ký tự';

    // Ghi chú: giới hạn độ dài
    if (data.notes && data.notes.length > 500) errs.notes = 'Ghi chú không được quá 500 ký tự';

    return errs;
  };

  // ---- Add ----
  const handleOpenAdd = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const result = await createCustomer({
        customerName: form.name.trim(),
        phoneNumber: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        group: form.group,
        notes: form.notes.trim(),
      });
      // Thêm vào danh sách
      setCustomers((prev) => [mapCustomer(result), ...prev]);
      setShowAddModal(false);
    } catch (err) {
      if (err.status === 409) {
        alert('Số điện thoại đã tồn tại cho khách hàng khác. Vui lòng kiểm tra lại.');
      } else {
        alert('Lỗi: ' + (err.message || 'Không thể thêm khách hàng'));
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- Edit ----
  const handleOpenEdit = () => {
    if (!selected) return;
    setForm({
      name: selected.name,
      phone: selected.phone,
      email: selected.email,
      address: selected.address,
      group: selected.group,
      notes: selected.notes,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const result = await updateCustomer(selected.id, {
        customerName: form.name.trim(),
        phoneNumber: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        group: form.group,
        notes: form.notes.trim(),
      });
      const updated = mapCustomer(result);
      setCustomers((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
      setSelected(updated);
      setShowEditModal(false);
    } catch (err) {
      if (err.status === 409) {
        alert('Số điện thoại đã tồn tại cho khách hàng khác. Vui lòng kiểm tra lại.');
      } else {
        alert('Lỗi: ' + (err.message || 'Không thể cập nhật khách hàng'));
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- Tạo đơn hàng cho khách đã chọn ----
  const handleCreateOrder = () => {
    if (!selected) return;
    navigate('/pos', { state: { selectedCustomer: selected } });
  };

  const columns = [
    {
      key: 'name',
      header: 'Tên khách hàng',
      render: (v, r) => (
        <button
          type="button"
          onClick={() => handleSelect(r)}
          className="text-left font-medium text-[#004785] hover:underline"
        >
          {v}
        </button>
      ),
    },
    { key: 'phone', header: 'SĐT', render: (v) => <span className="text-slate-600">{v}</span> },
    {
      key: 'group',
      header: 'Nhóm',
      render: (v) => (
        <Badge variant={GROUP_COLORS[v] || 'secondary'} size="sm">
          {v}
        </Badge>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Tổng chi tiêu',
      render: (v) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span>,
    },
    {
      key: 'orderCount',
      header: 'Số đơn',
      render: (v) => <span className="font-medium text-slate-900">{v}</span>,
    },
    {
      key: 'lastVisit',
      header: 'Ghé cuối',
      render: (v) => <span className="text-slate-500">{v === '-' ? 'Chưa mua' : v}</span>,
    },
  ];

  return (
    <div className="flex h-full gap-6">
      {/* ===== LEFT: Danh sách ===== */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin và lịch sử mua hàng của khách
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 overflow-hidden md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="truncate text-xl font-extrabold text-[#004785]">{totalCustomers}</div>
              <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Tổng khách hàng
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="truncate text-xl font-extrabold text-green-600">
                {activeCustomers.length}
              </div>
              <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Khách đã mua hàng
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="truncate text-xl font-extrabold text-purple-600">
                {activeCustomers.length > 0
                  ? formatCurrency(totalRevenue / activeCustomers.length)
                  : '0 ₫'}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Bình quân/khách mua
              </p>
            </div>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <strong>Lưu ý:</strong> {error}. Đang hiển thị dữ liệu mẫu.
          </div>
        )}

        {/* Search + Filter + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Tìm theo tên hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none"
            >
              {CUSTOMER_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={handleOpenAdd}>
            + Thêm khách hàng
          </Button>
        </div>

        {/* Table */}
        <Card padding="p-0">
          <Table
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage={error ? `Lỗi: ${error}` : 'Không tìm thấy khách hàng nào'}
          />
        </Card>
      </div>

      {/* ===== RIGHT: Chi tiết khách hàng ===== */}
      {selected && isSelectedInList && (
        <div className="w-96 shrink-0 space-y-4 overflow-y-auto">
          {/* Thông tin cơ bản */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#004785] text-lg font-bold text-white">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight text-slate-900">{selected.name}</h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant={GROUP_COLORS[selected.group] || 'secondary'} size="sm">
                        {selected.group}
                      </Badge>
                      <span className="text-xs text-slate-400">KH từ {selected.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleOpenEdit}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#004785]"
                    title="Chỉnh sửa"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-center text-slate-400">📞</span>
                  <span className="font-medium text-slate-900">{selected.phone}</span>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center text-slate-400">✉️</span>
                    <span className="text-slate-600">{selected.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 text-center text-slate-400">📍</span>
                  <span className="text-slate-600">{selected.address || '-'}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  {selected.notes}
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={handleCreateOrder}>
                + Tạo đơn hàng cho khách này
              </Button>
            </div>
          </Card>

          {/* Thống kê */}
          <Card header="Thống kê mua hàng">
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-lg bg-green-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-green-700">
                  {formatCurrency(selected.totalSpent)}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-green-600">
                  Tổng chi tiêu
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-blue-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-blue-700">
                  {selected.orderCount}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-blue-600">
                  Số đơn hàng
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-purple-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-purple-700">
                  {selected.orderCount > 0
                    ? formatCurrency(selected.totalSpent / selected.orderCount)
                    : '0 ₫'}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-purple-600">
                  Bình quân/đơn
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-amber-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-amber-700">
                  {selected.lastVisit}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-amber-600">
                  Ghé lần cuối
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Placeholder */}
      {(!selected || !isSelectedInList) && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">👥</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một khách hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* ====== MODAL THÊM ====== */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm khách hàng mới"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAdd} loading={saving}>
              Thêm khách hàng
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên khách hàng *"
              placeholder="Nhập tên"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setFormErrors((p) => ({ ...p, name: '' }));
              }}
              required
              error={formErrors.name}
            />
            <Input
              label="SĐT *"
              placeholder="VD: 0903123456"
              value={form.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                setForm((f) => ({ ...f, phone: e.target.value }));
                setFormErrors((p) => ({ ...p, phone: '' }));
              }}
              required
              error={formErrors.phone}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="Nhập email (nếu có)"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
          />
          <Input
            label="Địa chỉ"
            maxLength={200}
            placeholder="Nhập địa chỉ"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhóm khách hàng</label>
            <select
              value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            >
              {CUSTOMER_GROUPS.filter((g) => g !== 'Tất cả').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              rows={3}
              placeholder="Ghi chú về khách hàng"
              maxLength={500}
              value={form.notes}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, notes: v }));
                setFormErrors((p) => ({
                  ...p,
                  notes: v.length > 500 ? 'Ghi chú không được quá 500 ký tự' : '',
                }));
              }}
              className={
                formErrors.notes
                  ? 'w-full rounded-lg border border-red-500 px-3 py-2 focus:border-red-500 focus:outline-none'
                  : 'w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none'
              }
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-red-500">{formErrors.notes || ''}</span>
              <span className="text-slate-400">{form.notes.length}/500</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ====== MODAL SỬA ====== */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa khách hàng"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleEdit} loading={saving}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên khách hàng *"
              placeholder="Nhập tên"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setFormErrors((p) => ({ ...p, name: '' }));
              }}
              required
              error={formErrors.name}
            />
            <Input
              label="SĐT *"
              placeholder="VD: 0903123456"
              value={form.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                setForm((f) => ({ ...f, phone: e.target.value }));
                setFormErrors((p) => ({ ...p, phone: '' }));
              }}
              required
              error={formErrors.phone}
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="Nhập email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
          />
          <Input
            label="Địa chỉ"
            maxLength={200}
            placeholder="Nhập địa chỉ"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhóm khách hàng</label>
            <select
              value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            >
              {CUSTOMER_GROUPS.filter((g) => g !== 'Tất cả').map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
            <textarea
              rows={3}
              placeholder="Ghi chú"
              maxLength={500}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
