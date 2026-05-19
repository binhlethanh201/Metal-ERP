/**
 * ProductTable Component - Bảng danh sách sản phẩm
 */

import { Table } from '../../../shared/components/Table';
import { Badge } from '../../../shared/components/Badge';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const ProductTable = ({ products = [], loading = false, onEdit, onDelete }) => {
  const columns = [
    {
      key: 'name',
      header: 'Sản phẩm',
      width: '30%',
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">SKU: {row.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      width: '15%',
    },
    {
      key: 'price',
      header: 'Giá',
      width: '15%',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'stock',
      header: 'Tồn kho',
      width: '12%',
      render: (value, row) => {
        let statusColor = 'success';
        if (value === 0) statusColor = 'danger';
        else if (value < row.minStock) statusColor = 'warning';

        return (
          <div>
            <span className="font-medium">{value}</span>
            <Badge variant={statusColor} size="sm" className="ml-2">
              Min: {row.minStock}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '12%',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'secondary'} size="sm">
          {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '16%',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(row)}
            className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            Sửa
          </button>
          <button
            onClick={() => onDelete?.(row.id)}
            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={products}
      loading={loading}
      emptyMessage="Không có sản phẩm nào"
    />
  );
};

export default ProductTable;
