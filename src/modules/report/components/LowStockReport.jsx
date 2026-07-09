import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { AlertTriangle } from 'lucide-react';
import { LOW_STOCK_COLUMNS } from '../constraints/reportConstants';

export const LowStockReport = ({ data, isLoading }) => {
  if (!data) return null;

  return (
    <>
      <Card
        padding="p-5"
        className="flex items-center gap-4 border-l-4 border-l-rose-500 bg-rose-50/50"
      >
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-800">Sản phẩm chạm ngưỡng tồn tối thiểu</p>
          <p className="text-2xl font-extrabold text-rose-600">
            {data.totalItems || 0} <span className="text-base font-normal">mã hàng hóa</span>
          </p>
        </div>
      </Card>

      <Card padding="p-0">
        <Table
          columns={LOW_STOCK_COLUMNS}
          data={data.items || []}
          loading={isLoading}
          emptyMessage="Kho đang ở trạng thái an toàn, không có mặt hàng nào sắp hết."
        />
      </Card>
    </>
  );
};

export default LowStockReport;
