import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const actionConfig = {
  wholesale: {
    primary: {
      label: 'Nhắn tin',
      icon: 'chat',
      className: 'bg-[#004785] text-white hover:bg-[#003560] shadow-lg',
    },
    secondary: {
      label: 'Thêm vào kho',
      icon: 'inventory_2',
      className: 'border-2 border-[#004785] text-[#004785] hover:bg-blue-50',
    },
    onPrimary: () => alert('Mở chat với người bán (demo)'),
    onSecondary: () => alert('Đã thêm vào kho (demo)'),
  },
  supply: {
    primary: {
      label: 'Nhắn tin',
      icon: 'chat',
      className: 'bg-[#004785] text-white hover:bg-[#003560] shadow-lg',
    },
    secondary: {
      label: 'Thêm vào kho',
      icon: 'inventory_2',
      className: 'border-2 border-[#004785] text-[#004785] hover:bg-blue-50',
    },
    onPrimary: () => alert('Mở chat với người bán (demo)'),
    onSecondary: () => alert('Đã thêm vào kho (demo)'),
  },
  clearance: {
    primary: {
      label: 'Mua ngay',
      icon: 'shopping_cart',
      className: 'bg-red-600 text-white hover:bg-red-700 shadow-lg',
    },
    secondary: {
      label: 'Nhắn tin thương lượng',
      icon: 'chat',
      className: 'border-2 border-red-500 text-red-600 hover:bg-red-50',
    },
    onPrimary: () => {
      const ok = window.confirm('Xác nhận mua hàng thanh lý? (demo)');
      if (ok) alert('Đã gửi yêu cầu mua hàng!');
    },
    onSecondary: () => alert('Mở chat thương lượng (demo)'),
  },
  groupBuy: {
    primary: {
      label: 'Tham gia nhóm mua',
      icon: 'groups',
      className: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg',
    },
    secondary: {
      label: 'Nhắn tin trưởng nhóm',
      icon: 'chat',
      className: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50',
    },
    onPrimary: () => {
      const ok = window.confirm('Xác nhận tham gia nhóm mua chung? (demo)');
      if (ok) alert('Đã tham gia nhóm mua!');
    },
    onSecondary: () => alert('Mở chat với trưởng nhóm (demo)'),
  },
};

const PostDetailActions = ({ type = 'wholesale' }) => {
  const [secondaryClicked, setSecondaryClicked] = useState(false);
  const cfg = actionConfig[type] || actionConfig.wholesale;

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={cfg.onPrimary}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.primary.className}`}
      >
        <Icon name={cfg.primary.icon} size={20} />
        {cfg.primary.label}
      </button>
      <button
        type="button"
        onClick={() => {
          cfg.onSecondary();
          setSecondaryClicked(true);
        }}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.secondary.className}`}
      >
        <Icon name={cfg.secondary.icon} size={20} />
        {cfg.secondary.label}
      </button>
    </div>
  );
};

export default PostDetailActions;
