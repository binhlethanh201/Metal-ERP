/**
 * StockImport Page - Nhập kho
 */

import { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { Table } from '../../../shared/components/Table';

export const StockImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imports] = useState([]);

  const importColumns = [
    { key: 'id', header: 'ID', width: '10%' },
    { key: 'productName', header: 'Sản phẩm', width: '30%' },
    { key: 'quantity', header: 'Số lượng', width: '15%' },
    { key: 'date', header: 'Ngày', width: '20%' },
    { key: 'notes', header: 'Ghi chú', width: '25%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhập kho</h1>
          <p className="mt-1 text-gray-600">Ghi nhận hàng nhập từ nhà cung cấp</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nhập hàng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-blue-600">125</div>
            <p className="mt-1 text-sm text-gray-600">Tổng lần nhập</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-green-600">2,450</div>
            <p className="mt-1 text-sm text-gray-600">Tổng số lượng</p>
          </div>
        </Card>
        <Card>
          <div className="py-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">12</div>
            <p className="mt-1 text-sm text-gray-600">Trong tháng</p>
          </div>
        </Card>
      </div>

      {/* Import List */}
      <Card header="Lịch sử nhập kho">
        <Table columns={importColumns} data={imports} emptyMessage="Chưa có lần nhập nào" />
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nhập kho" size="lg">
        <div className="space-y-4">
          <Input label="Chọn sản phẩm *" placeholder="Nhập tên hoặc SKU" />
          <Input label="Số lượng *" type="number" placeholder="0" min="1" />
          <Input label="Ngày nhập *" type="date" />
          <Input label="Ghi chú" placeholder="Ghi chú thêm..." />
        </div>
      </Modal>
    </div>
  );
};

export default StockImport;
