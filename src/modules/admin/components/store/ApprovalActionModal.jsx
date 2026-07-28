import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const ApprovalActionModal = ({ data, onClose, onConfirm }) => {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  if (!data) return null;

  const { approval, type } = data;
  const isApprove = type === 'approve';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApprove && !reason.trim()) {
      alert('Vui lÃ²ng nháº­p lÃ½ do tá»« chá»‘i.');
      return;
    }
    if (!isApprove && reason.length > 500) {
      alert('LÃ½ do tá»« chá»‘i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 500 kÃ½ tá»±.');
      return;
    }
    onConfirm(isApprove ? { notes } : { reason });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            isApprove ? 'border-primary/30' : 'border-error-container'
          }`}
        >
          <div className={`flex items-center gap-2 ${isApprove ? 'text-[#004785] dark:text-blue-400' : 'text-red-600 dark:text-red-500'}`}>
            <Icon name={isApprove ? 'check' : 'x'} size={20} />
            <h3 className="text-base font-bold">
              {isApprove ? 'XÃ¡c nháº­n Duyá»‡t Há»“ sÆ¡' : 'Tá»« chá»‘i Há»“ sÆ¡'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Approval Info */}
          <div
            className={`rounded-md p-3 text-sm ${
              isApprove ? 'bg-tertiary-container/20' : 'bg-red-50 dark:bg-red-900/30/20'
            }`}
          >
            <p className="font-semibold text-slate-900 dark:text-[#e5e5e5]">
              Cá»­a hÃ ng:{' '}
              <span className={isApprove ? 'text-[#004785] dark:text-blue-400' : 'text-red-600 dark:text-red-500'}>
                {approval.storeName}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#999999]">MÃ£ há»“ sÆ¡: {approval.approvalId}</p>
          </div>

          {isApprove ? (
            /* Approve Form */
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                Ghi chÃº duyá»‡t (khÃ´ng báº¯t buá»™c)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-[#333333] p-2.5 text-sm outline-none focus:border-primary"
                placeholder="Nháº­p ghi chÃº náº¿u cáº§n..."
                rows="3"
              />
            </div>
          ) : (
            /* Reject Form */
            <div>
              <div className="mb-1 flex items-end justify-between">
                <label className="block text-xs font-semibold text-slate-500 dark:text-[#999999]">
                  LÃ½ do tá»« chá»‘i (Báº¯t buá»™c)
                </label>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    reason.length > 450 ? 'text-red-600 dark:text-red-500' : 'text-slate-500 dark:text-[#999999]'
                  }`}
                >
                  {reason.length} / 500
                </span>
              </div>
              <textarea
                required
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setReason(e.target.value);
                }}
                className="w-full rounded-md border border-slate-200 dark:border-[#333333] p-2.5 text-sm outline-none focus:border-error"
                placeholder="Nháº­p lÃ½ do tá»« chá»‘i há»“ sÆ¡..."
                rows="4"
              />
            </div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3 text-xs leading-relaxed text-slate-500 dark:text-[#999999]">
            <Icon name="info" size={14} className="mt-0.5 shrink-0 text-secondary" />
            <span>
              {isApprove ? (
                <>
                  <strong>Há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng:</strong> Táº¡o chi nhÃ¡nh má»›i (Branch) vÃ  set
                  IsVerified=true cho Owner.
                </>
              ) : (
                <>
                  <strong>LÆ°u Ã½:</strong> LÃ½ do tá»« chá»‘i sáº½ Ä‘Æ°á»£c gá»­i Ä‘áº¿n email cá»§a Owner. Há» cÃ³ thá»ƒ
                  ná»™p láº¡i há»“ sÆ¡ má»›i.
                </>
              )}
            </span>
          </div>

          {/* Buttons */}
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
              className={`rounded-md px-4 py-2 text-sm font-bold shadow-sm ${
                isApprove
                  ? 'bg-[#004785] dark:bg-blue-600 text-white hover:bg-on-primary-fixed-variant'
                  : 'bg-error text-on-error hover:bg-on-error-container'
              }`}
            >
              {isApprove ? 'XÃ¡c nháº­n Duyá»‡t' : 'XÃ¡c nháº­n Tá»« chá»‘i'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalActionModal;

