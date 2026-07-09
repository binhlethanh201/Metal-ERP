/**
 * dashboardUtils.js — Helpers định dạng số liệu dashboard.
 */

/**
 * Format số tiền VNĐ, tự động viết tắt triệu/tỷ khi cần.
 * @param {number} value
 * @param {boolean} [compact=false] - Dùng dạng rút gọn (1.2 tỷ)
 */
export const fmtVND = (value, compact = false) => {
  if (value == null || isNaN(value)) return '—';
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000)
      return (value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ';
    if (Math.abs(value) >= 1_000_000)
      return (value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';
    return value.toLocaleString('vi-VN') + ' đ';
  }
  return value.toLocaleString('vi-VN') + ' đ';
};

/**
 * Format số nguyên (đơn hàng, khách hàng…).
 */
export const fmtInt = (value) => {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('vi-VN');
};

/**
 * Format phần trăm.
 */
export const fmtPct = (value) => {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%';
};

/**
 * Chuyển "yyyy-MM" → "Th.MM/YY" để hiển thị trên trục biểu đồ.
 */
export const fmtPeriod = (period) => {
  if (!period) return '';
  const [y, m] = period.split('-');
  return `Th.${m}/${String(y).slice(2)}`;
};
