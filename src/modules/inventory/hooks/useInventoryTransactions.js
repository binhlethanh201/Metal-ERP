import { useState, useEffect, useMemo, useCallback } from 'react';
// Import service và các Enum hệ thống vừa cập nhật
import inventoryService, { INVENTORY_STATUS } from '../services/inventoryService';

const normalizeTransaction = (item, type) => {
  const isInward = type === 'INWARD';
  return {
    id: item?.stockTicketId || item?.ticketId,
    type,
    ticketCode: item?.ticketCode || '-',
    createdAt: item?.createdAt,
    partyName: isInward
      ? item?.supplierName || item?.partyName || 'Nhà cung cấp lẻ'
      : item?.customerName || item?.partyName || 'Khách hàng lẻ',
    itemCount: item?.items?.length || 0,
    totalQuantity: item?.items?.reduce((sum, i) => sum + Number(i.quantity || 0), 0) || 0,
    totalAmount:
      item?.items?.reduce((sum, i) => {
        const qty = Number(i.quantity || 0);
        const price = Number(i.costPrice || i.actualQuantity || 0);
        return sum + qty * price;
      }, 0) || 0,
    createdByName: item?.userName || item?.createdByName || '-',
    status: item?.status || INVENTORY_STATUS.DRAFT,
    note: item?.note || item?.reason || '',
    items: (item?.items || []).map((i) => ({
      id: i?.ticketItemId || i?.branchProductId,
      productCode: i?.productCode || '-',
      productName: i?.productName || '-',
      unit: i?.unit || 'Cái',
      quantity: Number(i?.quantity || 0),
      costPrice: Number(i?.costPrice || 0),
    })),
  };
};

export const useInventoryTransactions = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    searchBy: 'ticketCode',
    type: 'ALL',
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    createdBy: '',
  });

  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 15 });
  const [inwardData, setInwardData] = useState([]);
  const [outwardData, setOutwardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  // Xây dựng params: Truyền thẳng chuỗi DATE từ ô Input, Service tự lo định dạng ISO
  const buildApiParams = useCallback(() => {
    return {
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
      status: filters.status !== 'ALL' ? filters.status : null,
      fromDate: filters.dateFrom || null,
      toDate: filters.dateTo || null,
    };
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const apiParams = buildApiParams();
        const promises = [];

        if (filters.type === 'ALL' || filters.type === 'INWARD') {
          promises.push(
            inventoryService
              .getInwardInventories(apiParams)
              .then((res) => ({ type: 'INWARD', res }))
          );
        }
        if (filters.type === 'ALL' || filters.type === 'OUTWARD') {
          promises.push(
            inventoryService
              .getOutwardInventories(apiParams)
              .then((res) => ({ type: 'OUTWARD', res }))
          );
        }

        const results = await Promise.all(promises);

        results.forEach(({ type, res }) => {
          if (res?.success && res?.data) {
            const mapped = res.data.items?.map((item) => normalizeTransaction(item, type)) || [];
            if (type === 'INWARD') setInwardData(mapped);
            else setOutwardData(mapped);
          }
        });

        if (filters.type === 'INWARD') setOutwardData([]);
        if (filters.type === 'OUTWARD') setInwardData([]);
      } catch (error) {
        console.error('Lỗi nạp dữ liệu từ Service:', error);
      } finally {
        setLoading(false);
      }
    },
    [buildApiParams, filters.type]
  );

  // Nạp thống kê báo cáo nhanh (Ví dụ tính toán tổng tiền hôm nay)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [inRes, outRes] = await Promise.all([
          inventoryService.getInwardInventories({ fromDate: today, toDate: today }),
          inventoryService.getOutwardInventories({ fromDate: today, toDate: today }),
        ]);

        setStats({
          totalInward: inRes?.data?.totalCount || 0,
          totalOutward: outRes?.data?.totalCount || 0,
          todayInwardValue:
            inRes?.data?.items?.reduce(
              (s, i) =>
                s + (i.items?.reduce((a, b) => a + b.quantity * (b.costPrice || 0), 0) || 0),
              0
            ) || 0,
          todayOutwardValue:
            outRes?.data?.items?.reduce(
              (s, i) =>
                s + (i.items?.reduce((a, b) => a + b.quantity * (b.costPrice || 0), 0) || 0),
              0
            ) || 0,
          pendingCount: 0,
          totalStockValue: 1540000000, // Số giả lập hoặc lấy từ API Dashboard tổng chung
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xử lý bộ lọc SearchTerm phía Client
  const processedData = useMemo(() => {
    let result = [...inwardData, ...outwardData];
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter((item) => {
        if (filters.searchBy === 'ticketCode') return item.ticketCode.toLowerCase().includes(term);
        if (filters.searchBy === 'note') return item.note.toLowerCase().includes(term);
        if (filters.searchBy === 'productName')
          return item.items.some((i) => i.productName.toLowerCase().includes(term));
        return item.partyName.toLowerCase().includes(term);
      });
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [inwardData, outwardData, filters]);

  const handleViewDetail = useCallback(async (transaction) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    try {
      const res =
        transaction.type === 'INWARD'
          ? await inventoryService.getInwardInventory(transaction.id)
          : await inventoryService.getOutwardInventory(transaction.id);

      if (res?.success) {
        setSelectedTransaction(normalizeTransaction(res.data, transaction.type));
      }
    } catch (error) {
      setSelectedTransaction(transaction);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (transaction) => {
      if (
        !window.confirm(
          `Hủy phiếu ${transaction.ticketCode}? Hệ thống sẽ tự động hoàn lại số lượng tồn kho cũ.`
        )
      )
        return;
      try {
        const res =
          transaction.type === 'INWARD'
            ? await inventoryService.deleteInwardInventory(transaction.id)
            : await inventoryService.deleteOutwardInventory(transaction.id);

        if (res?.success) {
          fetchData(false);
          setIsDetailOpen(false);
        }
      } catch (error) {
        alert('Không thể hủy phiếu, vui lòng kiểm tra quyền hạn.');
      }
    },
    [fetchData]
  );

  return {
    filters,
    handleFilterChange,
    loading,
    stats,
    processedData,
    pagination: {
      ...pagination,
      totalItems: processedData.length,
      totalPages: Math.ceil(processedData.length / pagination.pageSize) || 1,
    },
    setPagination,
    selectedTransaction,
    isDetailOpen,
    setIsDetailOpen,
    detailLoading,
    handleViewDetail,
    handleDelete,
    fetchData,
  };
};
