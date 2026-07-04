import { useState, useMemo, useCallback, useRef } from 'react';
import { generateOrderData } from '../data/orderMockData';
import { getQuickDateRange, formatDate } from '../utils/orderUtils';

export const useOrderFilters = () => {
  const defaultRange = getQuickDateRange('Tháng này');
  const allOrdersRef = useRef(generateOrderData(982));

  const [dateCriteria, setDateCriteria] = useState('Ngày giao hàng');
  const [quickDate, setQuickDate] = useState('Tháng này');
  const [fromDate, setFromDate] = useState(formatDate(defaultRange.from));
  const [toDate, setToDate] = useState(formatDate(defaultRange.to));
  const [selectedTags, setSelectedTags] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailTab, setDetailTab] = useState('detail');
  const [showLabelFilter, setShowLabelFilter] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);

  const [showReconciliation, setShowReconciliation] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      allOrdersRef.current = generateOrderData(982);
      setDataVersion((v) => v + 1);
      setPage(1);
      setIsLoading(false);
    }, 600);
  }, []);

  const updateOrderReconciliation = useCallback((orderIds, voucherNo) => {
    allOrdersRef.current = allOrdersRef.current.map((o) => {
      if (orderIds.includes(o.id)) {
        return { ...o, reconciliationStatus: 'Đã đối soát', reconciliationNo: voucherNo };
      }
      return o;
    });
    setSelectedOrders(new Set());
    setPage(1);
  }, []);

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handleQuickDateChange = (option) => {
    setQuickDate(option);
    const range = getQuickDateRange(option);
    if (range.from) {
      setFromDate(formatDate(range.from));
      setToDate(formatDate(range.to));
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    const r = getQuickDateRange('Tháng này');
    setDateCriteria('Ngày giao hàng');
    setQuickDate('Tháng này');
    setFromDate(formatDate(r.from));
    setToDate(formatDate(r.to));
    setSelectedTags([]);
    setColumnFilters({});
    setPage(1);
  };

  const filteredOrders = useMemo(() => {
    let data = [...allOrdersRef.current];
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      const dateField =
        {
          'Ngày tạo đơn': 'createdDate',
          'Ngày giao hàng': 'deliveryDate',
          'Ngày hóa đơn': 'invoiceDate',
        }[dateCriteria] || 'deliveryDate';
      data = data.filter((o) => {
        const d = new Date(o[dateField]);
        return d >= from && d <= to;
      });
    }
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value || value === 'Tất cả') return;
      data = data.filter((o) =>
        String(o[key] || '')
          .toLowerCase()
          .includes(String(value).toLowerCase())
      );
    });
    if (selectedTags.length > 0)
      data = data.filter((o) => o.tags && o.tags.some((t) => selectedTags.includes(t.label)));
    void dataVersion;
    return data;
  }, [fromDate, toDate, dateCriteria, columnFilters, selectedTags, dataVersion]);

  const footerTotals = useMemo(
    () => ({
      totalPayment: filteredOrders.reduce((s, o) => s + o.totalPayment, 0),
      customerDebt: filteredOrders.reduce((s, o) => s + o.customerDebt, 0),
      remainingToCollect: filteredOrders.reduce((s, o) => s + o.remainingToCollect, 0),
      shippingFeePartner: filteredOrders.reduce((s, o) => s + o.shippingFeePartner, 0),
    }),
    [filteredOrders]
  );

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const pagedOrders = useMemo(
    () => filteredOrders.slice((page - 1) * pageSize, page * pageSize),
    [filteredOrders, page, pageSize]
  );

  const toggleSelectAll = () =>
    setSelectedOrders((prev) =>
      prev.size === pagedOrders.length ? new Set() : new Set(pagedOrders.map((o) => o.id))
    );
  const toggleSelectOrder = (id) =>
    setSelectedOrders((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return {
    dateCriteria,
    setDateCriteria,
    quickDate,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    selectedTags,
    setSelectedTags,
    columnFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedOrders,
    setSelectedOrders,
    selectedOrder,
    setSelectedOrder,
    detailTab,
    setDetailTab,
    showLabelFilter,
    setShowLabelFilter,
    showColumnModal,
    setShowColumnModal,
    showReconciliation,
    setShowReconciliation,
    updateOrderReconciliation,
    refreshData,
    isLoading,
    filteredOrders,
    footerTotals,
    totalPages,
    pagedOrders,
    handleColumnFilterChange,
    handleQuickDateChange,
    handleResetFilters,
    toggleSelectAll,
    toggleSelectOrder,
  };
};
