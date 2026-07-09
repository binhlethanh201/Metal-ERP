import { Card } from '../../../shared/components/Card';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const DailyEndReport = ({ data }) => {
  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-5" className="border-t-4 border-t-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Ngày / Chi nhánh
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {new Date(data.reportDate).toLocaleDateString('vi-VN')}
          </p>
          <p className="text-sm text-slate-500">{data.branchName || 'Toàn hệ thống'}</p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-green-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng doanh thu
          </p>
          <p className="mt-2 text-2xl font-extrabold text-green-600">
            {formatCurrency(data.totalRevenue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Số lượng đơn
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{data.totalOrders}</p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Giá trị trung bình/đơn
          </p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">
            {formatCurrency(data.averageOrderValue)}
          </p>
        </Card>
      </div>

      <Card header={<h4 className="text-lg font-bold text-slate-800">Cơ cấu thanh toán</h4>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Tiền mặt</p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {formatCurrency(data.paymentBreakdown?.cashAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {data.paymentBreakdown?.cashCount || 0} đơn
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Chuyển khoản</p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {formatCurrency(data.paymentBreakdown?.transferAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {data.paymentBreakdown?.transferCount || 0} đơn
            </p>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
              Ghi nợ (Công nợ)
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {formatCurrency(data.paymentBreakdown?.debtAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {data.paymentBreakdown?.debtCount || 0} đơn
            </p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Thanh toán kết hợp
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {formatCurrency(data.paymentBreakdown?.combinedAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {data.paymentBreakdown?.combinedCount || 0} đơn
            </p>
          </div>
        </div>
      </Card>
      <Card header={<h4 className="text-lg font-bold text-slate-800">Phiếu kho trong ngày</h4>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Phiếu nhập</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{data.inwardTicketCount || 0}</p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Phiếu xuất</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{data.outwardTicketCount || 0}</p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DailyEndReport;
