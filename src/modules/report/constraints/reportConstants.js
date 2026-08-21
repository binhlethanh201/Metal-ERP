import { formatCurrency } from '../../../shared/utils/formatCurrency';

export const REPORT_TYPES = [
  { key: 'daily-end', label: 'Báo cáo cuối ngày' },
  { key: 'stock-movement', label: 'Báo cáo xuất nhập tồn' },
  { key: 'revenue-by-time', label: 'Doanh thu theo thời gian' },
  { key: 'low-stock', label: 'Tồn kho sắp hết' },
  { key: 'product-profit', label: 'Lợi nhuận theo sản phẩm' },
  { key: 'supplier-detail', label: 'Chi tiết nhà cung cấp' },
];

export const STOCK_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'openingStock', header: 'Đầu kỳ' },
  { key: 'inwardQuantity', header: 'Nhập' },
  { key: 'outwardQuantity', header: 'Xuất' },
  { key: 'adjustmentQuantity', header: 'Điều chỉnh' },
  { key: 'closingStock', header: 'Cuối kỳ' },
  { key: 'openingValue', header: 'Giá trị đầu kỳ', render: (v) => formatCurrency(v) },
  { key: 'inwardValue', header: 'Giá trị nhập', render: (v) => formatCurrency(v) },
  { key: 'outwardValue', header: 'Giá trị xuất', render: (v) => formatCurrency(v) },
  { key: 'adjustmentValue', header: 'Giá trị điều chỉnh', render: (v) => formatCurrency(v) },
  { key: 'closingValue', header: 'Giá trị cuối kỳ', render: (v) => formatCurrency(v) },
];

export const LOW_STOCK_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'currentStock', header: 'Tồn hiện tại' },
  { key: 'shortage', header: 'Chênh lệch' },
  { key: 'minimumStock', header: 'Tồn tối thiểu' },
  {
    key: 'severity',
    header: 'Mức độ',
    render: (v) => {
      const styles = {
        Critical: 'bg-red-100 text-red-700',
        Warning: 'bg-amber-100 text-amber-700',
        Low: 'bg-sky-100 text-sky-700',
      };
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[v] || 'bg-slate-100 text-slate-600'}`}
        >
          {v}
        </span>
      );
    },
  },
];

export const PRODUCT_PROFIT_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  {
    key: 'quantitySold',
    header: 'SL Bán',
    render: (v) => <span className="font-medium">{v}</span>,
  },
  { key: 'revenue', header: 'Doanh thu', render: (v) => formatCurrency(v) },
  { key: 'cost', header: 'Giá vốn', render: (v) => formatCurrency(v) },
  {
    key: 'profit',
    header: 'Lợi nhuận',
    render: (v) => <span className="font-bold text-green-600">{formatCurrency(v)}</span>,
  },
  {
    key: 'profitMargin',
    header: 'Biên LN',
    render: (v) => <span className="font-semibold text-purple-600">{(v ?? 0).toFixed(2)}%</span>,
  },
];

export const PURCHASE_COLUMNS = [
  { key: 'orderCode', header: 'Mã đơn' },
  { key: 'createdAt', header: 'Ngày tạo', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
  {
    key: 'totalAmount',
    header: 'Tổng tiền',
    render: (v) => <span className="font-medium text-slate-900">{formatCurrency(v)}</span>,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (v) => {
      const statusStr = (v || '').toUpperCase();
      if (statusStr === 'CANCELLED') {
        return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">Đã hủy</span>;
      }
      if (statusStr === 'COMPLETED') {
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Hoàn thành</span>;
      }
      if (statusStr === 'PENDING') {
        return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Đang chờ</span>;
      }
      return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-400">{v}</span>;
    },
  },
];

export const PAYMENT_COLUMNS = [
  { key: 'paymentId', header: 'Mã thanh toán' },
  {
    key: 'createdAt',
    header: 'Ngày thanh toán',
    render: (v) => new Date(v).toLocaleDateString('vi-VN'),
  },
  {
    key: 'amount',
    header: 'Số tiền',
    render: (v, row) => {
      const cancelled = (row?.status || row?.Status) === 'CANCELLED';
      return (
        <span className={cancelled ? 'font-medium text-slate-400 line-through dark:text-[#808080]' : 'font-medium text-slate-900 dark:text-[#e5e5e5]'}>
          {formatCurrency(v)}
        </span>
      );
    },
  },
  {
    key: 'note',
    header: 'Ghi chú',
    render: (v, row) => {
      const cancelled = (row?.status || row?.Status) === 'CANCELLED';
      return cancelled ? (
        <span className="text-slate-400 line-through dark:text-[#808080]">{v || '---'}</span>
      ) : (
        <span>{v || '---'}</span>
      );
    },
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (v) => {
      const cancelled = (v || '').toUpperCase() === 'CANCELLED';
      return cancelled ? (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">Đã hủy</span>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Hoạt động</span>
      );
    },
  },
];
