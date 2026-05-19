/**
 * ShiftManagement Page - Quản lý ca bán hàng
 */

import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const ShiftManagement = () => {
  const [shifts] = useState([
    {
      id: 1,
      date: '2024-05-08',
      cashier: 'Nguyễn Văn A',
      startTime: '08:00',
      endTime: '16:00',
      openingBalance: 5000000,
      closingBalance: 8500000,
      totalSales: 3500000,
      status: 'closed',
    },
  ]);

  const [isShiftActive, setIsShiftActive] = useState(false);

  const handleStartShift = () => {
    setIsShiftActive(true);
  };

  const handleEndShift = () => {
    setIsShiftActive(false);
  };

  const totalRevenue = shifts.reduce((sum, shift) => sum + shift.totalSales, 0);
  const avgPerShift = shifts.length > 0 ? totalRevenue / shifts.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý ca bán hàng</h1>
          <p className="mt-1 text-gray-600">Bắt đầu và kết thúc ca làm việc</p>
        </div>
        {!isShiftActive ? (
          <Button variant="primary" onClick={handleStartShift}>
            Bắt đầu ca
          </Button>
        ) : (
          <Button variant="danger" onClick={handleEndShift}>
            Kết thúc ca
          </Button>
        )}
      </div>

      {/* Current Shift Status */}
      {isShiftActive && (
        <Card className="border-2 border-blue-500">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ca làm việc đang mở</h2>
              <Badge variant="success">Đang hoạt động</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600">Bắt đầu lúc</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số lần giao dịch</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doanh số tạm thời</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(4200000)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{shifts.length}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng ca</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="mt-1 text-sm text-gray-600">Tổng doanh thu</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{formatCurrency(avgPerShift)}</div>
            <p className="mt-1 text-sm text-gray-600">Bình quân/ca</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-orange-600">8h</div>
            <p className="mt-1 text-sm text-gray-600">Tổng giờ</p>
          </div>
        </Card>
      </div>

      {/* Shift History */}
      <Card header="Lịch sử ca làm việc">
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div key={shift.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{shift.date}</p>
                  <p className="text-sm text-gray-600">{shift.cashier}</p>
                </div>
                <Badge variant={shift.status === 'closed' ? 'success' : 'warning'}>
                  {shift.status === 'closed' ? 'Đã đóng' : 'Đang mở'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div>
                  <p className="text-gray-600">Giờ làm</p>
                  <p className="font-medium text-gray-900">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Số dư đầu</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(shift.openingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Doanh số</p>
                  <p className="font-medium text-green-600">{formatCurrency(shift.totalSales)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Số dư cuối</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(shift.closingBalance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ShiftManagement;
