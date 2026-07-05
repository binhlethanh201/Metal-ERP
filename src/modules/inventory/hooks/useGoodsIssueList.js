/**
 * Hook quản lý danh sách phiếu xuất kho: fetch, filter đa tiêu chí, delete.
 * Hỗ trợ lọc theo: search, thời gian (predefined + custom date range),
 * loại phiếu, hình thức TT, trạng thái đồng bộ, đối tượng, người lập, khoảng tiền.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getGoodsIssues, deleteGoodsIssue } from '../services/goodsIssueService';
import { extractList, normalizeIssueRow } from '../utils/goodsIssueUtils';
import { goodsIssueRows } from '../data/goodsIssueMockData';

const isToday = (d) => {
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isYesterday = (d) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

const isThisWeek = (d) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
};

const isLastWeek = (d) => {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfThisWeek);
  return d >= startOfLastWeek && d < endOfLastWeek;
};

const isThisMonth = (d) => {
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isLastMonth = (d) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
};

const isThisQuarter = (d) => {
  const now = new Date();
  const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const qEnd = new Date(qStart);
  qEnd.setMonth(qStart.getMonth() + 3);
  return d >= qStart && d < qEnd;
};

const isThisYear = (d) => {
  return d.getFullYear() === new Date().getFullYear();
};

const isLastYear = (d) => {
  return d.getFullYear() === new Date().getFullYear() - 1;
};

const isLastQuarter = (d) => {
  const now = new Date();
  const thisQStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const lastQStart = new Date(thisQStart);
  lastQStart.setMonth(thisQStart.getMonth() - 3);
  const lastQEnd = new Date(thisQStart);
  return d >= lastQStart && d < lastQEnd;
};

const timePresets = [
  { value: 'all', label: 'Tất cả' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'thisWeek', label: 'Tuần này' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'lastMonth', label: 'Tháng trước' },
  { value: 'thisQuarter', label: 'Quý này' },
  { value: 'thisYear', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

const applyTimeFilter = (dateStr, preset) => {
  if (preset === 'all') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  switch (preset) {
    case 'today':
      return isToday(d);
    case 'yesterday':
      return isYesterday(d);
    case 'thisWeek':
      return isThisWeek(d);
    case 'lastWeek':
      return isLastWeek(d);
    case 'thisMonth':
      return isThisMonth(d);
    case 'lastMonth':
      return isLastMonth(d);
    case 'thisQuarter':
      return isThisQuarter(d);
    case 'lastQuarter':
      return isLastQuarter(d);
    case 'thisYear':
      return isThisYear(d);
    case 'lastYear':
      return isLastYear(d);
    default:
      return true;
  }
};

const applyCustomDateRange = (dateStr, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  if (dateFrom && d < new Date(dateFrom)) return false;
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
};

export const useGoodsIssueList = () => {
  const [issues, setIssues] = useState(goodsIssueRows);
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '' });
  const [isRemoteData, setIsRemoteData] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [timePreset, setTimePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const todayString = new Date().toISOString().split('T')[0];
  const [dateTo, setDateTo] = useState(todayString);
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [syncStatusFilter, setSyncStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Time popover state
  const [timeSelectedLabel, setTimeSelectedLabel] = useState('Toàn thời gian');
  const [timeQuickOpen, setTimeQuickOpen] = useState(false);
  const [timeCustomOpen, setTimeCustomOpen] = useState(false);
  const timeRef = useRef(null);

  const { token } = useAuth();

  // --- distinct values for dropdowns (derived from raw issues) ---
  const distinctCustomers = useMemo(() => {
    const set = new Set(issues.map((i) => i.customer).filter(Boolean));
    return [...set].sort();
  }, [issues]);

  const distinctCreators = useMemo(() => {
    const set = new Set(issues.map((i) => i.createdBy).filter(Boolean));
    return [...set].sort();
  }, [issues]);

  const distinctIssueTypes = useMemo(() => {
    const set = new Set(issues.map((i) => i.issueType).filter(Boolean));
    return [...set].sort();
  }, [issues]);

  // --- Fetch ---
  useEffect(() => {
    let active = true;
    const load = async () => {
      setApiStatus({ loading: true, error: '' });
      try {
        const response = await getGoodsIssues({ Page: 1, PageSize: 100 });
        const items = extractList(response).map(normalizeIssueRow).filter(Boolean);
        if (!active) return;
        setIsRemoteData(true);
        if (items.length > 0) setIssues(items);
        setApiStatus({ loading: false, error: '' });
      } catch (error) {
        if (!active) return;
        setIssues(goodsIssueRows);
        setIsRemoteData(false);
        setApiStatus({
          loading: false,
          error:
            error?.status === 401
              ? 'API yêu cầu JWT. Hãy đăng nhập hoặc dán token vào Swagger Authorize.'
              : 'Không tải được dữ liệu từ API, đang dùng dữ liệu mẫu.',
        });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [token]);

  // --- Filtered results ---
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // Text search
    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.issueNumber.toLowerCase().includes(kw) ||
          item.customer.toLowerCase().includes(kw) ||
          item.reference.toLowerCase().includes(kw)
      );
    }

    // Time preset
    if (timePreset === 'custom') {
      result = result.filter((item) => applyCustomDateRange(item.date, dateFrom, dateTo));
    } else {
      result = result.filter((item) => applyTimeFilter(item.date, timePreset));
    }

    // Issue type
    if (issueTypeFilter !== 'all') {
      result = result.filter((item) => item.issueType === issueTypeFilter);
    }

    // Payment method
    if (paymentMethodFilter !== 'all') {
      result = result.filter((item) => item.paymentMethod === paymentMethodFilter);
    }

    // Sync status
    if (syncStatusFilter === 'synced') {
      result = result.filter((item) => item.syncStatus === 'Đã đồng bộ');
    } else if (syncStatusFilter === 'not_synced') {
      result = result.filter((item) => item.syncStatus === 'Chưa đồng bộ');
    }

    // Customer
    if (customerFilter) {
      result = result.filter((item) => item.customer === customerFilter);
    }

    // Creator
    if (creatorFilter) {
      result = result.filter((item) => item.createdBy === creatorFilter);
    }

    // Amount range
    if (amountFrom) {
      const from = Number(amountFrom);
      if (!isNaN(from)) result = result.filter((item) => item.totalAmount >= from);
    }
    if (amountTo) {
      const to = Number(amountTo);
      if (!isNaN(to)) result = result.filter((item) => item.totalAmount <= to);
    }

    return result;
  }, [
    issues,
    searchTerm,
    timePreset,
    dateFrom,
    dateTo,
    issueTypeFilter,
    paymentMethodFilter,
    syncStatusFilter,
    customerFilter,
    creatorFilter,
    amountFrom,
    amountTo,
  ]);

  // --- Selection ---
  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? filteredIssues.map((item) => item.id) : []);
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  // --- Delete ---
  const handleDeleteIssue = async (id) => {
    const confirmed = window.confirm('Xóa phiếu xuất này?');
    if (!confirmed) return;
    try {
      if (isRemoteData) {
        await deleteGoodsIssue(id);
        const response = await getGoodsIssues({ Page: 1, PageSize: 100 });
        const items = extractList(response).map(normalizeIssueRow).filter(Boolean);
        setIssues(items.length > 0 ? items : goodsIssueRows);
      } else {
        setIssues((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      alert(error?.message || 'Không thể xóa phiếu xuất');
    }
  };

  // --- Reset all filters ---
  const resetFilters = () => {
    setSearchTerm('');
    setTimePreset('all');
    setDateFrom('');
    setDateTo('');
    setIssueTypeFilter('all');
    setPaymentMethodFilter('all');
    setSyncStatusFilter('all');
    setCustomerFilter('');
    setCreatorFilter('');
    setAmountFrom('');
    setAmountTo('');
  };

  const totalsByField = useMemo(() => {
    const totalAmount = filteredIssues.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalPayment = filteredIssues.reduce((sum, item) => sum + (item.totalPayment || 0), 0);
    return { totalAmount, totalPayment };
  }, [filteredIssues]);

  return {
    issues: filteredIssues,
    allIssues: issues,
    apiStatus,
    isRemoteData,
    // search
    searchTerm,
    setSearchTerm,
    // time
    timePreset,
    setTimePreset,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    timePresets,
    timeSelectedLabel,
    setTimeSelectedLabel,
    timeQuickOpen,
    setTimeQuickOpen,
    timeCustomOpen,
    setTimeCustomOpen,
    timeRef,
    // filters
    issueTypeFilter,
    setIssueTypeFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    syncStatusFilter,
    setSyncStatusFilter,
    customerFilter,
    setCustomerFilter,
    creatorFilter,
    setCreatorFilter,
    amountFrom,
    setAmountFrom,
    amountTo,
    setAmountTo,
    // reference data
    distinctCustomers,
    distinctCreators,
    distinctIssueTypes,
    // actions
    resetFilters,
    selectedIds,
    handleSelectAll,
    handleSelectOne,
    handleDeleteIssue,
    totalsByField,
    totalCount: filteredIssues.length,
  };
};

export default useGoodsIssueList;
