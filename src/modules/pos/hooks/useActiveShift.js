import { useCallback, useEffect, useRef, useState } from 'react';
import { getShifts } from '../services/posService';

const STORAGE_KEY = 'pos_active_shift';

// Ca quá 24 giờ coi như "kẹt" / bị bỏ quên → bỏ qua, không dùng và clear khỏi localStorage.
const MAX_SHIFT_AGE_HOURS = 24;

const isStaleShift = (startedAt) => {
  if (!startedAt) return true;
  const t = new Date(startedAt).getTime();
  if (Number.isNaN(t)) return true;
  const ageHours = (Date.now() - t) / (1000 * 60 * 60);
  return ageHours > MAX_SHIFT_AGE_HOURS;
};

const isFreshShift = (startedAt) => !isStaleShift(startedAt);

/**
 * Đồng bộ ca đang mở từ BE về localStorage.
 * Tránh lỗi MSG-76 khi user đăng nhập lại hoặc sang máy khác mà
 * localStorage 'pos_active_shift' đã hết hạn/bị xóa trong khi ca BE còn mở.
 *
 * Cash Session Model (1 Branch = 1 OPEN Shift = N Users):
 *   - Lấy GET /pos/shifts?status=OPEN
 *   - BE trả về ca OPEN của chi nhánh hiện tại (không filter theo user)
 *   - Bất kỳ user nào trong chi nhánh đều có thể bán hàng trong ca này
 *   - Bỏ qua ca quá 24 giờ (coi như kẹt, không dùng)
 *   - Lưu object { id, shiftCode, openingBalance } vào localStorage
 *   - Nếu không có ca nào → set null
 */
export const useActiveShift = ({ enabled = true } = {}) => {
  const [activeShift, setActiveShift] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (cached && !isFreshShift(cached.startedAt)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return cached;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Dùng ref để refresh không phụ thuộc vào activeShift (tránh vòng lặp:
  // clear → activeShift đổi → refresh chạy → re-fetch từ BE → set lại shift)
  const activeShiftRef = useRef(activeShift);
  activeShiftRef.current = activeShift;

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    try {
      const res = await getShifts({ status: 'OPEN', pageSize: 10 });
      const items = res?.data?.items || res?.items || res?.data || [];
      // Ca OPEN của chi nhánh hiện tại (Cash Session model - BE filter theo branch)
      // Bỏ qua ca quá 24 giờ (coi như kẹt)
      const fresh = Array.isArray(items) ? items.filter((s) => isFreshShift(s.startedAt)) : [];
      const open = fresh.length > 0 ? fresh[0] : null;
      if (open) {
        const mapped = {
          id: open.shiftId || open.id,
          shiftCode: open.shiftCode,
          openingBalance: open.openingBalance || 0,
          startedAt: open.startedAt,
          userName: open.userName || open.openedByUserName,
          userId: open.userId || open.openedByUserId,
          totalSales: parseFloat(open.totalRevenue || open.totalSales || open.revenue || 0),
          totalRevenue: parseFloat(open.totalRevenue || open.totalSales || open.revenue || 0),
          orderCount: parseInt(open.totalOrders || open.orderCount || 0, 10),
          cashSales: parseFloat(open.totalCash || open.cashSales || 0),
          cardSales: parseFloat(open.totalCard || open.cardSales || 0),
          transferSales: parseFloat(open.totalTransfer || open.transferSales || 0),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        setActiveShift(mapped);
        return mapped;
      }
      localStorage.removeItem(STORAGE_KEY);
      setActiveShift(null);
      return null;
    } catch (err) {
      console.warn('Không thể refresh active shift:', err?.message || err);
      return activeShiftRef.current;
    } finally {
      setLoading(false);
    }
  }, [enabled]); // Không phụ thuộc activeShift nữa

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveShift(null);
  }, []);

  // Chỉ refresh khi mount hoặc enabled thay đổi (vd: login user khác)
  useEffect(() => {
    refresh();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Giữ ref tới refresh để event listener luôn dùng được hàm mới nhất
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  // Lắng nghe sự kiện shift-state-changed (từ SignalR / handleEndShift)
  // Chỉ register 1 lần, dùng ref để gọi refresh mới nhất
  useEffect(() => {
    const handleShiftStateChanged = (e) => {
      const { type } = e.detail || {};
      console.log('[useActiveShift] shift-state-changed:', type);
      if (type === 'closed') {
        localStorage.removeItem(STORAGE_KEY);
        setActiveShift(null);
      } else if (type === 'opened') {
        refreshRef.current();
      }
    };
    window.addEventListener('shift-state-changed', handleShiftStateChanged);
    return () => window.removeEventListener('shift-state-changed', handleShiftStateChanged);
  }, []);

  // Polling fallback 30s: phòng khi SignalR không kết nối được giữa 2 máy
  // Chỉ poll khi đang có activeShift (có ca mở) để kiểm tra ca còn OPEN không
  useEffect(() => {
    if (!activeShift || !enabled) return;
    const interval = setInterval(() => {
      refreshRef.current();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeShift, enabled]);

  return { activeShift, loading, refresh, clear };
};

export default useActiveShift;
