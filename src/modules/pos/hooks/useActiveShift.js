import { useCallback, useEffect, useState } from 'react';
import { getShifts } from '../services/posService';

const STORAGE_KEY = 'pos_active_shift';

/**
 * Đồng bộ ca đang mở từ BE về localStorage.
 * Tránh lỗi MSG-76 khi user đăng nhập lại hoặc sang máy khác mà
 * localStorage 'pos_active_shift' đã hết hạn/bị xóa trong khi ca BE còn mở.
 *
 * Logic:
 *   - Lấy GET /pos/shifts?status=OPEN
 *   - Lọc ca có UserId khớp với currentUser (BE lọc giúp rồi)
 *   - Lưu object { id, shiftCode, openingBalance } vào localStorage
 *   - Nếu không có ca nào → set null
 */
export const useActiveShift = ({ enabled = true } = {}) => {
  const [activeShift, setActiveShift] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    try {
      const res = await getShifts({ status: 'OPEN', pageSize: 10 });
      const items = res?.data?.items || res?.items || res?.data || [];
      // Ca OPEN của chính user hiện tại (BE đã filter theo user)
      const open = Array.isArray(items) && items.length > 0 ? items[0] : null;
      if (open) {
        const mapped = {
          id: open.shiftId || open.id,
          shiftCode: open.shiftCode,
          openingBalance: open.openingBalance || 0,
          startedAt: open.startedAt,
          userName: open.userName,
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
      return activeShift;
    } finally {
      setLoading(false);
    }
  }, [enabled, activeShift]);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveShift(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activeShift, loading, refresh, clear };
};

export default useActiveShift;
