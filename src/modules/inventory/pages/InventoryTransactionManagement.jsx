import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, RefreshCw, Package } from 'lucide-react';
import { StatusBadge } from '../components/transactions/StatusBadge';
import { TransactionTypeBadge } from '../components/transactions/TransactionTypeBadge';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';
import {
  getInwardInventories,
  getOutwardInventories,
  getInwardInventory,
  getOutwardInventory,
  cancelInwardInventory,
  cancelOutwardInventory,
} from '../services/inventoryService';
import { getSupplierDetail, getSuppliers } from '../services/supplierService';

// Format helpers
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const ds = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(ds);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Map backend status to UI status
const mapStatus = (status) => {
  if (!status) return 'DRAFT';
  const s = status.toUpperCase();
  if (s === 'PENDING') return 'PENDING';
  if (s === 'APPROVED') return 'APPROVED';
  if (s === 'COMPLETED') return 'COMPLETED';
  if (s === 'CANCELLED') return 'CANCELLED';
  if (s === 'REJECTED') return 'REJECTED';
  return 'DRAFT';
};

// Normalize inward inventory from API
const normalizeInwardInventory = (item) => ({
  id: item?.stockTicketId || item?.ticketId,
  type: 'INWARD',
  ticketCode: item?.ticketCode || '-',
  createdAt: item?.createdAt,
  partyName:
    item?.supplierName ||
    item?.SupplierName ||
    item?.supplier?.supplierName ||
    item?.supplier?.SupplierName ||
    item?.supplier?.name ||
    item?.Supplier?.Name ||
    (typeof item?.supplier === 'string' ? item.supplier : null) ||
    item?.partyName ||
    '-',
  partyId: item?.supplierId || null,
  itemCount: item?.items?.length || 0,
  totalQuantity: item?.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 0,
  totalAmount:
    item?.items?.reduce((sum, i) => {
      const qty = Number(i.quantity || 0);
      const price = Number(i.costPrice || i.unitPrice || i.UnitPrice || 0);
      return sum + qty * price;
    }, 0) || 0,
  createdByName: item?.userName || item?.createdByName || '-',
  status: mapStatus(item?.status),
  branchName: item?.branchName || '-',
  branchId: item?.branchId,
  reason: item?.reason || item?.note || '-',
  note: item?.note || '',
  ticketType: item?.ticketType || 'PURCHASE',
  items: (item?.items || []).map(normalizeItem),
});

// Normalize outward inventory from API
const normalizeOutwardInventory = (item) => ({
  id: item?.stockTicketId || item?.ticketId,
  type: 'OUTWARD',
  ticketCode: item?.ticketCode || '-',
  createdAt: item?.createdAt,
  partyName:
    item?.customerName ||
    item?.CustomerName ||
    item?.customer?.customerName ||
    item?.customer?.CustomerName ||
    item?.customer?.name ||
    item?.Customer?.Name ||
    item?.targetName ||
    item?.TargetName ||
    item?.partnerName ||
    item?.PartnerName ||
    (typeof item?.customer === 'string' ? item.customer : null) ||
    item?.partyName ||
    '-',
  partyId: item?.customerId || null,
  itemCount: item?.items?.length || 0,
  totalQuantity: item?.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 0,
  totalAmount:
    item?.items?.reduce((sum, i) => {
      const qty = Number(i.quantity || 0);
      const price = Number(i.costPrice || i.unitPrice || i.UnitPrice || 0);
      return sum + qty * price;
    }, 0) || 0,
  createdByName: item?.userName || item?.createdByName || '-',
  status: mapStatus(item?.status),
  branchName: item?.branchName || '-',
  branchId: item?.branchId,
  reason: item?.reason || item?.note || '-',
  note: item?.note || '',
  ticketType: item?.ticketType || 'WRITE_OFF',
  items: (item?.items || []).map(normalizeItem),
});

// Normalize item
const normalizeItem = (item) => ({
  id: item?.ticketItemId || item?.branchProductId,
  productCode: item?.productCode || '-',
  productName: item?.productName || '-',
  unit: item?.unit || item?.Unit || item?.unitName || item?.UnitName || '-',
  quantity: Number(item?.quantity || 0),
  costPrice: Number(item?.costPrice || item?.unitPrice || item?.UnitPrice || 0),
  imageUrl: item?.imageUrl || null,
});

// Stats card component
const StatsCard = ({ title, value, icon: Icon, iconBg, subtitle }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-5 w-5 text-current" />
      </div>
    </div>
  </div>
);

// Filter dropdown component
const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
          value !== 'ALL'
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {label}: <span className="font-semibold">{selected?.label || 'Tất cả'}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  value === opt.value ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main component
export const InventoryTransactionManagement = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [inwardData, setInwardData] = useState([]);
  const [outwardData, setOutwardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 100,
    totalItems: 0,
  });

  // Build filter params
  const buildFilterParams = useCallback(
    () => ({
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
      ...(dateFrom && { fromDate: dateFrom }),
      ...(dateTo && { toDate: dateTo }),
    }),
    [pagination.currentPage, pagination.pageSize, statusFilter, dateFrom, dateTo]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [inwardRes, outwardRes, pendingIn, pendingOut] = await Promise.all([
        getInwardInventories({ pageSize: 1, pageNumber: 1 }),
        getOutwardInventories({ pageSize: 1, pageNumber: 1 }),
        getInwardInventories({ pageSize: 1, status: 'PENDING' }),
        getOutwardInventories({ pageSize: 1, status: 'PENDING' }),
      ]);

      setStats({
        totalInward: inwardRes?.data?.totalCount || 0,
        totalOutward: outwardRes?.data?.totalCount || 0,
        todayInwardValue: 0,
        todayOutwardValue: 0,
        pendingCount: (pendingIn?.data?.totalCount || 0) + (pendingOut?.data?.totalCount || 0),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalInward: 0,
        totalOutward: 0,
        todayInwardValue: 0,
        todayOutwardValue: 0,
        pendingCount: 0,
      });
    }
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch data
  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);

      try {
        const filterParams = buildFilterParams();
        const [inwardRes, outwardRes] = await Promise.all([
          getInwardInventories(filterParams),
          getOutwardInventories(filterParams),
        ]);

        // Load danh sách nhà cung cấp để tra cứu tên
        let supplierMap = {};
        try {
          const supRes = await getSuppliers({ pageSize: 1000 });
          const supList = Array.isArray(supRes)
            ? supRes
            : supRes?.data?.items || supRes?.data || [];
          (supList || []).forEach((s) => {
            if (s.id) supplierMap[s.id] = s.name || s.supplierName || '';
          });
        } catch {} // eslint-disable-line no-empty

        if (inwardRes?.success && inwardRes?.data) {
          setInwardData(
            (inwardRes.data.items || []).map((item) => {
              const normalized = normalizeInwardInventory(item);
              if (normalized.partyName === '-' && item.supplierId && supplierMap[item.supplierId]) {
                return { ...normalized, partyName: supplierMap[item.supplierId] };
              }
              return normalized;
            })
          );
        }
        if (outwardRes?.success && outwardRes?.data) {
          setOutwardData(
            (outwardRes.data.items || []).map((item) => {
              const normalized = normalizeOutwardInventory(item);
              // Tra cứu tên đối tượng xuất từ localStorage
              if (item.ticketCode && normalized.partyName === '-') {
                try {
                  const localName = (
                    localStorage.getItem(`outward_party_${item.ticketCode}`) || ''
                  ).replace(/^.*?:\s*/g, '');
                  if (localName) return { ...normalized, partyName: localName };
                } catch {} // eslint-disable-line no-empty
              }
              return normalized;
            })
          );
        }

        const inwardTotal = inwardRes?.data?.totalCount || 0;
        const outwardTotal = outwardRes?.data?.totalCount || 0;
        setPagination((prev) => ({
          ...prev,
          totalItems: inwardTotal + outwardTotal,
          totalPages: Math.max(
            Math.ceil(inwardTotal / prev.pageSize),
            Math.ceil(outwardTotal / prev.pageSize),
            1
          ),
        }));
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    },
    [buildFilterParams]
  );

  // Re-fetch data when filters/pagination change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cập nhật giá trị hôm nay khi dữ liệu thay đổi
  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const isToday = (d) => {
      const date = new Date(d);
      return date >= todayStart && date <= todayEnd;
    };
    const calcValue = (items) =>
      items
        .filter((t) => t.status === 'COMPLETED' && isToday(t.createdAt))
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

    setStats((prev) =>
      prev
        ? {
            ...prev,
            todayInwardValue: calcValue(inwardData),
            todayOutwardValue: calcValue(outwardData),
          }
        : prev
    );
  }, [inwardData, outwardData]);

  // Filter data based on tab and search
  const filteredData = useMemo(() => {
    let result =
      activeTab === 'ALL'
        ? [...inwardData, ...outwardData]
        : activeTab === 'INWARD'
          ? inwardData
          : outwardData;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.ticketCode?.toLowerCase().includes(term) ||
          item.partyName?.toLowerCase().includes(term) ||
          item.createdByName?.toLowerCase().includes(term) ||
          item.reason?.toLowerCase().includes(term)
      );
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [inwardData, outwardData, activeTab, searchTerm]);

  // Count by type
  const counts = useMemo(
    () => ({
      all: inwardData.length + outwardData.length,
      inward: inwardData.length,
      outward: outwardData.length,
    }),
    [inwardData, outwardData]
  );

  // Handle view detail
  const handleViewDetail = useCallback(async (transaction) => {
    setIsDetailOpen(true);
    setDetailLoading(true);

    try {
      const apiCall =
        transaction.type === 'INWARD'
          ? getInwardInventory(transaction.id)
          : getOutwardInventory(transaction.id);

      const res = await apiCall;
      // API có thể trả về { success, data } hoặc trực tiếp object
      const rawData = res?.data || res;
      if (rawData && (rawData.stockTicketId || rawData.ticketCode || rawData.items)) {
        let normalized =
          transaction.type === 'INWARD'
            ? normalizeInwardInventory(rawData)
            : normalizeOutwardInventory(rawData);
        // Tra cứu tên nhà cung cấp từ supplierId nếu chưa có tên
        if (transaction.type === 'INWARD' && rawData.supplierId && normalized.partyName === '-') {
          try {
            const supRes = await getSupplierDetail(rawData.supplierId);
            const supData = supRes?.data || supRes;
            if (supData) {
              normalized = {
                ...normalized,
                partyName: supData.name || supData.supplierName || '-',
              };
            }
          } catch {}
        }
        // Tra cứu tên đối tượng xuất từ localStorage
        if (transaction.type === 'OUTWARD' && rawData.ticketCode && normalized.partyName === '-') {
          try {
            const localName = (
              localStorage.getItem(`outward_party_${rawData.ticketCode}`) || ''
            ).replace(/^.*?:\s*/g, '');
            if (localName) {
              normalized = { ...normalized, partyName: localName };
            }
          } catch {} // eslint-disable-line no-empty
        }
        setSelectedTransaction(normalized);
      } else {
        setSelectedTransaction(transaction);
      }
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      setSelectedTransaction(transaction);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Handle cancel (thay vì DELETE)
  const handleCancel = useCallback(
    async (transaction) => {
      const reason = prompt(`Nhập lý do hủy phiếu ${transaction.ticketCode}:`);
      if (reason === null) return; // user bấm Cancel
      if (!reason.trim()) {
        alert('Vui lòng nhập lý do hủy phiếu.');
        return;
      }

      try {
        const apiCall =
          transaction.type === 'INWARD'
            ? cancelInwardInventory(transaction.id, reason.trim())
            : cancelOutwardInventory(transaction.id, reason.trim());

        await apiCall;
        fetchData(false);
        setIsDetailOpen(false);
      } catch (error) {
        console.error('Cancel failed:', error);
        alert('Hủy phiếu thất bại. Vui lòng thử lại.');
      }
    },
    [fetchData]
  );

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Handle filter changes
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle reset all filters
  const handleReset = () => {
    setActiveTab('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchData(false);
  };

  return (
    <div className="mx-auto max-w-[1600px] pb-8">
      {/* Header with Stats */}
      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title="Tổng phiếu nhập"
          value={loading ? '...' : (stats?.totalInward || 0).toLocaleString()}
          icon={Plus}
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <StatsCard
          title="Tổng phiếu xuất"
          value={loading ? '...' : (stats?.totalOutward || 0).toLocaleString()}
          icon={Minus}
          iconBg="bg-rose-100 text-rose-600"
        />
        <StatsCard
          title="Giá trị nhập hôm nay"
          value={loading ? '...' : formatCurrency(stats?.todayInwardValue || 0)}
          icon={Plus}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatsCard
          title="Giá trị xuất hôm nay"
          value={loading ? '...' : formatCurrency(stats?.todayOutwardValue || 0)}
          icon={Minus}
          iconBg="bg-rose-50 text-rose-600"
        />
        <StatsCard
          title="Hàng chờ duyệt"
          value={loading ? '...' : (stats?.pendingCount || 0).toLocaleString()}
          icon={RefreshCw}
          iconBg="bg-amber-100 text-amber-600"
          subtitle="Cần xử lý"
        />
      </section>

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          {/* Status Filter */}
          <FilterDropdown
            label="Trạng thái"
            options={[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'DRAFT', label: 'Nháp' },
              { value: 'PENDING', label: 'Đang xử lý' },
              { value: 'APPROVED', label: 'Đã duyệt' },
              { value: 'COMPLETED', label: 'Đã hoàn thành' },
              { value: 'CANCELLED', label: 'Đã hủy' },
            ]}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />

          {/* Date Range */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPagination((p) => ({ ...p, currentPage: 1 }));
              }}
              className="h-7 text-xs outline-none"
              placeholder="Từ ngày"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPagination((p) => ({ ...p, currentPage: 1 }));
              }}
              className="h-7 text-xs outline-none"
              placeholder="Đến ngày"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Đặt lại
          </button>
          <button
            onClick={() => navigate('/inventory/import')}
            className="flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Tạo phiếu nhập
          </button>
          <button
            onClick={() => navigate('/inventory/export')}
            className="flex h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Minus className="h-4 w-4" />
            Tạo phiếu xuất
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp, khách hàng, người tạo, ghi chú..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {[
          { key: 'ALL', label: 'Tất cả', count: counts.all },
          { key: 'INWARD', label: 'Nhập kho', count: counts.inward },
          { key: 'OUTWARD', label: 'Xuất kho', count: counts.outward },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Mã phiếu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Đối tượng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Số mặt hàng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tổng SL
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tổng tiền / Hao hụt
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Người tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <td key={i} className="px-4 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 text-slate-300" />
                      <p className="font-medium text-slate-500">Không có dữ liệu</p>
                      <p className="text-sm text-slate-400">
                        Thử thay đổi bộ lọc hoặc tạo phiếu mới
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                    onClick={() => handleViewDetail(row)}
                  >
                    <td className="px-4 py-3">
                      <TransactionTypeBadge type={row.type} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {row.ticketCode}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.partyName}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{row.itemCount}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {(row.totalQuantity || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 text-right font-medium text-slate-900">
                      {row.type === 'OUTWARD' && row.totalAmount === 0 ? (
                        <span className="text-xs italic text-slate-400">
                          {row.reason || row.ticketType || '-'}
                        </span>
                      ) : (
                        formatCurrency(row.totalAmount)
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.createdByName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-600">
              Hiển thị <span className="font-medium">{filteredData.length}</span> phiếu
              {pagination.totalItems > 0 && (
                <span className="text-slate-400"> / {pagination.totalItems} tổng</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &laquo;
              </button>
              <span className="px-3 text-sm text-slate-600">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <TransactionDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTransaction}
        loading={detailLoading}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default InventoryTransactionManagement;
