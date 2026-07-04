import React from 'react';
import Icon from '../../../../shared/components/Icon';

const TARGET_LABELS = {
  ALL: 'Tất cả hệ thống',
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
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-surface-container-high pb-2">
        <h3 className="text-sm font-bold uppercase text-on-surface-variant">Lịch sử phát sóng</h3>
        <button className="text-outline transition-colors hover:text-on-surface">
          <Icon name="refresh_cw" size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {historyData.map((bc) => {
          const status = (bc.status || '').toUpperCase();
          const isScheduled = status === 'SCHEDULED';
          const timestamp = bc.sentAt || bc.scheduledAt || bc.createdAt;
          const targetLabel = TARGET_LABELS[bc.target] || bc.target || '—';
          return (
            <div
              key={bc.notificationId}
              className="relative border-l-2 border-surface-container-high pl-3 transition-colors hover:border-outline"
            >
              <div
                className={`absolute -left-[5px] top-1.5 h-2 w-2 rounded-full border-2 border-surface-container-lowest ${isScheduled ? 'bg-secondary' : 'bg-outline-variant'}`}
              />

              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    isScheduled
                      ? 'bg-secondary-fixed text-on-secondary-container'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {status || '—'}
                </span>
                <span className="font-mono text-[11px] font-medium text-outline">
                  {formatDateTime(timestamp)}
                </span>
              </div>

              <h4 className="mt-1 text-sm font-bold leading-tight text-on-surface">{bc.title}</h4>

              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant">
                <Icon name="users" size={12} className="text-outline" />
                Target: <span className="text-on-surface">{targetLabel}</span>
              </div>
            </div>
          );
        })}

        {historyData.length === 0 && (
          <div className="py-8 text-center text-xs font-semibold text-outline">
            Chưa có lịch sử phát sóng.
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastHistory;
