/**
 * Utility - Định dạng ngày tháng
 */

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatDateTime = (date) => formatDate(date, 'DD/MM/YYYY HH:mm:ss');

export const formatTime = (date) => formatDate(date, 'HH:mm:ss');

const dateUtils = { formatDate, formatDateTime, formatTime };

export default dateUtils;
