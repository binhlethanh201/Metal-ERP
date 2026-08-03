/**
 * ShiftBadge - Component hiển thị trạng thái ca bán hàng
 * Dùng chung cho PosHeader và InventoryHeader.
 *
 * Đồng bộ trạng thái ca từ BE thông qua useActiveShift (hook tự filter
 * và clear ca quá hạn 24h, không tin localStorage mù quáng).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveShift } from '../../modules/pos/hooks/useActiveShift';
import { useAuth } from '../hooks/useAuth';

const formatStartTime = (startedAt) => {
  if (!startedAt) return '---';
  const d = new Date(startedAt);
  if (Number.isNaN(d.getTime())) return '---';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const formatElapsed = (startedAt) => {
  if (!startedAt) return '';
  const d = new Date(startedAt);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return '';
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `đã mở ${h} giờ ${m} phút`;
  return `đã mở ${m} phút`;
};

const ShiftBadge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeShift } = useActiveShift({ enabled: !!user });

  // Re-render mỗi phút để cập nhật "đã mở X giờ Y phút"
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!activeShift?.startedAt) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, [activeShift?.startedAt]);

  if (activeShift) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 shadow-sm dark:border-green-800 dark:from-green-950 dark:to-emerald-950">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-bold text-green-800 dark:text-green-300">
                Ca: {formatStartTime(activeShift.startedAt)}
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-green-600 dark:text-green-400">
              {activeShift.userName || activeShift.cashier || 'Thu ngân'} ·{' '}
              {formatElapsed(activeShift.startedAt) || `${activeShift.orderCount ?? 0} đơn`}
            </span>
          </div>
        </div>
        <div className="h-7 w-px bg-green-200 dark:bg-green-800" />
        <button
          onClick={() => navigate('/pos/shift')}
          className="flex items-center gap-1 rounded-lg border border-green-300 bg-white px-2 py-1 text-[11px] font-bold text-green-700 shadow-sm transition-all hover:bg-green-50 hover:shadow active:scale-95 dark:border-green-700 dark:bg-[#1a1a1a] dark:text-green-300 dark:hover:bg-[#333333]"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573-1.066c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Quản lý
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate('/pos/shift')}
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2 text-sm font-bold text-amber-700 shadow-sm transition-all hover:from-amber-100 hover:to-orange-100 hover:shadow active:scale-[0.98] dark:border-amber-800 dark:from-amber-950 dark:to-orange-950 dark:text-amber-300 dark:hover:from-amber-900 dark:hover:to-orange-900"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
      </span>
      <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
      </svg>
      <span>Mở ca bán hàng</span>
    </button>
  );
};

export default ShiftBadge;
