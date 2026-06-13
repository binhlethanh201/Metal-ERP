/**
 * OrderHistory Page - Lich su don hang POS (ban tai quay, khong giao hang)
 */
import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Input } from '../../../shared/components/Input';
import { Table } from '../../../shared/components/Table';
import { formatCurrency } from '../../../shared/utils/formatCurrency';

const MOCK_ORDERS = [
  {
    id: 'POS-20240508-001',
    date: '2024-05-08 14:30',
    customer: 'Cty TNHH XD Minh Phat',
    cashier: 'Nguyen Van A',
    items: 5,
    subtotal: 4200000,
    discount: 0,
    vat: 336000,
    total: 4536000,
    payLines: [{ method: 'Tiền mặt', amount: 5000000 }],
    change: 464000,
  },
  {
    id: 'POS-20240508-002',
    date: '2024-05-08 15:10',
    customer: 'Khách lẻ',
    cashier: 'Nguyen Van A',
    items: 2,
    subtotal: 850000,
    discount: 50000,
    vat: 64000,
    total: 864000,
    payLines: [{ method: 'The', amount: 864000 }],
    change: 0,
  },
  {
    id: 'POS-20240508-003',
    date: '2024-05-08 16:45',
    customer: 'Dai ly Tuan Kiet',
    cashier: 'Nguyen Van A',
    items: 12,
    subtotal: 12500000,
    discount: 500000,
    vat: 960000,
    total: 12960000,
    payLines: [
      { method: 'Tiền mặt', amount: 8000000 },
      { method: 'Chuyển khoản', amount: 4960000 },
    ],
    change: 0,
  },
  {
    id: 'POS-20240507-004',
    date: '2024-05-07 09:15',
    customer: 'Nha thau Quang Vinh',
    cashier: 'Tran Thi B',
    items: 8,
    subtotal: 5600000,
    discount: 0,
    vat: 448000,
    total: 6048000,
    payLines: [{ method: 'Chuyển khoản', amount: 6048000 }],
    change: 0,
  },
  {
    id: 'POS-20240507-005',
    date: '2024-05-07 11:30',
    customer: 'Khách lẻ',
    cashier: 'Tran Thi B',
    items: 1,
    subtotal: 1550000,
    discount: 0,
    vat: 124000,
    total: 1674000,
    payLines: [{ method: 'Tiền mặt', amount: 1700000 }],
    change: 26000,
  },
  {
    id: 'POS-20240507-006',
    date: '2024-05-07 14:00',
    customer: 'Anh Nguyen Van Hung',
    cashier: 'Tran Thi B',
    items: 3,
    subtotal: 2100000,
    discount: 0,
    vat: 168000,
    total: 2268000,
    payLines: [{ method: 'The', amount: 2268000 }],
    change: 0,
  },
  {
    id: 'POS-20240506-007',
    date: '2024-05-06 08:30',
    customer: 'Cua hang VLXD Tuan Kiet',
    cashier: 'Le Van C',
    items: 20,
    subtotal: 18500000,
    discount: 925000,
    vat: 1406000,
    total: 18981000,
    payLines: [
      { method: 'Tiền mặt', amount: 10000000 },
      { method: 'Chuyển khoản', amount: 8981000 },
    ],
    change: 0,
  },
  {
    id: 'POS-20240506-008',
    date: '2024-05-06 10:15',
    customer: 'Khách lẻ',
    cashier: 'Le Van C',
    items: 2,
    subtotal: 550000,
    discount: 0,
    vat: 44000,
    total: 594000,
    payLines: [{ method: 'Tiền mặt', amount: 600000 }],
    change: 6000,
  },
];

const PAYMENT_VARIANTS = { 'Tiền mặt': 'warning', The: 'info', 'Chuyển khoản': 'primary' };

const OrderHistory = () => {
  const navigate = useNavigate();
  const { drafts, setDrafts } = useOutletContext();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank', 'width=420,height=800');
    if (!printWindow) return;

    const totalPaid = order.payLines.reduce((s, pl) => s + pl.amount, 0);

    const payLinesHtml = order.payLines
      .map((pl) => `<tr><td>${pl.method}</td><td class="r">${formatCurrency(pl.amount)}</td></tr>`)
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>In hoa don ${order.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:'Consolas','Courier New',monospace;
    font-size:14px;
    color:#000;
    background:#fff;
    max-width:320px;
    margin:0 auto;
    padding:14px 10px;
    line-height:1.35;
  }
  .c{text-align:center}
  .r{text-align:right;white-space:nowrap}
  h2{font-size:18px;font-weight:700;margin-bottom:2px}
  .sub{font-size:12px;color:#333;margin-bottom:1px}
  hr{border:none;border-top:1px dashed #000;margin:8px 0}
  hr.d{border-top:1px dotted #888}
  table{width:100%;border-collapse:collapse}
  td{padding:2px 0;font-size:14px;vertical-align:top}
  .bold{font-weight:700}
  .lg{font-size:17px}
  .thanks{font-size:14px;font-weight:700;margin-top:6px}
  @media print{
    body{max-width:100%;width:100%;padding:12px 16px;font-size:12px}
    td{font-size:12px}
    h2{font-size:16px}
    .lg{font-size:15px}
    .sub{font-size:11px}
    .thanks{font-size:12px}
  }
</style></head>
<body>
<div class="c">
  <h2>MEP SYSTEM</h2>
  <p class="sub">12 Nguyen Van Bao, P.4, Go Vap, TP.HCM</p>
  <p class="sub">DT: 028.3999.8888 &bull; MST: 0312345678</p>
</div>
<hr>
<div class="c">
  <p class="bold lg">HOA DON BAN HANG</p>
  <p style="font-size:13px;color:#555">Ma: ${order.id}</p>
  <p style="font-size:13px;color:#555">${new Date(order.date).toLocaleString('vi-VN')}</p>
</div>
<hr>
<table>
  <tr><td>So mon</td><td class="r">${order.items} mon</td></tr>
  <tr><td>Thu ngan</td><td class="r">${order.cashier}</td></tr>
</table>
<hr>
<table>
  <tr><td>Tam tinh</td><td class="r">${formatCurrency(order.subtotal)}</td></tr>
  ${order.discount > 0 ? `<tr><td style="color:#c62828;">Giam gia</td><td class="r" style="color:#c62828;">-${formatCurrency(order.discount)}</td></tr>` : ''}
  <tr><td>VAT (8%)</td><td class="r">${formatCurrency(order.vat)}</td></tr>
  <tr class="bold lg"><td>TONG CONG</td><td class="r">${formatCurrency(order.total)}</td></tr>
</table>
<hr>
<table>
  <tr><td>Khach hang</td><td class="r">${order.customer}</td></tr>
  ${payLinesHtml}
  <tr class="bold"><td>Da thanh toan</td><td class="r">${formatCurrency(totalPaid)}</td></tr>
  ${order.change > 0 ? `<tr><td style="color:#e65100;">Tien thua</td><td class="r" style="color:#e65100;">${formatCurrency(order.change)}</td></tr>` : ''}
</table>
<hr class="d">
<div class="c">
  <p class="thanks">Cam on quy khach!</p>
  <p style="font-size:13px;color:#666">Hen gap lai &#9728;</p>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
    printWindow.document.close();
  };

  const filtered = useMemo(() => {
    let list = MOCK_ORDERS;
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(
        (o) => o.id.toLowerCase().includes(kw) || o.customer.toLowerCase().includes(kw)
      );
    }
    if (timeFilter === 'today') list = list.filter((o) => o.date.startsWith('2024-05-08'));
    if (timeFilter === 'yesterday') list = list.filter((o) => o.date.startsWith('2024-05-07'));
    if (timeFilter === 'week') list = list.filter((o) => o.date >= '2024-05-01');
    return list;
  }, [search, timeFilter]);

  const todayOrders = MOCK_ORDERS.filter((o) => o.date.startsWith('2024-05-08'));
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayCount = todayOrders.length;
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);

  const columns = [
    {
      key: 'id',
      header: 'Mã đơn',
      width: '160px',
      render: (v) => <span className="font-mono text-xs font-bold text-[#004785]">{v}</span>,
    },
    {
      key: 'date',
      header: 'Thời gian',
      width: '140px',
      render: (v) => <span className="text-xs text-slate-500">{v}</span>,
    },
    {
      key: 'customer',
      header: 'Khách hàng',
      render: (v) => <span className="text-xs font-medium text-slate-900">{v}</span>,
    },
    {
      key: 'items',
      header: 'Mon',
      width: '50px',
      render: (v) => <span className="text-slate-600">{v}</span>,
    },
    {
      key: 'payLines',
      header: 'Thanh toán',
      width: '160px',
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.map((pl, i) => (
            <Badge key={i} variant={PAYMENT_VARIANTS[pl.method] || 'secondary'} size="sm">
              {pl.method}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      render: (v) => <span className="text-xs font-bold text-green-600">{formatCurrency(v)}</span>,
    },
    {
      key: 'cashier',
      header: 'Thu ngân',
      render: (v) => <span className="text-xs text-slate-500">{v}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '70px',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelected(row)}
          className="text-xs font-medium text-[#004785] hover:underline"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'week', label: 'Tuần này' },
  ];

  return (
    <div className="flex h-full gap-6">
      {/* LEFT: List */}
      <div className={`flex flex-col gap-4 overflow-y-auto ${selected ? 'flex-1' : 'flex-1'}`}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem lại các đơn đã bán và đơn nháp chưa thanh toán
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-[#004785]">{todayCount}</div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Đơn hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-green-600">
                {formatCurrency(todayRevenue)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Doanh thu hôm nay
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-purple-600">
                {todayCount > 0 ? formatCurrency(todayRevenue / todayCount) : '0 d'}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Bình quân/đơn
              </p>
            </div>
          </Card>
          <Card padding="p-4">
            <div className="text-center">
              <div className="text-xl font-extrabold text-orange-600">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                Tổng tháng
              </p>
            </div>
          </Card>
        </div>

        {/* Drafts - Đơn nháp chưa thanh toán */}
        {drafts.length > 0 && (
          <Card header={`Đơn nháp (${drafts.length})`} padding="p-0">
            <div className="divide-y divide-slate-100">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">Nháp</Badge>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {d.customer ? d.customer.name : 'Khách lẻ'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {d.items.length} mon - {formatCurrency(d.total)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/pos', { state: { draft: d } })}
                    >
                      Tiếp tục
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDrafts((prev) => prev.filter((x) => x.id !== d.id))}
                      className="rounded p-1 text-slate-400 hover:text-red-500"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search + Filter + Action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="w-60">
              <Input
                placeholder="Tìm mã đơn hoặc khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTimeFilter(f.id)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${timeFilter === f.id ? 'bg-[#004785] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" onClick={() => navigate('/pos')}>
            + Tạo đơn mới
          </Button>
        </div>

        {/* Table */}
        <Card padding="p-0">
          <Table columns={columns} data={filtered} emptyMessage="Không có đơn hàng nào" />
        </Card>
      </div>

      {/* RIGHT: Detail Panel */}
      {selected && (
        <div className="w-96 shrink-0 space-y-4 overflow-y-auto">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#004785]">{selected.id}</h3>
                  <p className="text-xs text-slate-400">{selected.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Khách hàng</span>
                  <span className="font-semibold">{selected.customer}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Thu ngân</span>
                  <span>{selected.cashier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">So mon</span>
                  <span className="font-semibold">{selected.items}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card header="Thanh toán">
            <div className="space-y-2">
              {selected.payLines.map((pl, i) => (
                <div key={i} className="flex justify-between rounded-lg bg-slate-50 p-2 text-sm">
                  <Badge variant={PAYMENT_VARIANTS[pl.method] || 'secondary'} size="sm">
                    {pl.method}
                  </Badge>
                  <span className="font-bold">{formatCurrency(pl.amount)}</span>
                </div>
              ))}
              <div className="space-y-1 border-t border-slate-200 pt-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(selected.subtotal)}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-xs text-red-500">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>VAT</span>
                  <span>{formatCurrency(selected.vat)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-[#004785]">
                  <span>Tong</span>
                  <span>{formatCurrency(selected.total)}</span>
                </div>
              </div>
              {selected.change > 0 && (
                <div className="flex justify-between rounded-lg bg-green-50 p-2 text-sm">
                  <span className="text-green-700">Tiền thừa</span>
                  <span className="font-bold text-green-700">
                    {formatCurrency(selected.change)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handlePrintOrder(selected)}>
              In hóa đơn
            </Button>
          </div>
        </div>
      )}

      {!selected && (
        <div className="hidden w-96 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 xl:flex">
          <div className="px-4 text-center">
            <p className="text-4xl text-slate-300">📋</p>
            <p className="mt-3 text-sm font-medium text-slate-400">Chọn một đơn hàng</p>
            <p className="text-xs text-slate-300">để xem chi tiết</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
