import { useState, useEffect, useCallback } from 'react';
import {
  getSupplierPayments,
  createSupplierPayment,
  updateSupplierPaymentNote,
  deleteSupplierPayment,
  getSuppliers, // Để lấy danh sách chọn NCC khi tạo phiếu
} from '../services/supplierService';

export const useSupplierPayment = () => {
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lọc và Phân trang
  const [supplierId, setSupplierId] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [paginationMeta, setPaginationMeta] = useState({ totalCount: 0, totalPages: 1 });

  // Tải danh sách nhà cung cấp (chỉ lấy những NCC đang active để đưa vào Dropdown)
  const fetchActiveSuppliers = useCallback(async () => {
    try {
      const res = await getSuppliers({ status: 'active', pageNumber: 1, pageSize: 200 });
      const data = res?.data || res;
      setSuppliers(data?.items || []);
    } catch (err) {
      console.error('Không tải được danh sách nhà cung cấp', err);
    }
  }, []);

  // Tải danh sách phiếu chi
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        supplierId: supplierId || undefined,
        pageNumber,
        pageSize,
      };
      const response = await getSupplierPayments(filters);
      const data = response?.data || response;

      if (data) {
        setPayments(data.items || []);
        setPaginationMeta({
          totalCount: data.totalCount || 0,
          totalPages: data.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Không thể tải lịch sử thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [supplierId, pageNumber, pageSize]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCreate = async (payload) => {
    await createSupplierPayment(payload);
    await fetchPayments();
  };

  const handleUpdateNote = async (id, note) => {
    await updateSupplierPaymentNote(id, note);
    await fetchPayments();
  };

  const handleCancel = async (id) => {
    await deleteSupplierPayment(id);
    await fetchPayments();
  };

  return {
    payments,
    suppliers,
    loading,
    error,
    setError,
    supplierId,
    setSupplierId,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    paginationMeta,
    fetchActiveSuppliers,
    handleCreate,
    handleUpdateNote,
    handleCancel,
    refetch: fetchPayments,
  };
};
