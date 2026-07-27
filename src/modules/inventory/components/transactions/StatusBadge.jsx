import { useMemo } from 'react';

const statusConfig = {
  DRAFT: {
    label: 'Nháp',
    bgColor: 'bg-slate-100 dark:bg-[#1a1a1a]',
    textColor: 'text-slate-700 dark:text-[#b3b3b3]',
    dotColor: 'bg-slate-400',
  },
  PENDING: {
    label: 'Đang xử lý',
    bgColor: 'bg-amber-50 dark:bg-amber-900/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-500',
  },
  APPROVED: {
    label: 'Đã duyệt',
    bgColor: 'bg-blue-50 dark:bg-blue-900/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    bgColor: 'bg-rose-50 dark:bg-rose-900/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    dotColor: 'bg-rose-500',
  },
  REJECTED: {
    label: 'Từ chối',
    bgColor: 'bg-red-50 dark:bg-red-900/50',
    textColor: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
  // Fallback
  default: {
    label: 'Không xác định',
    bgColor: 'bg-gray-100 dark:bg-[#1a1a1a]',
    textColor: 'text-gray-700 dark:text-[#b3b3b3]',
    dotColor: 'bg-gray-400',
  },
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = useMemo(() => {
    const upperStatus = status?.toUpperCase();
    return statusConfig[upperStatus] || statusConfig.default;
  }, [status]);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <span className={`rounded-full ${dotSizes[size]} ${config.dotColor}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
