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

export default formatCurrency;
