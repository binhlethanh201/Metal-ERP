import { useCallback, useEffect, useState } from 'react';
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
 * Logic:
 *   - Lấy GET /pos/shifts?status=OPEN
 *   - Lọc ca có UserId khớp với currentUser (BE lọc giúp rồi)
 *   - Bỏ qua ca quá 24 giờ (coi như kẹt, không dùng)
 *   - Lưu object { id, shiftCode, openingBalance } vào localStorage
 *   - Nếu không có ca nào → set null
 */
export const useActiveShift = ({ enabled = true } = {}) => {
  const [activeShift, setActiveShift] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      // Cache cũ / quá hạn → không dùng
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

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    try {
      const res = await getShifts({ status: 'OPEN', pageSize: 10 });
      const items = res?.data?.items || res?.items || res?.data || [];
      // Ca OPEN của chính user hiện tại (BE đã filter theo user)
      // Bỏ qua ca quá 24 giờ (coi như kẹt)
      const fresh = Array.isArray(items)
        ? items.filter((s) => isFreshShift(s.startedAt))
        : [];
      const open = fresh.length > 0 ? fresh[0] : null;
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
      // Không có ca hợp lệ → xóa cache (kể cả cache cũ)
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

