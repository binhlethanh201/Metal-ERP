import { useState, useEffect, useCallback } from 'react';
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from '../services/expenseService';

export const useExpenseCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getExpenseCategories();
      const data = response?.data || response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Không thể tải danh sách nhóm chi phí.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (categoryName) => {
    const response = await createExpenseCategory(categoryName);
    await fetchCategories();
    return response;
  };

  const handleUpdate = async (id, categoryName) => {
    const response = await updateExpenseCategory(id, categoryName);
    await fetchCategories();
    return response;
  };

  const handleDelete = async (id) => {
    const response = await deleteExpenseCategory(id);
    await fetchCategories();
    return response;
  };

  return {
    categories,
    loading,
    error,
    setError,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: fetchCategories,
  };
};

export default useExpenseCategory;
