/**
 * CustomerManagement Page - Quản lý khách hàng trong POS
 * API: /pos/customers - GET list, POST create, PUT update
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import Icon from '../../../shared/components/Icon';
import { hasPermission } from '../../../shared/utils/permissions';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getReturns,
  getOrders,
  getCustomerOrders,
} from '../services/posService';

const CUSTOMER_GROUPS = ['Tất cả', 'Cá nhân', 'Doanh nghiệp', 'Đại lý', 'Nhà thầu'];

const VN_TZ = 'Asia/Ho_Chi_Minh';
const formatDateTimeVN = (date) => formatDate(date, 'DD/MM/YYYY HH:mm', { timeZone: VN_TZ });

const GROUP_COLORS = {
  'Cá nhân': 'info',
  'Doanh nghiệp': 'primary',
  'Đại lý': 'warning',
  'Nhà thầu': 'success',
};

const INITIAL_FORM = { name: '', phone: '', email: '', address: '', group: 'Cá nhân', notes: '' };

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
  returnCount: parseInt(c.returnCount || 0),
  lastVisit: c.lastVisit ? formatDateTimeVN(c.lastVisit) : '-',
  createdAt: c.createdAt ? formatDateTimeVN(c.createdAt) : '-',
});

const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

export const CustomerManagement = ({ user }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, groupFilter]);
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Detail panel
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      const rawCustomers = Array.isArray(data) ? data : data?.items || [];

      // Lấy returns + orders để tính returnCount và totalSpent thực tế
      let returnCountMap = {};
      let totalSpentMap = {}; // customerId → actual spent (sales - refunds)
      try {
        const [returnsData, ordersData] = await Promise.all([
          getReturns({}).catch(() => null),
          getOrders({ status: 'Completed', pageSize: 500 }).catch(() => null),
        ]);
        // Build customerName → customerId map (fallback khi order ko có customerId)
        const nameToIdMap = {};
        rawCustomers.forEach((c) => {
          const name = (c.customerName || '').toLowerCase().trim();
          const cid = String(c.customerId || c.id || '').toLowerCase();
          if (name && cid) nameToIdMap[name] = cid;
        });
        // Build orderId → {customerId, totalAmount} map
        const orderInfoMap = {};
        if (ordersData) {
          const orders = Array.isArray(ordersData)
            ? ordersData
            : (ordersData?.items ?? ordersData?.data ?? []);
          orders.forEach((o) => {
            const oid = (o.orderId || o.id || '').toLowerCase();
            let cid = String(
              o.customerId || o.customer?.id || o.customer?.customerId || ''
            ).toLowerCase();
            // Fallback: match bằng customerName
            if (!cid && o.customerName) {
              cid = nameToIdMap[String(o.customerName).toLowerCase().trim()] || '';
            }
            const total = parseFloat(o.totalAmount || o.total || o.grandTotal || o.amount || 0);
            if (oid && cid) {
              orderInfoMap[oid] = { cid, total };
              totalSpentMap[cid] = (totalSpentMap[cid] || 0) + total;
            }
          });
        }
        // Xử lý returns: đếm + trừ tiền hoàn
        if (returnsData) {
          const returns = Array.isArray(returnsData)
            ? returnsData
            : (returnsData?.items ?? returnsData?.data ?? []);
          returns.forEach((r) => {
            const rStatus = String(r.status || '').toUpperCase();
            if (rStatus === 'CANCELLED' || rStatus === 'PENDING' || rStatus === 'DRAFT') return;
            const oid = (r.orderId || '').toLowerCase();
            const info = orderInfoMap[oid];
            if (!info) return;
            // Đếm số đơn đổi trả
            returnCountMap[info.cid] = (returnCountMap[info.cid] || 0) + 1;
            // Trừ tiền hoàn khỏi tổng chi tiêu
            const refund = parseFloat(r.refundAmount || 0);
            if (refund > 0) {
              totalSpentMap[info.cid] = Math.max(0, (totalSpentMap[info.cid] || 0) - refund);
            }
          });
        }
      } catch {} // fallback: dùng giá trị từ API

      setCustomers(
        rawCustomers.map((c) => {
          const cid = String(c.customerId || c.id || '').toLowerCase();
          const apiSpent = parseFloat(c.totalSpent || 0);
          const calculatedSpent = totalSpentMap[cid];
          return {
            ...mapCustomer(c),
            returnCount: returnCountMap[cid] || parseInt(c.returnCount || 0),
            totalSpent: calculatedSpent !== undefined ? calculatedSpent : apiSpent,
          };
        })
      );
    } catch (err) {
      console.error('Lỗi lấy khách hàng:', err);
      setError(err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --- Load customer orders + returns ---
  const loadCustomerOrders = useCallback(async (customer) => {
    setOrdersLoading(true);
    try {
      const cid = customer.customerId || customer.id;
      // Dùng API chuyên dụng GET /pos/customers/{id}/orders
      const ordersData = await getCustomerOrders(cid);
      const orders = Array.isArray(ordersData)
        ? ordersData
        : (ordersData?.items ?? ordersData?.data ?? []);

      // Lấy returns để tính tiền hoàn - map bằng cả orderId lẫn invoiceCode
      let returnsByOrderId = {};
      let returnsByInvoice = {};
      let returnCountByOrderId = {};
      let hasExchangeByOrder = {};
      try {
        const returnsData = await getReturns({});
        const allReturns = Array.isArray(returnsData)
          ? returnsData
          : (returnsData?.items ?? returnsData?.data ?? []);
        // Xây set orderIds + invoiceCodes của khách hàng này để lọc return
        const customerOrderIds = new Set();
        const customerInvoiceCodes = new Set();
        orders.forEach((o) => {
          const oid = (o.orderId || o.id || '').toLowerCase();
          const inv = (o.invoiceCode || o.invoiceId || '').toLowerCase();
          if (oid) customerOrderIds.add(oid);
          if (inv) customerInvoiceCodes.add(inv);
        });
        allReturns.forEach((ret) => {
          const retStatus = String(ret.status || '').toUpperCase();
          if (retStatus === 'CANCELLED' || retStatus === 'PENDING' || retStatus === 'DRAFT') return;
          const retType = (ret.returnType || 'RETURN').toUpperCase();
          const oid = (ret.orderId || '').toLowerCase();
          const invCode = (ret.invoiceCode || '').toLowerCase();
          // Chỉ đếm return thuộc về đơn hàng của khách này
          if (
            (oid && customerOrderIds.has(oid)) ||
            (invCode && customerInvoiceCodes.has(invCode))
          ) {
            const matchKey = oid || invCode;
            returnCountByOrderId[matchKey] = (returnCountByOrderId[matchKey] || 0) + 1;
          }
          // Chỉ tính REFUND (hoàn tiền) vào tổng đã hoàn — EXCHANGE (đổi hàng) không hoàn tiền
          if (retType !== 'REFUND') return;
          const refund = parseFloat(ret.refundAmount || 0);
          if (ret.orderId) {
            const key = ret.orderId.toLowerCase();
            returnsByOrderId[key] = (returnsByOrderId[key] || 0) + refund;
          }
          if (ret.invoiceCode) {
            const key = ret.invoiceCode.toLowerCase();
            returnsByInvoice[key] = (returnsByInvoice[key] || 0) + refund;
          }
        });
        // Duyệt lại để đánh dấu EXCHANGE (không phụ thuộc thứ tự)
        allReturns.forEach((ret) => {
          const retStatus = String(ret.status || '').toUpperCase();
          if (retStatus === 'CANCELLED' || retStatus === 'PENDING' || retStatus === 'DRAFT') return;
          const retType = (ret.returnType || 'RETURN').toUpperCase();
          if (retType !== 'EXCHANGE') return;
          if (ret.orderId) {
            hasExchangeByOrder[ret.orderId.toLowerCase()] = true;
          }
        });
      } catch {}

      // Map orders
      const mapped = orders.map((o) => {
        const orderId = (o.orderId || o.id || '').toLowerCase();
        const invCode = (o.invoiceCode || o.invoiceId || '').toLowerCase();
        const originalValue = parseFloat(o.totalAmount || o.total || o.grandTotal || o.amount || 0);
        // Ưu tiên match bằng orderId, fallback sang invoiceCode
        const refunded = Math.min(
          originalValue,
          returnsByOrderId[orderId] ?? returnsByInvoice[invCode] ?? 0
        );
        const remaining = Math.max(0, originalValue - refunded);
        const hasExchange = !!hasExchangeByOrder[orderId];
        let status = 'COMPLETED';
        if (originalValue > 0 && refunded >= originalValue) status = 'FULLY_REFUNDED';
        else if (refunded > 0 && refunded < originalValue) status = 'PARTIAL_REFUND';
        return {
          id: o.invoiceCode || o.invoiceId || o.id,
          orderId: o.orderId || o.id,
          invoiceCode: o.invoiceCode || o.id,
          originalValue,
          refunded,
          remaining,
          status,
          hasExchange,
          date: o.createdAt || o.date || '',
        };
      });

      setCustomerOrders(mapped);

      // Recalculate totalSpent & returnCount từ dữ liệu thật
      const totalSales = mapped.reduce((s, o) => s + o.originalValue, 0);
      const totalRefunded = mapped.reduce((s, o) => s + o.refunded, 0);
      const actualSpent = totalSales - totalRefunded;
      const returnOrderCount = Object.values(returnCountByOrderId).reduce((s, c) => s + c, 0);

      const updatedCustomer = {
        ...customer,
        totalSpent: actualSpent,
        returnCount: returnOrderCount,
      };
      setSelected(updatedCustomer);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? { ...c, totalSpent: actualSpent, returnCount: returnOrderCount }
            : c
        )
      );
    } catch (err) {
      console.error('Lỗi lấy đơn hàng khách:', err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (customer) => {
      setSelected(customer);
      loadCustomerOrders(customer);
    },
    [loadCustomerOrders]
  );

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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Tự động backfill tổng chi tiêu cho khách hàng ở trang hiện tại
  const fetchedCustDetailIds = useRef(new Set());
  useEffect(() => {
    if (!customers.length || loading) return;
    const needFetch = paginatedData.filter(
      (c) => !fetchedCustDetailIds.current.has(c.id) && (!c.totalSpent || !c.orderCount)
    );
    if (!needFetch.length) return;
    needFetch.forEach((c) => fetchedCustDetailIds.current.add(c.id));
    Promise.allSettled(
      needFetch.map((c) => {
        const cid = c.customerId || c.id;
        return cid ? getCustomerOrders(cid) : Promise.reject('no id');
      })
    ).then((results) => {
      setCustomers((prev) => {
        const updated = [...prev];
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            const orders = Array.isArray(result.value)
              ? result.value
              : (result.value?.items ?? result.value?.data ?? []);
            const totalSpent = orders.reduce(
              (s, o) => s + parseFloat(o.totalAmount || o.total || o.grandTotal || o.amount || 0),
              0
            );
            const orderCount = orders.length;
            const cid = needFetch[idx].customerId || needFetch[idx].id;
            const custIdx = updated.findIndex((c) => (c.customerId || c.id) === cid);
            if (custIdx !== -1) {
              updated[custIdx] = { ...updated[custIdx], totalSpent, orderCount };
            }
          }
        });
        return updated;
      });
    });
  }, [currentPage, paginatedData, customers.length, loading]);

  const activeCustomers = customers.filter((c) => c.orderCount > 0);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  const isSelectedInList = selected && filtered.some((c) => c.id === selected.id);

  const validateForm = (data) => {
    const errs = {};
    const name = data.name.trim();
    const phone = data.phone.trim();
    const email = data.email.trim();
    if (!name) errs.name = 'Vui lòng nhập tên khách hàng';
    else if (name.length < 2) errs.name = 'Tên phải có ít nhất 2 ký tự';
    else if (name.length > 100) errs.name = 'Tên không được quá 100 ký tự';
    if (!phone) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d+$/.test(phone)) errs.phone = 'SĐT chỉ được chứa số';
    else if (!isValidPhone(phone))
      errs.phone = 'SĐT không hợp lệ (bắt đầu 03/05/07/08/09, đúng 10 số)';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Email không đúng định dạng';
    if (data.address && data.address.length > 200)
      errs.address = 'Địa chỉ không được quá 200 ký tự';
    if (data.notes && data.notes.length > 500) errs.notes = 'Ghi chú không được quá 500 ký tự';
    return errs;
  };

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
      setCustomers((prev) => [mapCustomer(result), ...prev]);
      setShowAddModal(false);
    } catch (err) {
      if (err.status === 409) alert('Số điện thoại đã tồn tại.');
      else alert('Lỗi: ' + (err.message || 'Không thể thêm'));
    } finally {
      setSaving(false);
    }
  };

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
      if (err.status === 409) alert('Số điện thoại đã tồn tại.');
      else alert('Lỗi: ' + (err.message || 'Không thể cập nhật'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrder = () => {
    if (!selected) return;
    navigate('/pos', { state: { selectedCustomer: selected } });
  };

  const handleOpenDelete = () => {
    if (!selected) return;
    setDeletingCustomer(selected);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
      if (selected?.id === deletingCustomer.id) setSelected(null);
      setShowDeleteModal(false);
      setDeletingCustomer(null);
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể xóa khách hàng'));
    } finally {
      setDeleting(false);
    }
  };

  const getOrderStatusBadge = (status, hasExchange) => (
    <>
      {hasExchange && <Badge variant="info">Đổi hàng</Badge>}
      {status === 'FULLY_REFUNDED' && <Badge variant="danger">Hoàn toàn bộ</Badge>}
      {status === 'PARTIAL_REFUND' && <Badge variant="warning">Hoàn một phần</Badge>}
      {status === 'COMPLETED' && !hasExchange && <Badge variant="success">Hoàn thành</Badge>}
    </>
  );

  const getOrderStatusLabel = (status, hasExchange) => {
    if (hasExchange && status === 'COMPLETED') return 'Đổi hàng';
    if (hasExchange && status !== 'COMPLETED')
      return `Đổi hàng + ${status === 'FULLY_REFUNDED' ? 'Hoàn toàn bộ' : 'Hoàn một phần'}`;
    if (status === 'FULLY_REFUNDED') return 'Hoàn toàn bộ';
    if (status === 'PARTIAL_REFUND') return 'Hoàn một phần';
    return 'Hoàn thành';
  };

  const filteredOrders = useMemo(() => {
    if (!orderSearch) return customerOrders;
    const kw = orderSearch.toLowerCase();
    return customerOrders.filter((o) => (o.invoiceCode || '').toLowerCase().includes(kw));
  }, [customerOrders, orderSearch]);

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
      key: 'returnCount',
      header: 'Đơn đổi trả',
      render: (v) => (
        <span className={`font-medium ${v > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
          {v || 0}
        </span>
      ),
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
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">Khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Quản lý thông tin và lịch sử mua hàng của khách
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{totalCustomers}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Tổng khách hàng
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">{activeCustomers.length}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Khách đã mua hàng
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
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Bình quân/khách mua
              </p>
            </div>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

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
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#004785] focus:outline-none dark:border-[#333333] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
            >
              {CUSTOMER_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          {hasPermission(user, 'CUSTOMER_CREATE') && (
            <Button variant="primary" onClick={handleOpenAdd}>
              + Thêm khách hàng
            </Button>
          )}
        </div>

        <Card padding="p-0">
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            emptyMessage={error ? `Lỗi: ${error}` : 'Không tìm thấy khách hàng nào'}
          />
          {filtered.length > 0 && (
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filtered.length)} trong tổng số{' '}
                  {filtered.length} khách hàng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {currentPage} / {totalPages || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
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
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#004785] text-lg font-bold text-white">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold leading-tight text-slate-900 dark:text-[#e5e5e5]">
                      {selected.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant={GROUP_COLORS[selected.group] || 'secondary'} size="sm">
                        {selected.group}
                      </Badge>
                      <span className="text-xs text-slate-400 dark:text-[#808080]">
                        KH từ {selected.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {hasPermission(user, 'CUSTOMER_UPDATE') && (
                    <button
                      onClick={handleOpenEdit}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#004785] dark:text-[#808080] dark:hover:bg-[#272727]"
                      title="Chỉnh sửa"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  {hasPermission(user, 'CUSTOMER_DELETE') && (
                    <button
                      onClick={handleOpenDelete}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-[#808080] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      title="Xóa khách hàng"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-[#333333]">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 shrink-0 text-center text-slate-400 dark:text-[#808080]">
                    📞
                  </span>
                  <span className="truncate font-medium text-slate-900 dark:text-[#e5e5e5]">
                    {selected.phone}
                  </span>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 shrink-0 text-center text-slate-400 dark:text-[#808080]">
                      ✉️
                    </span>
                    <span className="truncate text-slate-600 dark:text-[#999999]">
                      {selected.email}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <span className="w-5 shrink-0 text-center text-slate-400 dark:text-[#808080]">
                    📍
                  </span>
                  <span className="truncate text-slate-600 dark:text-[#999999]">
                    {selected.address || '-'}
                  </span>
                </div>
              </div>
              {selected.notes && (
                <div className="break-words rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
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
            <div className="grid grid-cols-2 gap-3 overflow-hidden">
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
              <div className="overflow-hidden rounded-lg bg-amber-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-amber-700">
                  {selected.returnCount || 0}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-amber-600">
                  Đơn đổi trả
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-purple-50 p-3 text-center">
                <p className="truncate text-lg font-extrabold text-purple-700">
                  {selected.lastVisit}
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.05em] text-purple-600">
                  Ghé lần cuối
                </p>
              </div>
            </div>
          </Card>

          {/* Danh sách đơn hàng */}
          <Card header={`Đơn hàng (${customerOrders.length})`}>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#004785]" />
              </div>
            ) : customerOrders.length > 0 ? (
              <div className="space-y-2">
                <Input
                  placeholder="Tìm mã đơn..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredOrders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
                    >
                      <span className="min-w-0 truncate font-mono text-xs font-bold text-[#004785] dark:text-blue-300">
                        {o.invoiceCode}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-[#808080]">
                        {formatCurrency(o.originalValue)}
                      </span>
                    </button>
                  ))}
                  {filteredOrders.length === 0 && (
                    <p className="py-2 text-center text-xs text-slate-400 dark:text-[#808080]">
                      Không tìm thấy
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400 dark:text-[#808080]">
                Chưa có đơn hàng
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Placeholder */}
      {(!selected || !isSelectedInList) && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 dark:border-[#333333] xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">👥</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một khách hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* ====== MODAL CHI TIẾT ĐƠN HÀNG ====== */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng`}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
            Đóng
          </Button>
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-slate-400">Mã đơn</p>
                  <p className="mt-0.5 truncate font-mono text-lg font-bold text-[#004785] dark:text-blue-300">
                    {selectedOrder.invoiceCode}
                  </p>
                </div>
                {getOrderStatusBadge(selectedOrder.status, selectedOrder.hasExchange)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-hidden">
              <div className="overflow-hidden rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-blue-500">Giá trị gốc</p>
                <p className="mt-1 truncate text-xl font-extrabold text-blue-700">
                  {formatCurrency(selectedOrder.originalValue)}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-red-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-red-500">Đã hoàn</p>
                <p className="mt-1 truncate text-xl font-extrabold text-red-700">
                  {selectedOrder.refunded > 0 ? formatCurrency(selectedOrder.refunded) : '0 ₫'}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-green-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-green-500">Còn lại</p>
                <p className="mt-1 truncate text-xl font-extrabold text-green-700">
                  {formatCurrency(selectedOrder.remaining)}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold uppercase text-slate-500">Trạng thái</p>
                <p className="mt-1 truncate text-sm font-bold text-slate-700">
                  {getOrderStatusLabel(selectedOrder.status, selectedOrder.hasExchange)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

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

      {/* ====== MODAL XÁC NHẬN XÓA ====== */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setDeletingCustomer(null);
          }
        }}
        title="Xác nhận xóa khách hàng"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingCustomer(null);
              }}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Xóa khách hàng
            </Button>
          </>
        }
      >
        {deletingCustomer && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-[#cccccc]">
              Bạn có chắc muốn xóa khách hàng{' '}
              <strong className="text-slate-900 dark:text-[#e5e5e5]">
                {deletingCustomer.name}
              </strong>{' '}
              ({deletingCustomer.phone})?
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Nếu khách đã có đơn hàng, hệ thống sẽ chỉ ẩn khách (soft-delete) để giữ lịch sử.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
