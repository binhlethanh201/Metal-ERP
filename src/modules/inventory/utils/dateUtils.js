/**
 * Date Utils - Các hàm tiện ích xử lý ngày tháng.
 * Tách từ productUtils.js để tái sử dụng độc lập.
 */

export const parseDateTime = (value) => {
  const [datePart, timePart = '00:00'] = value.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const addDays = (date, days) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

export const getCreatedPresetRange = (label) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const thisWeekStart = startOfDay(addDays(now, -(now.getDay() === 0 ? 6 : now.getDay() - 1)));
  const thisWeekEnd = endOfDay(addDays(thisWeekStart, 6));
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  switch (label) {
    case 'Hôm nay':
      return { start: todayStart, end: todayEnd };
    case 'Hôm qua':
      return { start: startOfDay(addDays(now, -1)), end: endOfDay(addDays(now, -1)) };
    case 'Tuần này':
      return { start: thisWeekStart, end: thisWeekEnd };
    case 'Tuần trước':
      return {
        start: startOfDay(addDays(thisWeekStart, -7)),
        end: endOfDay(addDays(thisWeekEnd, -7)),
      };
    case 'Tháng này':
      return { start: thisMonthStart, end: thisMonthEnd };
    case 'Tháng trước': {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    }
    default:
      return null;
  }
};

export const getEstimatedPresetRange = (label) => {
  const now = new Date();
  switch (label) {
    case 'Ngày mai':
      return { start: startOfDay(addDays(now, 1)), end: endOfDay(addDays(now, 1)) };
    case '3 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 3)) };
    case '5 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 5)) };
    case '7 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
    case '30 ngày tới':
      return { start: startOfDay(now), end: endOfDay(addDays(now, 30)) };
    case 'Tháng này': {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    }
    default:
      return null;
  }
};
