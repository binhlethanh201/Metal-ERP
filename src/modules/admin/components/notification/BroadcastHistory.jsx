import React from 'react';
import Icon from '../../../../shared/components/Icon';

const TARGET_LABELS = {
  ALL: 'Táº¥t cáº£ há»‡ thá»‘ng',
  OWNER: 'Partner Owners',
  STAFF: 'System Staff',
  COMMUNITY: 'Community Users',
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', { hour12: false });
};

const BroadcastHistory = ({ historyData }) => {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-2">
        <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-[#999999]">Lá»‹ch sá»­ phÃ¡t sÃ³ng</h3>
        <button className="text-slate-400 dark:text-[#666666] transition-colors hover:text-slate-900 dark:text-[#e5e5e5]">
          <Icon name="refresh_cw" size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {historyData.map((bc) => {
          const status = (bc.status || '').toUpperCase();
          const isScheduled = status === 'SCHEDULED';
          const timestamp = bc.sentAt || bc.scheduledAt || bc.createdAt;
          const targetLabel = TARGET_LABELS[bc.target] || bc.target || 'â€”';
          return (
            <div
              key={bc.notificationId}
              className="relative border-l-2 border-slate-200 dark:border-[#333333] pl-3 transition-colors hover:border-outline"
            >
              <div
                className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full border-2 border-white dark:border-[#0f0f0f] ${isScheduled ? 'bg-secondary' : 'bg-outline-variant'}`}
              />

              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    isScheduled
                      ? 'bg-secondary-fixed text-on-secondary-container'
                      : 'bg-slate-100 dark:bg-[#272727]est text-slate-500 dark:text-[#999999]'
                  }`}
                >
                  {status || 'â€”'}
                </span>
                <span className="font-mono text-[11px] font-medium text-slate-400 dark:text-[#666666]">
                  {formatDateTime(timestamp)}
                </span>
              </div>

              <h4 className="mt-1 text-sm font-bold leading-tight text-slate-900 dark:text-[#e5e5e5]">{bc.title}</h4>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-[#999999]">
                <Icon name="users" size={12} className="text-slate-400 dark:text-[#666666]" />
                Target: <span className="text-slate-900 dark:text-[#e5e5e5]">{targetLabel}</span>
              </div>
            </div>
          );
        })}

        {historyData.length === 0 && (
          <div className="py-8 text-center text-xs font-semibold text-slate-400 dark:text-[#666666]">
            ChÆ°a cÃ³ lá»‹ch sá»­ phÃ¡t sÃ³ng.
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastHistory;

