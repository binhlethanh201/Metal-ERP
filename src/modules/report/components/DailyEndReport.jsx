import { Card } from '../../../shared/components/Card';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const DailyEndReport = ({ data }) => {
  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-5" className="border-t-4 border-t-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Ngày
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-[#e5e5e5]">
            {new Date(data.reportDate).toLocaleDateString('vi-VN')}
          </p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-green-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Tổng doanh thu
          </p>
          <p className="mt-2 text-2xl font-extrabold text-green-600">
            {formatCurrency(data.totalRevenue)}
          </p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Số lượng đơn
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-[#e5e5e5]">
            {data.totalOrders}
          </p>
        </Card>

        <Card padding="p-5" className="border-t-4 border-t-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
            Giá trị trung bình/đơn
          </p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">
            {formatCurrency(data.averageOrderValue)}
          </p>
        </Card>
      </div>

      <Card
        header={
          <h4 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
            Cơ cấu thanh toán
          </h4>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Tiền mặt
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
              {formatCurrency(data.paymentBreakdown?.cashAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
              {data.paymentBreakdown?.cashCount || 0} đơn
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Chuyển khoản
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
              {formatCurrency(data.paymentBreakdown?.transferAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
              {data.paymentBreakdown?.transferCount || 0} đơn
            </p>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Ghi nợ (Công nợ)
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
              {formatCurrency(data.paymentBreakdown?.debtAmount || 0)}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#999999]">
              {data.paymentBreakdown?.debtCount || 0} đơn
            </p>
          </div>
        </div>
      </Card>
      {(data.refundCount > 0 || data.refundCashAmount > 0 || data.refundTransferAmount > 0) && (
        <Card
          header={
            <h4 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
              Hoàn tiền (phiếu trả hàng)
            </h4>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Hoàn tiền mặt
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
                {formatCurrency(data.refundCashAmount || 0)}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Hoàn chuyển khoản
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
                {formatCurrency(data.refundTransferAmount || 0)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#333333] dark:bg-[#1a1a1a]/50">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#999999]">
                Số phiếu trả
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
                {data.refundCount || 0}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-[#999999]">
                Đổi hàng ngang giá không tính ở đây
              </p>
            </div>
          </div>
        </Card>
      )}
      <Card
        header={
          <h4 className="text-lg font-bold text-slate-800 dark:text-[#e5e5e5]">
            Phiếu kho trong ngày
          </h4>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Phiếu nhập
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
              {data.inwardTicketCount || 0}
            </p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-900/20">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Phiếu xuất
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-[#e5e5e5]">
              {data.outwardTicketCount || 0}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DailyEndReport;
