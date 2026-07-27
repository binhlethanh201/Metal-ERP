import React from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { TAG_COLORS } from '../../data/orderPageData';
import { TAG_POOL } from '../../data/orderMockData';

const OrderLabelFilterModal = ({ isOpen, onClose, selectedTags, onToggleTag, onClear }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lọc theo nhãn"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClear}>
            Xóa lọc
          </Button>
          <Button variant="primary" onClick={onClose}>
            Áp dụng
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-slate-500 dark:text-[#999999]">Chọn nhãn để lọc đơn hàng:</p>
        <div className="flex flex-wrap gap-2">
          {TAG_POOL.map((t) => (
            <button
              key={t.label}
              onClick={() => onToggleTag(t.label)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${selectedTags.includes(t.label) ? `${TAG_COLORS[t.color]} border-current` : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 dark:border-[#404040] dark:bg-[#272727] dark:text-[#b3b3b3]'}`}
            >
              {selectedTags.includes(t.label) ? '✓ ' : ''}
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default OrderLabelFilterModal;
