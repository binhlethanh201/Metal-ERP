/**
 * Hook quản lý danh sách phiếu kiểm kê.
 */
import { useState, useMemo } from 'react';
import { inventoryCountRows } from '../data/inventoryCountMockData';

export const useInventoryCount = () => {
  const [rows] = useState(inventoryCountRows);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...rows];
    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.countNumber.toLowerCase().includes(kw) ||
          r.warehouse.toLowerCase().includes(kw) ||
          r.counter.toLowerCase().includes(kw)
      );
    }
    if (timeFilter === 'thisMonth') {
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      result = result.filter((r) => new Date(r.date) >= start);
    } else if (timeFilter === 'lastMonth') {
      const now = new Date();
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      result = result.filter((r) => {
        const d = new Date(r.date);
        return d >= s && d <= e;
      });
    }
    return result;
  }, [rows, searchTerm, timeFilter]);

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return {
    rows: paged,
    totalCount: filtered.length,
    searchTerm,
    setSearchTerm,
    timeFilter,
    setTimeFilter,
    selectedIds,
    setSelectedIds,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    totalPages,
  };
};
