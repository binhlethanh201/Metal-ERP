import React from 'react';
import Icon from '../../../../shared/components/Icon';
import { useChat } from '../../contexts/ChatContext';

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
  },
};

const PostDetailActions = ({ type = 'wholesale', onAddToWarehouse, sellerName, seller }) => {
  const { convos, openChatWith } = useChat();
  const cfg = actionConfig[type] || actionConfig.wholesale;

  const handleChat = () => {
    if (seller) {
      openChatWith({
        id: seller.id || sellerName || seller.name,
        name: seller.name || sellerName,
        role: seller.role,
        avatar: seller.avatar,
      });
      return;
    }
    if (convos.length > 0) openChatWith(convos[0]);
  };

  const handleSecondary = () => {
    if (type === 'clearance') {
      const ok = window.confirm('Xác nhận mua hàng thanh lý? (demo)');
      if (ok) alert('Đã gửi yêu cầu mua hàng!');
    } else if (type === 'groupBuy') {
      const ok = window.confirm('Xác nhận tham gia nhóm mua chung? (demo)');
      if (ok) alert('Đã tham gia nhóm mua!');
    } else if (onAddToWarehouse) onAddToWarehouse();
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={
          type === 'clearance'
            ? handleSecondary
            : type === 'groupBuy'
              ? handleSecondary
              : handleChat
        }
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.primary.className}`}
      >
        <Icon name={cfg.primary.icon} size={20} />
        {cfg.primary.label}
      </button>
      <button
        type="button"
        onClick={
          type === 'clearance' ? handleChat : type === 'groupBuy' ? handleChat : handleSecondary
        }
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-colors active:scale-[0.98] ${cfg.secondary.className}`}
      >
        <Icon name={cfg.secondary.icon} size={20} />
        {cfg.secondary.label}
      </button>
    </div>
  );
};

export default PostDetailActions;
