import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { PURCHASE_COLUMNS, PAYMENT_COLUMNS } from '../constraints/reportConstants';

export const SupplierDetailReport = ({ data, purchaseHistory, paymentHistory, isLoading }) => {
  if (!data) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card header={<h3 className="text-lg font-bold">Thông tin nhập hàng</h3>}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Đối tác</p>
              <p className="text-xl font-bold text-slate-900">{data.supplierName}</p>
              {/* NEW: nhóm NCC + liên hệ trước đây bị bỏ qua hoàn toàn */}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                {data.groupName && <span>Nhóm: {data.groupName}</span>}
                {data.contactPhone && <span>SĐT: {data.contactPhone}</span>}
                {data.contactEmail && <span>Email: {data.contactEmail}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Tổng đơn nhập</p>
                <p className="mt-1 text-lg font-bold text-blue-700">{data.totalPurchaseOrders}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Tổng tiền nhập</p>
                <p className="mt-1 text-lg font-bold text-blue-700">
                  {formatCurrency(data.totalPurchaseAmount)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-bold">Tình trạng công nợ</h3>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Tổng nợ phát sinh:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(data.debtInfo?.totalDebt)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Đã thanh toán:</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(data.debtInfo?.totalPaid)}
              </span>
            </div>
            {/* NEW */}
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Đơn hàng chờ xử lý:</span>
              <span className="font-semibold text-slate-900">
                {data.debtInfo?.pendingOrders ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-slate-900">Dư nợ hiện tại:</span>
              <span className="text-lg font-bold text-rose-600">
                {formatCurrency(data.debtInfo?.remainingDebt)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="p-0" className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">
            Lịch sử nhập hàng
          </div>
          <Table
            columns={PURCHASE_COLUMNS}
            data={purchaseHistory}
            loading={isLoading}
            emptyMessage="Không có đơn nhập"
          />
        </Card>

        <Card padding="p-0" className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">
            Lịch sử thanh toán
          </div>
          <Table
            columns={PAYMENT_COLUMNS}
            data={paymentHistory}
            loading={isLoading}
            emptyMessage="Chưa có thanh toán nào"
          />
        </Card>
      </div>
    </>
  );
};

export default SupplierDetailReport;
