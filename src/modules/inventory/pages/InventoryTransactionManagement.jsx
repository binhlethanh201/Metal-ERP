import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw, RotateCcw, Package, Filter } from 'lucide-react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import Drawer from '../../../shared/components/Drawer';
import { StatusBadge } from '../components/transactions/StatusBadge';
import { TransactionTypeBadge } from '../components/transactions/TransactionTypeBadge';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';
import { ImportTicketModal } from '../components/stock/ImportTicketModal';
import { ExportTicketModal } from '../components/stock/ExportTicketModal';
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

const calculateTotalAmount = (item) => {
  if (Number(item?.totalAmount) > 0) return Number(item.totalAmount);
  if (Array.isArray(item?.items)) {
    return item.items.reduce((sum, i) => {
      const price = Number(i.costPrice || i.unitPrice || i.UnitPrice || 0);
      const qty = Number(i.quantity || 0);
      return sum + price * qty;
    }, 0);
  }
  return 0;
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
  totalAmount: calculateTotalAmount(item),
  createdByName: item?.userName || item?.createdByName || '-',
  status: mapStatus(item?.status),
  branchName: item?.branchName || '-',
  branchId: item?.branchId,
  reason:
    item?.ticketType === 'CUSTOMER_RETURN' && (!item?.reason || item?.reason === 'Nhập kho')
      ? 'Khách hàng trả'
      : item?.reason || item?.note || '-',
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
  totalAmount: calculateTotalAmount(item),
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

// Main component
export const InventoryTransactionManagement = () => {
  const location = useLocation();

  // State
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Draft state cho drawer — chỉ apply khi bấm "Áp dụng"
  const [draftStatus, setDraftStatus] = useState('ALL');
  const [draftDateFrom, setDraftDateFrom] = useState('');
  const [draftDateTo, setDraftDateTo] = useState('');
  const [draftTab, setDraftTab] = useState('ALL');

  const openFilterDrawer = () => {
    setDraftStatus(statusFilter);
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setDraftTab(activeTab);
    setFilterDrawerOpen(true);
  };

  const applyDrawerFilters = () => {
    setStatusFilter(draftStatus);
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setActiveTab(draftTab);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilterDrawerOpen(false);
  };

  const resetDrawerFilters = () => {
    setDraftStatus('ALL');
    setDraftDateFrom('');
    setDraftDateTo('');
    setDraftTab('ALL');
  };

  const [inwardData, setInwardData] = useState([]);
  const [outwardData, setOutwardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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

  // Tự động mở phiếu nhập/xuất khi có ticketId từ URL (từ thông báo)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketId = params.get('ticketId');
    const type = params.get('type');
    const search = params.get('search');

    if (type) setActiveTab(type);
    if (search) setSearchTerm(search);

    if (!ticketId) return;

    const openTicketFromUrl = async () => {
      setDetailLoading(true);
      setIsDetailOpen(true);
      try {
        const res =
          type === 'INWARD'
            ? await getInwardInventory(ticketId)
            : await getOutwardInventory(ticketId);
        const rawData = res?.data || res;
        if (rawData && (rawData.stockTicketId || rawData.ticketCode || rawData.items)) {
          const normalized =
            type === 'INWARD'
              ? normalizeInwardInventory(rawData)
              : normalizeOutwardInventory(rawData);
          setSelectedTransaction(normalized);
        }
        if (type) setActiveTab(type);
      } catch (error) {
        console.error('Failed to open ticket from URL:', error);
        setIsDetailOpen(false);
      } finally {
        setDetailLoading(false);
      }
    };

    openTicketFromUrl();
  }, [location.search]);

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

  // Computed stats từ filteredData - phản ánh đúng khoảng ngày đang lọc
  const computedStats = useMemo(() => {
    const completedInward = filteredData.filter(
      (t) => t.type === 'INWARD' && (t.status === 'COMPLETED' || t.status === 'APPROVED')
    );
    const completedOutward = filteredData.filter(
      (t) => t.type === 'OUTWARD' && (t.status === 'COMPLETED' || t.status === 'APPROVED')
    );

    const inwardValue = completedInward.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const outwardValue = completedOutward.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const pendingCount = filteredData.filter((t) => t.status === 'PENDING').length;

    return {
      totalInwardCount: completedInward.length,
      totalOutwardCount: completedOutward.length,
      inwardValue,
      outwardValue,
      pendingCount,
    };
  }, [filteredData]);

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

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
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
    <div className="animate-fade-in w-full space-y-4 text-slate-800">
      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
            Lịch sử Xuất/Nhập
          </h1>
          <p className="mt-1 text-gray-600 dark:text-[#999999]">
            Theo dõi toàn bộ giao dịch nhập kho và xuất kho
          </p>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card>
          <div className="py-4 text-center">
            <div className="text-xl font-bold text-emerald-600">
              {loading ? '...' : (computedStats?.totalInwardCount || 0).toLocaleString()}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng phiếu nhập</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-xl font-bold text-rose-600">
              {loading ? '...' : (computedStats?.totalOutwardCount || 0).toLocaleString()}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Tổng phiếu xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-xl font-bold text-emerald-600">
              {loading ? '...' : formatCurrency(computedStats?.inwardValue || 0)}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">
              {dateFrom || dateTo ? 'Giá trị nhập (đã lọc)' : 'Giá trị nhập hôm nay'}
            </p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-xl font-bold text-rose-600">
              {loading ? '...' : formatCurrency(computedStats?.outwardValue || 0)}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">
              {dateFrom || dateTo ? 'Giá trị xuất (đã lọc)' : 'Giá trị xuất hôm nay'}
            </p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-xl font-bold text-amber-500">
              {loading ? '...' : (computedStats?.pendingCount || 0).toLocaleString()}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">Hàng chờ duyệt</p>
          </div>
        </Card>
      </div>

      {/* ==================== FILTERS + SEARCH ==================== */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-[#333] dark:bg-[#1a1a1a]/60">
        {/* Search bar - top */}
        <div className="flex items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 focus-within:border-blue-400 focus-within:ring-1 dark:border-[#333] dark:bg-[#1a1a1a]">
            <Icon name="search" className="mr-2 text-slate-400 dark:text-[#808080]" size={18} />
            <input
              type="text"
              placeholder="Tìm mã phiếu, đối tượng, người tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none bg-transparent text-sm outline-none focus:ring-0 dark:text-[#e5e5e5]"
            />
          </div>
        </div>

        {/* Status filter + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
              <Filter size={14} /> Lọc trạng thái:
            </span>
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'DRAFT', label: 'Nháp' },
              { value: 'PENDING', label: 'Đang xử lý' },
              { value: 'APPROVED', label: 'Đã duyệt' },
              { value: 'COMPLETED', label: 'Đã hoàn thành' },
              { value: 'CANCELLED', label: 'Đã hủy' },
            ].map((item) => {
              const isActive = draftStatus === item.value;
              return (
                <Button
                  key={item.value}
                  type="button"
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDraftStatus(item.value)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFilterDrawer}
              className="flex items-center gap-1.5"
            >
              <Icon name="Layers" size={14} className="text-[#004785]" />
              Bộ lọc
              {(dateFrom || dateTo || activeTab !== 'ALL') && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#004785] px-1 text-[11px] font-bold text-white">
                  {(dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (activeTab !== 'ALL' ? 1 : 0)}
                </span>
              )}
            </Button>
            <Button
              onClick={fetchData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <RotateCcw size={13} /> Đặt lại
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Drawer for tabs + date range */}
      <Drawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Bộ lọc nâng cao"
        widthClass="max-w-sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={resetDrawerFilters}>
              Đặt lại
            </Button>
            <Button variant="primary" size="sm" onClick={applyDrawerFilters}>
              Áp dụng
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Loại phiếu */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Loại phiếu
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'ALL', label: 'Tất cả', count: counts.all },
                { key: 'INWARD', label: 'Nhập kho', count: counts.inward },
                { key: 'OUTWARD', label: 'Xuất kho', count: counts.outward },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDraftTab(tab.key)}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    draftTab === tab.key
                      ? 'bg-[#004785] text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-[#333] dark:text-[#b3b3b3] dark:hover:bg-[#272727]'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                      draftTab === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-[#333] dark:text-[#b3b3b3]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Từ ngày */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Từ ngày
            </label>
            <input
              type="date"
              value={draftDateFrom}
              onChange={(e) => setDraftDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
            />
          </div>

          {/* Đến ngày */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-[#b3b3b3]">
              Đến ngày
            </label>
            <input
              type="date"
              value={draftDateTo}
              onChange={(e) => setDraftDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-[#004785] focus:outline-none dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
            />
          </div>
        </div>
      </Drawer>

      {/* ==================== BẢNG DANH SÁCH ==================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[#333] dark:bg-[#0f0f0f]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-[#333] dark:bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Mã phiếu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Đối tượng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Số mặt hàng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Tổng SL
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Người tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-[#b3b3b3]">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#333]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {Array.from({ length: 9 }).map((_, i) => (
                      <td key={i} className="px-4 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-10 w-10 text-slate-300 dark:text-[#666]" />
                      <p className="font-medium text-slate-500 dark:text-[#999]">
                        Không có dữ liệu
                      </p>
                      <p className="text-sm text-slate-400 dark:text-[#808080]">
                        Thử thay đổi bộ lọc hoặc tạo phiếu mới
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#272727]"
                    onClick={() => handleViewDetail(row)}
                  >
                    <td className="px-4 py-3">
                      <TransactionTypeBadge type={row.type} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {row.ticketCode}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#b3b3b3]">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.partyName}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-[#b3b3b3]">
                      {row.itemCount}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {(row.totalQuantity || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 text-right font-medium text-slate-900 dark:text-[#e5e5e5]">
                      {row.ticketType === 'CUSTOMER_RETURN' ? (
                        <span className="text-xs italic text-slate-400 dark:text-[#808080]">
                          Khách hàng trả
                        </span>
                      ) : row.type === 'OUTWARD' && row.totalAmount === 0 ? (
                        <span className="text-xs italic text-slate-400 dark:text-[#808080]">
                          {row.reason || row.ticketType || '-'}
                        </span>
                      ) : (
                        formatCurrency(row.totalAmount)
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#b3b3b3]">
                      {row.createdByName}
                    </td>
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
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333] dark:bg-[#0f0f0f]">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#b3b3b3]">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#e5e5e5]"
                >
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                </select>
              </div>
              <span>
                {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}{' '}
                trong tổng số {pagination.totalItems} phiếu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-[#b3b3b3] dark:hover:bg-[#272727]"
              >
                <Icon name="chevron_right" className="text-[18px]" />
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

      <ImportTicketModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => fetchData(false)}
      />
      <ExportTicketModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onSuccess={() => fetchData(false)}
      />
    </div>
  );
};

export default InventoryTransactionManagement;
