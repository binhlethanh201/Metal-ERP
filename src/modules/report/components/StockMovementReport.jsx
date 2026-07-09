import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { STOCK_COLUMNS } from '../constraints/reportConstants';

export const StockMovementReport = ({ data, isLoading }) => {
  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card padding="p-5" className="border-l-4 border-l-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Giá trị Tồn Đầu Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {formatCurrency(data.totalOpeningValue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Giá trị Nhập Trong Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(data.totalInwardValue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-l-4 border-l-rose-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Giá trị Xuất Trong Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600">
            {formatCurrency(data.totalOutwardValue)}
          </p>
        </Card>

        {/* NEW */}
        <Card padding="p-5" className="border-l-4 border-l-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Giá trị Tồn Cuối Kỳ
          </p>
          <p className="mt-1 text-2xl font-extrabold text-indigo-700">
            {formatCurrency(data.totalClosingValue)}
          </p>
        </Card>
      </div>

      <Card padding="p-0">
        <Table
          columns={STOCK_COLUMNS}
          data={data.items || []}
          loading={isLoading}
          emptyMessage="Không có dữ liệu xuất nhập tồn trong khoảng thời gian này"
        />
      </Card>
    </>
  );
};

export default StockMovementReport;
