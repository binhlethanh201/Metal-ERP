/**
 * PreviewActions - Nút hành động chính/phụ cho PostPreviewModal.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const actionConfig = {
  wholesale: {
    primary: { label: 'Nhắn tin', icon: 'chat', className: 'bg-[#004785] text-white' },
    secondary: {
      label: 'Thêm vào kho',
      icon: 'inventory_2',
      className: 'border-2 border-[#004785] text-[#004785]',
    },
  },
  supply: {
    primary: { label: 'Gửi báo giá', icon: 'send', className: 'bg-[#004785] text-white' },
    secondary: {
      label: 'Đề xuất nguồn hàng',
      icon: 'lightbulb',
      className: 'border-2 border-[#004785] text-[#004785]',
    },
  },
  trend: {
    primary: { label: 'Mua ngay', icon: 'shopping_cart', className: 'bg-red-600 text-white' },
    secondary: {
      label: 'Nhắn tin thương lượng',
      icon: 'chat',
      className: 'border-2 border-red-500 text-red-600',
    },
  },
  quote: {
    primary: { label: 'Gửi báo giá', icon: 'send', className: 'bg-[#004785] text-white' },
    secondary: {
      label: 'Liên hệ người đăng',
      icon: 'chat',
      className: 'border-2 border-[#004785] text-[#004785]',
    },
  },
  trusted: {
    primary: { label: 'Nhắn tin', icon: 'chat', className: 'bg-[#004785] text-white' },
    secondary: {
      label: 'Thêm vào kho',
      icon: 'inventory_2',
      className: 'border-2 border-[#004785] text-[#004785]',
    },
  },
};

const PreviewActions = ({ postType }) => {
  const cfg = actionConfig[postType] || actionConfig.wholesale;
  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.primary.className}`}
      >
        <Icon name={cfg.primary.icon} size={20} />
        {cfg.primary.label}
      </button>
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.secondary.className}`}
      >
        <Icon name={cfg.secondary.icon} size={20} />
        {cfg.secondary.label}
      </button>
    </div>
  );
};

export default PreviewActions;
