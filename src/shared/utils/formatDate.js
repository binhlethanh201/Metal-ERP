/**
 * Utility - Định dạng ngày tháng
 */

export const formatDate = (date, format = 'DD/MM/YYYY', options = {}) => {
  if (!date) return '';

  // Chuẩn hóa ISO string: cắt microsecond về millisecond (chỉ giữ 3 số sau dấu .)
  let d;
  if (typeof date === 'string') {
    let normalized = date.replace(/(\.\d{3})\d+/, '$1');
    // Nếu ISO string không có Z hoặc offset timezone, tự động thêm Z để được parse như UTC
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(normalized)) {
      normalized += 'Z';
    }
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

  // Nếu có timeZone option, format theo timezone đó (dùng Intl, browser-independent)
  if (options.timeZone) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: options.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = {};
    for (const p of fmt.formatToParts(d)) {
      if (p.type !== 'literal') parts[p.type] = p.value;
    }
    const hour = parts.hour === '24' ? '00' : parts.hour;
    return format
      .replace('DD', parts.day)
      .replace('MM', parts.month)
      .replace('YYYY', parts.year)
      .replace('HH', hour)
      .replace('mm', parts.minute)
      .replace('ss', parts.second);
  }

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

/**
 * Trả về chuỗi ngày YYYY-MM-DD theo giờ địa phương (KHÔNG dùng UTC).
 * Dùng để gửi query params date cho API, tránh lệch 1 ngày khi dùng toISOString().
 */
export const getLocalDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Trả về chuỗi datetime YYYY-MM-DDTHH:mm theo giờ địa phương.
 * Dùng cho input type="datetime-local".
 */
export const getLocalDateTimeString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
};

const dateUtils = { formatDate, formatDateTime, formatTime };

export default dateUtils;
