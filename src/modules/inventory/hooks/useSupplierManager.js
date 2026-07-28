import { useState, useEffect, useMemo, useCallback } from 'react';
// IMPORT TỪ FILE SERVICE MỚI
import {
  getSuppliers,
  getSupplierDetail,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} from '../services/supplierService';

export const useSupplierManager = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States cho Bộ lọc
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [groupOptions, setGroupOptions] = useState([]);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi API lấy dữ liệu
      const response = await getSuppliers({ pageNumber: 1, pageSize: 100 });
      const payload = response?.data ?? response;
      const list = Array.isArray(payload) ? payload : (payload?.items ?? []);

      // Trích xuất danh sách nhóm
      const groups = Array.isArray(payload?.distinctGroups)
        ? payload.distinctGroups.filter(Boolean)
        : Array.from(new Set(list.map((item) => item.groupName).filter(Boolean)));

      setSuppliers(list);
      setGroupOptions(groups);
      setError('');
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Không thể tải dữ liệu nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Bộ lọc Local
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

  // Thống kê
  const summary = useMemo(() => {
    const totalDebt = filteredSuppliers.reduce((sum, s) => sum + Number(s.currentDebt || 0), 0);
    const overdueDebt = filteredSuppliers.reduce((sum, s) => sum + Number(s.dueDebt || 0), 0);
    const activeSuppliers = filteredSuppliers.filter((s) => {
      const status = String(s.status || '').toLowerCase();
      return status === 'active' || status === '1';
    }).length;
    return { totalDebt, overdueDebt, activeSuppliers };
  }, [filteredSuppliers]);

  // Các hàm tương tác API khác
  const fetchSupplierDetail = async (id) => {
    const res = await getSupplierDetail(id);
    return res?.data ?? res;
  };

  const handleCreate = async (payload) => {
    await createSupplier(payload);
    await loadSuppliers();
  };

  const handleUpdate = async (id, payload) => {
    await updateSupplier(id, payload);
    await loadSuppliers();
  };

  const handleDelete = async (id) => {
    await deleteSupplier(id);
    await loadSuppliers();
  };

  /**
   * Toggle trạng thái hợp tác NCC: "active" ↔ "inactive"
   * FE truyền targetStatus ("active" hoặc "inactive") để BE set chính xác.
   */
  const handleToggleStatus = async (id, targetStatus) => {
    await toggleSupplierStatus(id, targetStatus);
    await loadSuppliers();
  };

  return {
    suppliers: filteredSuppliers, // Trả ra danh sách đã lọc
    loading,
    error,
    setError,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    groupOptions,
    summary,
    fetchSupplierDetail,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
};
