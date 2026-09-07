/**
 * Utility - Định dạng tiền tệ VND
 */

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 ₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Helper: trim tiền tố số ở đầu tên đơn vị (VD: "1 Bộ" → "Bộ") */
export const trimUnitName = (name) => name ? name.replace(/^[\d]+\s+/g, '').trim() : '';

export default formatCurrency;
