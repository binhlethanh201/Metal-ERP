import { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const typeConfig = {
  INWARD: {
    label: 'Nhập kho',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: ArrowDownLeft,
    iconBg: 'bg-emerald-100',
  },
  OUTWARD: {
    label: 'Xuất kho',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    icon: ArrowUpRight,
    iconBg: 'bg-rose-100',
  },
  // Fallback
  default: {
    label: 'Không xác định',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    icon: ArrowDownLeft,
    iconBg: 'bg-slate-100',
  },
};

export const TransactionTypeBadge = ({ type, showIcon = true, size = 'md' }) => {
  const config = useMemo(() => {
    const upperType = type?.toUpperCase();
    return typeConfig[upperType] || typeConfig.default;
  }, [type]);

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const iconWrapperSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <span
          className={`flex items-center justify-center rounded-md ${config.iconBg} ${iconWrapperSizes[size]}`}
        >
          <Icon className={iconSizes[size]} />
        </span>
      )}
      {config.label}
    </span>
  );
};

export default TransactionTypeBadge;
