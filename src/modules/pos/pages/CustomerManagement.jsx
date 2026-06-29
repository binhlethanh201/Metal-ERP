/**
 * CustomerManagement Page - Quản lý khách hàng trong POS
 * Danh sách, tìm kiếm, lọc, xem chi tiết, thêm/sửa khách hàng, tạo đơn hàng nhanh
 * TODO (FE): Kết nối API GET/POST/PUT /api/pos/customers khi BE sẵn sàng.
 * Hiện chạy với MOCK DATA local.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { CUSTOMER_GROUPS, mockCustomers } from '../data/posMockData';

const GROUP_COLORS = {
  'Cá nhân': 'info',
  'Doanh nghiệp': 'primary',
  'Đại lý': 'warning',
  'Nhà thầu': 'success',
};

const PAYMENT_LABELS = { cash: 'Tiền mặt', card: 'Thẻ', transfer: 'CK' };
const PAYMENT_VARIANTS = { cash: 'warning', card: 'info', transfer: 'primary' };

// Sinh lịch sử đơn hàng giả lập theo dữ liệu thực của từng khách
const generateCustomerOrders = (customer) => {
  if (customer.orderCount === 0) return [];
  const orders = [];
  const avgAmount = customer.totalSpent / customer.orderCount;
  const baseDate = new Date(customer.lastVisit !== '-' ? customer.lastVisit : '2024-01-01');
  for (let i = 0; i < Math.min(customer.orderCount, 10); i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i * Math.max(1, Math.floor(60 / customer.orderCount)));
    const variation = 0.5 + Math.random();
    const methods = ['cash', 'card', 'transfer'];
    orders.push({
      id: `ORD-${String(customer.id).padStart(3, '0')}-${String(i + 1).padStart(2, '0')}`,
      date: d.toISOString().split('T')[0],
      amount: Math.round(avgAmount * variation),
      items: Math.max(1, Math.floor(Math.random() * 8) + 1),
      method: methods[Math.floor(Math.random() * 3)],
    });
  }
  return orders;
};

// Validate SĐT Việt Nam
const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

const INITIAL_FORM = { name: '', phone: '', email: '', address: '', group: 'Cá nhân', notes: '' };

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('Tất cả');
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Tải từ MOCK DATA (TODO: thay bằng API call)
  const fetchCustomers = useCallback(() => {
    setLoading(true);
    const mockList = mockCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      group: c.group || 'Cá nhân',
      notes: c.notes || '',
      totalSpent: c.totalSpent || 0,
      orderCount: c.orderCount || 0,
      lastVisit: c.lastVisit || '-',
      loyaltyPoints: 0,
      membershipTier: 'Bronze',
      debtLimit: 0,
      currentDebt: 0,
      createdAt: c.createdAt,
    }));
    setCustomers(mockList);
    setLoading(false);
  }, []);

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

  const customerOrders = useMemo(() => {
    if (!selected) return [];
    return generateCustomerOrders(selected);
  }, [selected]);

  const isSelectedInList = selected && filtered.some((c) => c.id === selected.id);

  const handleSelect = useCallback((customer) => {
    setSelected(customer);
  }, []);

  // ── Validation ────────────────────────────────────────────
  const validateForm = (data) => {
    const errs = {};
    if (!data.name.trim()) errs.name = 'Vui lòng nhập tên khách hàng';
    if (!data.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!isValidPhone(data.phone.trim()))
      errs.phone = 'SĐT không hợp lệ (bắt đầu 03/05/07/08/09, 10 số)';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errs.email = 'Email không hợp lệ';
    return errs;
  };

  // ── Add (local state — TODO: gọi API POST /pos/customers) ─
  const handleOpenAdd = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleAdd = () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    // TODO (FE): gọi API POST /pos/customers ở đây
    const newCust = {
      id: Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      group: form.group,
      notes: form.notes.trim(),
      totalSpent: 0,
      orderCount: 0,
      lastVisit: '-',
      loyaltyPoints: 0,
      membershipTier: 'Bronze',
      debtLimit: 0,
      currentDebt: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    setShowAddModal(false);
  };

  // ── Edit (local state — TODO: gọi API PUT /pos/customers/{id}) ─
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

  const handleEdit = () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    // TODO (FE): gọi API PUT /pos/customers/{selected.id} ở đây
    const updated = {
      ...selected,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      group: form.group,
      notes: form.notes.trim(),
    };
    setCustomers((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    setSelected(updated);
    setShowEditModal(false);
  };

  // ── Tạo đơn hàng cho khách đã chọn ────────────────────────
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
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: (v) => <span className="text-slate-600">{v}</span>,
    },
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

  const CustomerForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Tên khách hàng"
          placeholder="Nhập tên khách hàng"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setFormErrors((prev) => ({ ...prev, name: '' }));
          }}
          required
          error={formErrors.name}
        />
        <Input
          label="Số điện thoại"
          placeholder="VD: 0903123456"
          value={form.phone}
          onChange={(e) => {
            setForm((f) => ({ ...f, phone: e.target.value }));
            setFormErrors((prev) => ({ ...prev, phone: '' }));
          }}
          required
          error={formErrors.phone}
          hint="10 số, bắt đầu 03/05/07/08/09"
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
          placeholder="Ghi chú về khách hàng (nếu có)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
        />
      </div>
      {formErrors.api && (
        <p className="text-sm text-red-600">{formErrors.api}</p>
      )}
    </div>
  );

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{totalCustomers}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Tổng khách hàng
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">{activeCustomers.length}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Khách đã mua hàng
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Tổng doanh thu
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-purple-600">
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
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <span className="loading-spinner mr-2" /> Đang tải...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="mb-2 text-red-500">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchCustomers}>
                Thử lại
              </Button>
            </div>
          ) : (
            <Table columns={columns} data={filtered} emptyMessage="Không tìm thấy khách hàng nào" />
          )}
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
                    type="button"
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
                  <span className="text-slate-600">{selected.address}</span>
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
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-lg font-extrabold text-green-700">
                  {formatCurrency(selected.totalSpent)}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-green-600">
                  Tổng chi tiêu
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-lg font-extrabold text-blue-700">{selected.orderCount}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-blue-600">
                  Số đơn hàng
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <p className="text-lg font-extrabold text-purple-700">
                  {selected.orderCount > 0
                    ? formatCurrency(selected.totalSpent / selected.orderCount)
                    : '0 ₫'}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-purple-600">
                  Bình quân/đơn
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-lg font-extrabold text-amber-700">{selected.lastVisit}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-amber-600">
                  Ghé lần cuối
                </p>
              </div>
            </div>
          </Card>

          {/* Lịch sử mua hàng */}
          <Card header={`Lịch sử mua hàng (${customerOrders.length} đơn gần đây)`}>
            {customerOrders.length > 0 ? (
              <div className="space-y-2">
                {customerOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{o.id}</p>
                      <p className="text-xs text-slate-500">
                        {o.date} - {o.items} món
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{formatCurrency(o.amount)}</p>
                      <Badge variant={PAYMENT_VARIANTS[o.method]} size="sm">
                        {PAYMENT_LABELS[o.method]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">
                Khách hàng chưa có đơn hàng nào
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Placeholder khi chưa chọn */}
      {(!selected || !isSelectedInList) && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">👥</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một khách hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết và lịch sử mua hàng</p>
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
            <Button variant="primary" onClick={handleAdd} disabled={!form.name || !form.phone}>
              Thêm khách hàng
            </Button>
          </>
        }
      >
        <CustomerForm />
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
            <Button variant="primary" onClick={handleEdit} disabled={!form.name || !form.phone}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <CustomerForm />
      </Modal>
    </div>
  );
};

export default CustomerManagement;
