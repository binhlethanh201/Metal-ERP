import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import Icon from '../../../shared/components/Icon';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatDate } from '../../../shared/utils/formatDate';
import { getDefectiveItems } from '../services/warrantyService';

const WarrantyManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await getDefectiveItems(filters);
      if (res?.items) {
        setItems(res.items);
        setTotalCount(res.totalCount || 0);
      }
    } catch (err) {
      console.error('Error fetching defective items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.pageSize, filters.search]);

  const columns = [
    {
      header: 'Ngày đổi',
      key: 'exchangeDate',
      render: (val) => formatDate(val, 'DD/MM/YYYY HH:mm'),
    },
    {
      header: 'Mã phiếu đổi',
      key: 'returnCode',
      render: (val) => <span className="font-mono text-sm">{val}</span>,
    },
    {
      header: 'Khách hàng',
      key: 'customerName',
      render: (val) => <span className="font-medium">{val || 'Khách lẻ'}</span>,
    },
    {
      header: 'Sản phẩm lỗi',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-[#cccccc]">{val}</p>
          <p className="text-xs text-slate-500 font-mono dark:text-[#808080]">{row.skuCode}</p>
        </div>
      ),
    },
    {
      header: 'SL',
      key: 'quantity',
      render: (val) => <span className="font-semibold text-red-600">{val}</span>,
    },
    {
      header: 'Lý do',
      key: 'reason',
      render: (val) => {
        let displayReason = val || 'Sản phẩm lỗi';
        if (val && val.toUpperCase() === 'DEFECTIVE') displayReason = 'Sản phẩm lỗi';
        
        return (
          <Badge variant="warning" className="text-xs">
            {displayReason}
          </Badge>
        );
      },
    }
  ];

  return (
    <div className="flex h-full gap-6">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-3">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">
            Hàng lỗi / Bảo hành
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
            Danh sách các sản phẩm thu hồi từ khách hàng do hỏng/lỗi (từ các phiếu bảo hành)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{totalCount}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 dark:text-[#999999]">
                Tổng sản phẩm
              </p>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="w-80">
              <Input
                placeholder="Tìm theo mã SP, tên KH, mã phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Card padding="p-0">
          <Table
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage="Không có sản phẩm lỗi nào được ghi nhận."
          />
          {totalCount > 0 && (
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-3 dark:border-[#333333] dark:bg-[#0f0f0f]">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-[#999999]">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <select
                    value={filters.pageSize}
                    onChange={(e) => setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
                    className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#d4d4d4]"
                  >
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
                <span>
                  {(filters.page - 1) * filters.pageSize + 1} -{' '}
                  {Math.min(filters.page * filters.pageSize, totalCount)} trong tổng số{' '}
                  {totalCount} sản phẩm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={filters.page <= 1}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <div className="px-3 text-sm text-slate-700 dark:text-[#b3b3b3]">
                  Trang {filters.page} / {Math.ceil(totalCount / filters.pageSize) || 1}
                </div>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, page: Math.min(Math.ceil(totalCount / p.pageSize) || 1, p.page + 1) }))}
                  disabled={filters.page >= Math.ceil(totalCount / filters.pageSize)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-[#404040] dark:bg-[#1a1a1a] dark:text-[#999999] dark:hover:bg-[#272727]"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WarrantyManagement;
