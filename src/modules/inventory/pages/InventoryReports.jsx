/**
 * InventoryReports Page - Báo cáo thống kê
 */

import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

export const InventoryReports = () => {
  const [reportType, setReportType] = useState('stock');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleExport = () => {
    console.log('Export report:', { reportType, dateFrom, dateTo });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo thống kê</h1>
        <p className="mt-1 text-gray-600">Xem các báo cáo về tồn kho, nhập/xuất hàng</p>
      </div>

      {/* Filter */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Loại báo cáo</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="stock">Tồn kho</option>
                <option value="movement">Nhập/Xuất</option>
                <option value="sales">Bán hàng</option>
              </select>
            </div>
            <Input
              label="Từ ngày"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <div className="flex items-end">
              <Button variant="primary" className="w-full">
                Xem báo cáo
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="py-6 text-center">
            <div className="text-3xl font-bold text-blue-600">2,450</div>
            <p className="mt-2 text-sm text-gray-600">Tổng tồn kho</p>
            <p className="mt-1 text-xs text-gray-500">Giá trị: 125.5M VND</p>
          </div>
        </Card>
        <Card>
          <div className="py-6 text-center">
            <div className="text-3xl font-bold text-green-600">1,250</div>
            <p className="mt-2 text-sm text-gray-600">Nhập trong kỳ</p>
            <p className="mt-1 text-xs text-gray-500">50M VND</p>
          </div>
        </Card>
        <Card>
          <div className="py-6 text-center">
            <div className="text-3xl font-bold text-orange-600">850</div>
            <p className="mt-2 text-sm text-gray-600">Xuất trong kỳ</p>
            <p className="mt-1 text-xs text-gray-500">42.5M VND</p>
          </div>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card header="Chi tiết báo cáo">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">Áo sơ mi nam</p>
              <p className="text-sm text-gray-600">Tồn: 45 | Nhập: 20 | Xuất: 5</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">60 cái</p>
              <p className="text-sm text-gray-600">Giá trị: 15M VND</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">Quần jean nam</p>
              <p className="text-sm text-gray-600">Tồn: 8 | Nhập: 0 | Xuất: 12</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">20 cái</p>
              <p className="text-sm text-gray-600">Giá trị: 7M VND</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <Button onClick={handleExport} className="w-full">
            Tải xuống báo cáo
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InventoryReports;
