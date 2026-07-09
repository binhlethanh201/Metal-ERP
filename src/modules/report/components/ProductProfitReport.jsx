import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { PRODUCT_PROFIT_COLUMNS } from '../constraints/reportConstants';

export const ProductProfitReport = ({ data, items, totals, isLoading }) => {
  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng doanh thu
          </p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">
            {formatCurrency(totals.totalRevenue)}
          </p>
        </Card>

        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng chi phí vốn
          </p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600">
            {formatCurrency(totals.totalCost)}
          </p>
        </Card>

        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Lợi nhuận gộp
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">
            {formatCurrency(totals.totalProfit)}
          </p>
        </Card>

        {/* NEW */}
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Biên LN trung bình
          </p>
          <p className="mt-1 text-2xl font-extrabold text-purple-600">
            {(totals.averageProfitMargin || 0).toFixed(1)}%
          </p>
        </Card>

        {/* NEW */}
        <Card padding="p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng SL bán
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {totals.totalQuantitySold || 0}
          </p>
        </Card>
      </div>

      <Card padding="p-0">
        <Table
          columns={PRODUCT_PROFIT_COLUMNS}
          data={items}
          loading={isLoading}
          emptyMessage="Không có dữ liệu kinh doanh"
        />
      </Card>
    </>
  );
};

export default ProductProfitReport;
