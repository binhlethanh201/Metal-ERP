import { useState, useCallback } from 'react';
import {
  getOwnerDefectiveItems,
  getSuggestedSuppliers,
  assignSupplier,
  acceptWarrantyReturn,
  initWarrantyFromReturn,
} from '../services/ownerWarrantyService';

const STATUS_LABELS = {
  PENDING_ASSIGN: 'Chờ phân công NCC',
  AWAITING_SUPPLIER: 'Chờ hàng về',
  COMPLETED: 'Hoàn tất',
};

const normalizeStatus = (raw) => {
  if (!raw) return 'PENDING_ASSIGN';
  const s = String(raw).trim().toUpperCase();
  return STATUS_LABELS[s] ? s : 'PENDING_ASSIGN';
};

export const useOwnerWarrantyHistory = () => {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    fromDate: '',
    toDate: '',
  });

  // Supplier dropdown state: key = warrantyId, value = array of { id, name }
  const [supplierMap, setSupplierMap] = useState({});
  // Selected supplier per warranty row: key = warrantyId, value = supplierId
  const [selectedSupplier, setSelectedSupplier] = useState({});
  // Loading states for actions
  const [assigningId, setAssigningId] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [supplierLoadingMap, setSupplierLoadingMap] = useState({});

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      };

      const response = await getOwnerDefectiveItems(activeFilters);
      if (response && response.items) {
        const normalized = response.items.map((item) => ({
          ...item,
          warrantyId: item.warrantyTicketId || item.warrantyId || item.id || '',
          returnItemId: item.returnItemId || item.id || '',
          status: normalizeStatus(item.status || item.warrantyStatus),
        }));
        setItems(normalized);
        setTotalCount(response.totalCount);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách hàng bảo hành:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSuggestedSuppliers = useCallback(async (warrantyId, productId, returnItemId) => {
    let actualWarrantyId = warrantyId;

    // Đơn cũ chưa có WarrantyTicket -> khởi tạo
    if (!actualWarrantyId && returnItemId) {
      try {
        const initRes = await initWarrantyFromReturn(returnItemId);
        actualWarrantyId = initRes?.warrantyTicketId || initRes?.warrantyId;
        if (actualWarrantyId) {
          setItems((prev) =>
            prev.map((item) =>
              (item.returnItemId || item.id) === returnItemId
                ? { ...item, warrantyTicketId: actualWarrantyId, warrantyId: actualWarrantyId, status: 'PENDING_ASSIGN' }
                : item
            )
          );
        }
      } catch (err) {
        console.error('Lỗi khởi tạo WarrantyTicket:', err);
        alert('Không thể khởi tạo phiếu bảo hành: ' + (err.message || ''));
        return;
      }
    }

    setSupplierLoadingMap((prev) => ({ ...prev, [actualWarrantyId || returnItemId]: true }));
    try {
      const res = await getSuggestedSuppliers(productId);
      const suppliers = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const key = actualWarrantyId || returnItemId;
      setSupplierMap((prev) => ({ ...prev, [key]: suppliers }));
      if (suppliers.length === 1) {
        setSelectedSupplier((prev) => ({ ...prev, [key]: suppliers[0].id || suppliers[0].supplierId }));
      }
    } catch (err) {
      console.error('Lỗi load NCC gợi ý:', err);
    } finally {
      setSupplierLoadingMap((prev) => ({ ...prev, [actualWarrantyId || returnItemId]: false }));
    }
  }, []);

  const handleAssignSupplier = useCallback(async (warrantyId, supplierId) => {
    if (!supplierId) {
      alert('Vui lòng chọn Nhà cung cấp');
      return;
    }
    setAssigningId(warrantyId);
    try {
      await assignSupplier(warrantyId, supplierId);
      setItems((prev) =>
        prev.map((item) =>
          (item.warrantyId || item.warrantyTicketId || item.returnItemId) === warrantyId
            ? { ...item, status: 'AWAITING_SUPPLIER' }
            : item
        )
      );
    } catch (err) {
      console.error('Lỗi gửi bảo hành:', err);
      alert('Gửi bảo hành thất bại: ' + (err.message || ''));
    } finally {
      setAssigningId(null);
    }
  }, []);

  const handleAcceptWarranty = useCallback(async (warrantyId) => {
    if (!window.confirm('Xác nhận NCC đã giao hàng bảo hành về kho?')) return;
    setAcceptingId(warrantyId);
    try {
      await acceptWarrantyReturn(warrantyId);
      setItems((prev) =>
        prev.map((item) =>
          (item.warrantyId || item.id) === warrantyId
            ? { ...item, status: 'COMPLETED' }
            : item
        )
      );
    } catch (err) {
      console.error('Lỗi xác nhận ACP:', err);
      alert('Xác nhận thất bại: ' + (err.message || ''));
    } finally {
      setAcceptingId(null);
    }
  }, []);

  const setPage = (page) => setFilters((prev) => ({ ...prev, page }));
  const setPageSize = (pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  const setSearch = (search) => setFilters((prev) => ({ ...prev, search, page: 1 }));
  const setDateRange = (fromDate, toDate) => setFilters((prev) => ({ ...prev, fromDate, toDate, page: 1 }));

  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      search: '',
      fromDate: '',
      toDate: '',
    });
  };

  return {
    items,
    totalCount,
    loading,
    error,
    filters,
    fetchItems,
    setPage,
    setPageSize,
    setSearch,
    setDateRange,
    resetFilters,
    // Warranty workflow
    supplierMap,
    selectedSupplier,
    setSelectedSupplier,
    assigningId,
    acceptingId,
    supplierLoadingMap,
    fetchSuggestedSuppliers,
    handleAssignSupplier,
    handleAcceptWarranty,
    STATUS_LABELS,
    normalizeStatus,
  };
};