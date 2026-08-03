import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const HandleViolationModal = ({ isOpen, onClose, reportData, onConfirm }) => {
  const [penaltyType, setPenaltyType] = useState('hide_post');
  const [note, setNote] = useState('');

  if (!isOpen || !reportData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ targetId: reportData.targetId, penaltyType, note });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-error-container pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <Icon name="gavel" size={20} />
            <h3 className="text-base font-bold">Xá»­ lÃ½ Vi pháº¡m</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="rounded-md bg-red-50 dark:bg-red-900/30/20 p-3 text-sm">
            <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
              Äá»‘i tÆ°á»£ng pháº¡t: <span className="text-red-600 dark:text-red-500">{reportData.targetName}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#999999]">ID bản ghi: {reportData.id}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              HÃ¬nh thá»©c xá»­ lÃ½
            </label>
            <select
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm font-semibold text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-error"
            >
              <option value="hide_post">Chá»‰ áº©n bÃ i viáº¿t vi pháº¡m (Soft-Delete)</option>
              <option value="suspend_3_days">áº¨n bÃ i & ÄÃ¬nh chá»‰ tÃ i khoáº£n 3 ngÃ y</option>
              <option value="ban_permanent">KhÃ³a tÃ i khoáº£n vÄ©nh viá»…n (Ban)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
              Ghi chÃº kiá»ƒm duyá»‡t (Audit Log)
            </label>
            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-[#333333] p-2.5 text-sm outline-none focus:border-error"
              placeholder="Nháº­p lÃ½ do xá»­ pháº¡t..."
              rows="3"
            />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3 text-xs leading-relaxed text-slate-500 dark:text-[#999999]">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              <strong>BR-54:</strong> Há»‡ thá»‘ng sáº½ Ã¡p dá»¥ng Soft-delete Ä‘á»‘i vá»›i bÃ i Ä‘Äƒng Ä‘á»ƒ phá»¥c vá»¥
              cÃ´ng tÃ¡c thanh tra khi cÃ³ khiáº¿u náº¡i.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
            >
              Há»§y
            </button>
            <button
              type="submit"
              className="rounded-md bg-error px-4 py-2 text-sm font-bold text-on-error hover:bg-on-error-container"
            >
              Thá»±c thi Lá»‡nh Pháº¡t
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandleViolationModal;

