import { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { Card } from '../../../shared/components/Card';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';
import { PURCHASE_COLUMNS, PAYMENT_COLUMNS } from '../constraints/reportConstants';

export const SupplierDetailReport = ({ data, purchaseHistory, paymentHistory, isLoading }) => {
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePageSize, setPurchasePageSize] = useState(20);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(20);

  const purchases = purchaseHistory || [];
  const payments = paymentHistory || [];

  const purchaseTotalPages = Math.ceil(purchases.length / purchasePageSize) || 1;
  const paginatedPurchases = useMemo(() => {
    const start = (purchasePage - 1) * purchasePageSize;
    return purchases.slice(start, start + purchasePageSize);
  }, [purchases, purchasePage, purchasePageSize]);

  const paymentTotalPages = Math.ceil(payments.length / paymentPageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * paymentPageSize;
    return payments.slice(start, start + paymentPageSize);
  }, [payments, paymentPage, paymentPageSize]);

  if (!data) return null;

  const PaginationRow = ({ page, setPage, pageSize, setPageSize, total, totalPages }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary">
            <option value={20}>20 dòng</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
          </select>
        </div>
        <span>{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} trong tổng số {total} dòng</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
        <div className="px-3 text-sm text-slate-700">Trang {page} / {totalPages}</div>
        <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card header={<h3 className="text-lg font-bold">Thông tin nhập hàng</h3>}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Đối tác</p>
              <p className="text-xl font-bold text-slate-900">{data.supplierName}</p>
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
                <p className="mt-1 text-lg font-bold text-blue-700">{formatCurrency(data.totalPurchaseAmount)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-bold">Tình trạng công nợ</h3>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Tổng nợ phát sinh:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(data.debtInfo?.totalDebt)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Đã thanh toán:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(data.debtInfo?.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 py-2">
              <span className="text-sm text-slate-600">Đơn hàng chờ xử lý:</span>
              <span className="font-semibold text-slate-900">{data.debtInfo?.pendingOrders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-slate-900">Dư nợ hiện tại:</span>
              <span className="text-lg font-bold text-rose-600">{formatCurrency(data.debtInfo?.remainingDebt)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="p-0" className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">Lịch sử nhập hàng</div>
          <Table columns={PURCHASE_COLUMNS} data={paginatedPurchases} loading={isLoading} emptyMessage="Không có đơn nhập" />
          {purchases.length > 0 && <PaginationRow page={purchasePage} setPage={setPurchasePage} pageSize={purchasePageSize} setPageSize={setPurchasePageSize} total={purchases.length} totalPages={purchaseTotalPages} />}
        </Card>

        <Card padding="p-0" className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-800">Lịch sử thanh toán</div>
          <Table columns={PAYMENT_COLUMNS} data={paginatedPayments} loading={isLoading} emptyMessage="Chưa có thanh toán nào" />
          {payments.length > 0 && <PaginationRow page={paymentPage} setPage={setPaymentPage} pageSize={paymentPageSize} setPageSize={setPaymentPageSize} total={payments.length} totalPages={paymentTotalPages} />}
        </Card>
      </div>
    </>
  );
};

export default SupplierDetailReport;
