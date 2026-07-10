/**
 * Utility - Định dạng ngày tháng
 */

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';

  // Chuẩn hóa ISO string: cắt microsecond về millisecond (chỉ giữ 3 số sau dấu .)
  let d;
  if (typeof date === 'string') {
    const normalized = date.replace(/(\.\d{3})\d+/, '.$1');
    d = new Date(normalized);
    // Nếu vẫn lỗi, thử parse thủ công ISO format
    if (isNaN(d.getTime())) {
      const m = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
      if (m) {
        d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
      }
    }
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) return '';

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

export const formatDateTime = (date) => formatDate(date, 'DD/MM/YYYY HH:mm');

export const formatTime = (date) => formatDate(date, 'HH:mm:ss');

const dateUtils = { formatDate, formatDateTime, formatTime };

export default dateUtils;
