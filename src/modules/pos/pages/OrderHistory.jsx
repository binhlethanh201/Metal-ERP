/**
 * OrderHistory Page - Lịch sử đơn hàng
 */

import { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { Badge } from '../../../shared/components/Badge';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { formatDate } from '../../../shared/utils/formatDate';
import { mockOrders } from '../data/posMockData';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setOrders(mockOrders);
  }, []);

  const columns = [
    {
      key: 'id',
      header: 'Mã đơn hàng',
      width: '15%',
      render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
    },
    {
      key: 'date',
      header: 'Ngày',
      width: '15%',
      render: (value) => formatDate(value),
    },
    {
      key: 'items',
      header: 'Số mặt hàng',
      width: '12%',
      render: (value) => <span>{value} sản phẩm</span>,
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      width: '18%',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'paymentMethod',
      header: 'Thanh toán',
      width: '15%',
      render: (value) => {
        const labels = {
          cash: 'Tiền mặt',
          card: 'Thẻ',
          transfer: 'Chuyển khoản',
        };
        return <span>{labels[value] || value}</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '15%',
      render: (value) => (
        <Badge variant={value === 'completed' ? 'success' : 'warning'}>
          {value === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '10%',
      render: (_, row) => (
        <button className="text-sm text-blue-600 hover:underline">Chi tiết</button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <p className="mt-1 text-gray-600">Xem tất cả các đơn hàng đã bán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">1,250</div>
            <p className="mt-1 text-sm text-gray-600">Tổng đơn hàng</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">52.5M</div>
            <p className="mt-1 text-sm text-gray-600">Doanh thu</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">125</div>
            <p className="mt-1 text-sm text-gray-600">Hôm nay</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-purple-600">42K</div>
            <p className="mt-1 text-sm text-gray-600">Trung bình/đơn</p>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select className="rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none">
            <option>Tất cả trạng thái</option>
            <option>Hoàn thành</option>
            <option>Đang xử lý</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table columns={columns} data={orders} />
      </Card>
    </div>
  );
};

export default OrderHistory;
