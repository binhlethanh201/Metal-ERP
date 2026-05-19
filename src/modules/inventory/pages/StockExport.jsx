/**
 * StockExport Page - Xuất kho
 */

import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';

export const StockExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exports] = useState([]);

  const exportColumns = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'productName', header: 'Sản phẩm', width: '30%' },
    { key: 'quantity', header: 'Số lượng', width: '15%' },
    { key: 'date', header: 'Ngày', width: '20%' },
    { key: 'reason', header: 'Lý do', width: '25%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xuất kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận hàng xuất từ kho</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Xuất hàng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">298</div>
            <p className="mt-1 text-sm text-gray-600">Tổng lần xuất</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">5,120</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">45</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      {/* Export List */}
      <Card header="Lịch sử xuất kho">
        <Table columns={exportColumns} data={exports} emptyMessage="Chưa có lần xuất nào" />
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Xuất kho" size="lg">
        <div className="space-y-4">
          <Input label="Chọn sản phẩm *" placeholder="Nhập tên hoặc SKU" />
          <Input label="Số lượng *" type="number" placeholder="0" min="1" />
          <Input label="Ngày xuất *" type="date" />
          <Input label="Lý do xuất" placeholder="VD: Bán hàng, hư hỏng, mất..." />
        </div>
      </Modal>
    </div>
  );
};

export default StockExport;
