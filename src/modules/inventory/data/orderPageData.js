/**
 * Cấu hình cột, options, hằng số cho trang Quản lý Đơn hàng.
 */

export const STATUS_OPTIONS = [
  'Tất cả',
  'Đã giao hàng',
  'Đang giao hàng',
  'Chờ lấy hàng',
  'Đã hủy',
  'Hoàn thành',
];
export const ORDER_TYPE_OPTIONS = ['Tất cả', 'Giao hàng', 'Tại cửa hàng', 'Online'];
export const RECONCILIATION_OPTIONS = ['Tất cả', 'Chưa đối soát', 'Đã đối soát'];
export const QUICK_DATE_OPTIONS = [
  'Tháng này',
  'Tháng trước',
  'Hôm nay',
  'Hôm qua',
  '7 ngày qua',
  '30 ngày qua',
  'Quý này',
  'Năm nay',
];

// 7 cột cố định (freeze)
export const FROZEN_COLS = [
  { key: 'checkbox', header: '', width: 36, type: 'checkbox' },
  { key: 'createdDate', header: 'Ngày tạo đơn', width: 115, type: 'date' },
  { key: 'deliveryDate', header: 'Ngày giao hàng', width: 135, type: 'date' },
  { key: 'invoiceDate', header: 'Ngày hóa đơn', width: 115, type: 'date' },
  { key: 'status', header: 'Trạng thái', width: 125, type: 'select', options: STATUS_OPTIONS },
  { key: 'orderType', header: 'Loại đơn', width: 100, type: 'select', options: ORDER_TYPE_OPTIONS },
  { key: 'invoiceNo', header: 'Hóa đơn', width: 105, type: 'text' },
];

// 21 cột cuộn ngang
export const SCROLL_COLS = [
  { key: 'salesStaff', header: 'NV bán hàng', width: 115, type: 'text' },
  { key: 'recipientName', header: 'Người nhận', width: 125, type: 'text' },
  { key: 'recipientPhone', header: 'SĐT người nhận', width: 115, type: 'text' },
  { key: 'deliveryAddress', header: 'Địa chỉ giao hàng', width: 180, type: 'text' },
  { key: 'shippingFeeCustomer', header: 'Phí GH thu khách', width: 125, type: 'number' },
  { key: 'deliveryPartner', header: 'ĐT giao hàng', width: 145, type: 'multiline' },
  { key: 'deliveryStatus', header: 'Trạng thái ĐVVC', width: 135, type: 'text' },
  { key: 'trackingCode', header: 'Mã vận đơn', width: 125, type: 'text' },
  { key: 'platformOrderCode', header: 'Mã đơn hàng trên sàn', width: 145, type: 'text' },
  { key: 'totalPayment', header: 'Tổng thanh toán', width: 135, type: 'number' },
  { key: 'deposit', header: 'Đặt cọc', width: 105, type: 'number' },
  { key: 'customerDebt', header: 'Khách nợ', width: 105, type: 'number' },
  { key: 'remainingToCollect', header: 'Còn phải thu', width: 115, type: 'number' },
  { key: 'codAmount', header: 'Thu hộ', width: 105, type: 'number' },
  { key: 'packageInfo', header: 'Thông tin gói hàng', width: 145, type: 'multiline' },
  { key: 'shippingFeePartner', header: 'Phí GH trả ĐT', width: 125, type: 'number' },
  { key: 'salesChannel', header: 'Kênh bán hàng', width: 115, type: 'text' },
  { key: 'note', header: 'Ghi chú', width: 135, type: 'text' },
  { key: 'reconciliationNo', header: 'Phiếu đối soát', width: 125, type: 'text' },
  {
    key: 'reconciliationStatus',
    header: 'Trạng thái đối soát',
    width: 140,
    type: 'select',
    options: RECONCILIATION_OPTIONS,
  },
  { key: 'tags', header: 'Nhãn', width: 130, type: 'tags' },
];

export const ALL_COLS = [...FROZEN_COLS, ...SCROLL_COLS];

export const TAG_COLORS = {
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  cyan: 'bg-cyan-100 text-cyan-700',
};
