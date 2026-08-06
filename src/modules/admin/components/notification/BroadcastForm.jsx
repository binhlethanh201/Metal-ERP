import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const BroadcastForm = ({ onBroadcast }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetScope, setTargetScope] = useState('all');
  const [isUrgent, setIsUrgent] = useState(false);

  const TARGET_MAP = {
    all: 'ALL',
    owners: 'OWNER',
    staff: 'STAFF',
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Exception Kiá»ƒm tra rá»—ng vÃ  Ä‘á»™ dÃ i
    if (!title.trim() || !content.trim()) {
      alert('[MSG37] Lá»—i: TiÃªu Ä‘á» hoáº·c ná»™i dung thÃ´ng bÃ¡o khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.');
      return;
    }
    if (content.length > 4000) {
      alert('[MSG37] Lá»—i: VÆ°á»£t quÃ¡ giá»›i háº¡n bá»™ Ä‘á»‡m (Max 4000 characters).');
      return;
    }

    onBroadcast({
      title,
      content,
      target: TARGET_MAP[targetScope] || 'ALL',
      isUrgent,
    });

    // Reset form sau khi gá»­i thÃ nh cÃ´ng
    setTitle('');
    setContent('');
    setIsUrgent(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-[#999999]">
          Soáº¡n Tháº£o ThÃ´ng BÃ¡o Má»›i
        </h3>
        {isUrgent && (
          <span className="flex items-center gap-1 rounded bg-red-50 dark:bg-red-900/30 px-2 py-1 text-[10px] font-bold text-red-600 dark:text-red-500">
            <Icon name="alert_triangle" size={12} /> CHáº¾ Äá»˜ KHáº¨N Cáº¤P
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-900 dark:text-[#e5e5e5]">
            TiÃªu Ä‘á» thÃ´ng bÃ¡o
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nháº­p chá»§ Ä‘á» ngáº¯n gá»n..."
            className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm font-medium text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-900 dark:text-[#e5e5e5]">
            Äá»‘i tÆ°á»£ng nháº­n tin
          </label>
          <select
            value={targetScope}
            onChange={(e) => setTargetScope(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-2.5 text-sm font-medium text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary focus:bg-white dark:bg-[#0f0f0f]"
          >
            <option value="all">Táº¥t cáº£ ngÆ°á»i dÃ¹ng (All Users)</option>
            <option value="owners">Chá»‰ hiá»ƒn thá»‹ cho Chá»§ Shop (Partner Owners)</option>
            <option value="staff">Chá»‰ hiá»ƒn thá»‹ cho NhÃ¢n sá»± Ná»™i bá»™ (System Staff)</option>
          </select>
        </div>

        <div>
          <div className="mb-1 flex items-end justify-between">
            <label className="block text-sm font-semibold text-slate-900 dark:text-[#e5e5e5]">Ná»™i dung vÄƒn báº£n</label>
            <span
              className={`font-mono text-[10px] font-bold ${content.length > 3900 ? 'text-red-600 dark:text-red-500' : 'text-slate-500 dark:text-[#999999]'}`}
            >
              {content.length} / 4000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nháº­p ná»™i dung chi tiáº¿t. Há»— trá»£ ngáº¯t dÃ²ng trá»±c tiáº¿p..."
            rows="5"
            className="w-full resize-y rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-2.5 text-sm text-slate-900 dark:text-[#e5e5e5] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-3">
          <div className="flex items-start gap-3">
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="urgentCheck"
                checked={isUrgent}
                onChange={() => setIsUrgent(!isUrgent)}
                className="h-4 w-4 cursor-pointer rounded border-slate-200 dark:border-[#333333] accent-error"
              />
            </div>
            <label
              htmlFor="urgentCheck"
              className="cursor-pointer text-xs leading-relaxed text-slate-500 dark:text-[#999999]"
            >
              <span className="mb-0.5 block text-sm font-bold text-red-600 dark:text-red-500">
                PhÃ¡t tin KHáº¨N Cáº¤P (Override Do-Not-Disturb)
              </span>
              <strong>BR-48:</strong> Há»‡ thá»‘ng sáº½ Ã©p hiá»ƒn thá»‹ popup á»Ÿ chÃ­nh giá»¯a mÃ n hÃ¬nh cá»§a táº¥t cáº£
              Client Ä‘ang online, ghi Ä‘Ã¨ má»i cÃ i Ä‘áº·t áº©n thÃ´ng bÃ¡o.
            </label>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            className={`flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95 sm:inline-flex sm:w-auto ${
              isUrgent
                ? 'bg-error hover:bg-on-error-container hover:shadow-error/30'
                : 'bg-[#004785] dark:bg-blue-600 hover:bg-on-primary-fixed-variant'
            }`}
          >
            <Icon name="send" size={16} /> {isUrgent ? 'PHÃT Lá»†NH KHáº¨N Cáº¤P' : 'PHÃT THÃ”NG BÃO'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BroadcastForm;

