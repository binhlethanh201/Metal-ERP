import { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const typeConfig = {
  // Inward Types
  PURCHASE: {
    label: 'Nhập hàng',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  CUSTOMER_RETURN: {
    label: 'Khách trả hàng',
    bgColor: 'bg-amber-50 dark:bg-amber-900/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  EXCHANGE_IN: {
    label: 'Khách đổi hàng',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  BALANCE_ADJUST: {
    label: 'Cân bằng kiểm kho',
    bgColor: 'bg-purple-50 dark:bg-purple-900/50',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  INVENTORY_CHECK: {
    label: 'Cân bằng kiểm kho',
    bgColor: 'bg-purple-50 dark:bg-purple-900/50',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  CHECK: {
    label: 'Kiểm kê kho',
    bgColor: 'bg-purple-50 dark:bg-purple-900/50',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
  INWARD: {
    label: 'Nhập kho',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: ArrowDownLeft,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  
  // Outward Types
  SALE: {
    label: 'Bán hàng',
    bgColor: 'bg-blue-50 dark:bg-blue-900/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: ArrowUpRight,
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  EXCHANGE_OUT: {
    label: 'Xuất hàng đổi',
    bgColor: 'bg-blue-50 dark:bg-blue-900/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: ArrowUpRight,
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  RETURN_SUPPLIER: {
    label: 'Trả NCC',
    bgColor: 'bg-rose-50 dark:bg-rose-900/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    icon: ArrowUpRight,
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
  },
  SUPPLIER_RETURN: {
    label: 'Trả NCC',
    bgColor: 'bg-rose-50 dark:bg-rose-900/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    icon: ArrowUpRight,
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
  },
  WRITE_OFF: {
    label: 'Xuất hủy',
    bgColor: 'bg-stone-50 dark:bg-stone-900/50',
    textColor: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-800',
    icon: ArrowUpRight,
    iconBg: 'bg-stone-100 dark:bg-stone-900/50',
  },
  TRANSFER: {
    label: 'Xuất nội bộ',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/50',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: ArrowUpRight,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
  OUTWARD: {
    label: 'Xuất kho',
    bgColor: 'bg-rose-50 dark:bg-rose-900/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    icon: ArrowUpRight,
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
  },
  // Fallback
  default: {
    label: 'Không xác định',
    bgColor: 'bg-slate-50 dark:bg-[#1a1a1a]',
    textColor: 'text-slate-700 dark:text-[#b3b3b3]',
    borderColor: 'border-slate-200 dark:border-[#333333]',
    icon: ArrowDownLeft,
    iconBg: 'bg-slate-100 dark:bg-[#1a1a1a]',
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
