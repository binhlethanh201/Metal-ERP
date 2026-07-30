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
  { key: 'closingStock', header: 'Cuối kỳ' },
  { key: 'openingValue', header: 'Giá trị đầu kỳ', render: (v) => formatCurrency(v) },
  { key: 'inwardValue', header: 'Giá trị nhập', render: (v) => formatCurrency(v) },
  { key: 'outwardValue', header: 'Giá trị xuất', render: (v) => formatCurrency(v) },
  { key: 'closingValue', header: 'Giá trị cuối kỳ', render: (v) => formatCurrency(v) },
];

export const LOW_STOCK_COLUMNS = [
  { key: 'productCode', header: 'Mã SP' },
  { key: 'productName', header: 'Tên sản phẩm' },
  { key: 'categoryName', header: 'Nhóm' },
  { key: 'currentStock', header: 'Tồn hiện tại' },
  { key: 'minimumStock', header: 'Tồn tối thiểu' },
  { key: 'shortage', header: 'Chênh lệch' },
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
  { key: 'status', header: 'Trạng thái' },
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
    render: (v) => <span className="font-medium text-slate-900">{formatCurrency(v)}</span>,
  },
  { key: 'note', header: 'Ghi chú' },
];
