import React, { useMemo, useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const STATUS_META = {
  PENDING: { label: 'Chá» duyá»‡t', bg: 'bg-secondary-container', fg: 'text-on-secondary-container' },
  APPROVED: { label: 'ÄÃ£ duyá»‡t', bg: 'bg-tertiary-container', fg: 'text-on-tertiary-container' },
  REJECTED: { label: 'Bị từ chối', bg: 'bg-red-50 dark:bg-red-900/30', fg: 'text-red-600 dark:text-red-500' },
};

const CopyChip = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      onClick={handleCopy}
      title="Nhấn để sao chép"
      className="group inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] px-2 py-1 font-mono text-[11px] font-semibold text-slate-500 dark:text-[#999999] transition-all hover:border-primary hover:text-[#004785] dark:text-blue-400"
    >
      <span>{label || value}</span>
      <Icon
        name={copied ? 'check' : 'copy'}
        size={11}
        className="opacity-60 group-hover:opacity-100"
      />
    </button>
  );
};

const Field = ({ label, value, mono = false, fullWidth = false }) => (
  <div className={`rounded-md bg-slate-50 dark:bg-[#1a1a1a] p-3 ${fullWidth ? 'col-span-2' : ''}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-bold text-slate-900 dark:text-[#e5e5e5] ${mono ? 'font-mono text-[13px]' : ''} break-words`}
    >
      {value || 'â€”'}
    </p>
  </div>
);

const StoreApprovalDetailModal = ({ data, onClose }) => {
  const [tab, setTab] = useState('info'); // 'info' | 'documents' | 'audit'

  const docs = useMemo(() => {
    if (!data?.documentUrls) return [];
    try {
      const parsed =
        typeof data.documentUrls === 'string' ? JSON.parse(data.documentUrls) : data.documentUrls;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return String(data.documentUrls)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ name: url.split('/').pop() || url, url }));
    }
  }, [data]);

  const daysWaiting = useMemo(() => {
    if (!data?.createdAt) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(data.createdAt).getTime()) / 86400000));
  }, [data]);

  const formatDateTime = (s) => {
    if (!s) return null;
    return new Date(s).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!data) return null;

  const statusMeta = STATUS_META[data.status] || STATUS_META.PENDING;
  const isPending = data.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col rounded-lg border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#0f0f0f] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333333] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#004785] dark:bg-blue-600-container text-white-container">
              <Icon name="store" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#e5e5e5]">{data.storeName}</h3>
                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold ${statusMeta.bg} ${statusMeta.fg}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#999999]">
                <span>Há»“ sÆ¡:</span>
                <CopyChip
                  value={data.approvalId}
                  label={`#${String(data.approvalId).slice(0, 8)}`}
                />
                {isPending && (
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                      daysWaiting > 3
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    Chá» duyá»‡t {daysWaiting} ngÃ y {daysWaiting > 3 && 'Â· QUÃ Háº N'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-[#666666] hover:text-slate-900 dark:text-[#e5e5e5]">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* TAB BAR */}
        <div className="flex border-b border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] px-6">
          {[
            { key: 'info', label: 'ThÃ´ng tin', icon: 'info' },
            { key: 'documents', label: `TÃ i liá»‡u (${docs.length})`, icon: 'file-text' },
            { key: 'audit', label: 'Lá»‹ch sá»­', icon: 'activity' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                tab === t.key
                  ? 'border-primary text-[#004785] dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-[#999999] hover:text-slate-900 dark:text-[#e5e5e5]'
              }`}
            >
              <Icon name={t.icon} size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* TAB: INFO */}
          {tab === 'info' && (
            <div className="space-y-5">
              {/* Section: Cá»­a hÃ ng */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                  <Icon name="store" size={13} />
                  ThÃ´ng tin Cá»­a hÃ ng
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="TÃªn cá»­a hÃ ng" value={data.storeName} />
                  <Field label="Äá»‹a chá»‰" value={data.storeAddress} fullWidth />
                  <Field label="MÃ£ sá»‘ thuáº¿ (MST)" value={data.taxCode} mono />
                  <Field label="Giáº¥y phÃ©p kinh doanh" value={data.businessLicense} mono />
                </div>
              </div>

              {/* Section: Chá»§ sá»Ÿ há»¯u */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                  <Icon name="user" size={13} />
                  Chá»§ sá»Ÿ há»¯u (Owner)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Há» vÃ  tÃªn" value={data.ownerName} />
                  <Field label="Email" value={data.ownerEmail} />
                  <Field
                    label="ID người dùng"
                    value={data.userId ? `#${String(data.userId).slice(0, 8)}` : null}
                    mono
                    fullWidth
                  />
                </div>
              </div>

              {/* Section: Tráº¡ng thÃ¡i & thá»i gian */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                  <Icon name="clock" size={13} />
                  Tráº¡ng thÃ¡i & Thá»i gian
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="NgÃ y gá»­i há»“ sÆ¡" value={formatDateTime(data.createdAt)} />
                  <Field label="NgÃ y review" value={formatDateTime(data.reviewedAt) || 'â€”'} />
                  <Field
                    label="Người đánh giá (ID)"
                    value={data.reviewedBy ? `#${String(data.reviewedBy).slice(0, 8)}` : '—'}
                    mono
                  />
                  <Field label="TÃªn reviewer" value={data.reviewerName} />
                </div>
              </div>

              {/* Section: REJECTED */}
              {data.status === 'REJECTED' && data.rejectReason && (
                <div className="rounded-md border border-error-container bg-red-50 dark:bg-red-900/30/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-500">
                    <Icon name="x-circle" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">LÃ½ do Tá»« chá»‘i</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-900 dark:text-[#e5e5e5]">{data.rejectReason}</p>
                </div>
              )}

              {/* Section: APPROVED */}
              {data.status === 'APPROVED' && (
                <div className="rounded-md border border-tertiary-container bg-tertiary-container/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-tertiary">
                    <Icon name="check-circle" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      TÃ¡c dá»¥ng phá»¥ khi duyá»‡t
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-slate-900 dark:text-[#e5e5e5]">
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Set{' '}
                        <code className="rounded bg-slate-50 dark:bg-[#1a1a1a] px-1 py-0.5 font-mono">
                          User.IsVerified = true
                        </code>{' '}
                        cho Owner
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Tá»± Ä‘á»™ng táº¡o{' '}
                        <code className="rounded bg-slate-50 dark:bg-[#1a1a1a] px-1 py-0.5 font-mono">
                          Branch
                        </code>{' '}
                        má»›i vá»›i tÃªn = StoreName
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Táº¡o{' '}
                        <code className="rounded bg-slate-50 dark:bg-[#1a1a1a] px-1 py-0.5 font-mono">
                          StaffAssignment
                        </code>{' '}
                        gÃ¡n Owner â†’ Branch
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Gá»­i notification tá»›i Owner qua{' '}
                        <code className="rounded bg-slate-50 dark:bg-[#1a1a1a] px-1 py-0.5 font-mono">
                          NotifyOwnerApprovalDecision
                        </code>
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: DOCUMENTS */}
          {tab === 'documents' && (
            <div>
              {docs.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-10 text-center">
                  <Icon name="file-x" size={32} className="mx-auto mb-2 text-slate-400 dark:text-[#666666]" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-[#999999]">
                    Owner chÆ°a upload tÃ i liá»‡u nÃ o.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-[#666666]">
                    Nếu cần bổ sung, liên hệ Owner qua email {data.ownerEmail}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                      Danh sÃ¡ch tÃ i liá»‡u ({docs.length})
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-[#666666]">Click Ä‘á»ƒ má»Ÿ trong tab má»›i</span>
                  </div>
                  {docs.map((doc, idx) => {
                    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.url || doc);
                    const isPdf = /\.pdf$/i.test(doc.url || doc);
                    const displayUrl = doc.url || doc;
                    const displayName =
                      doc.name || displayUrl.split('/').pop() || `TÃ i liá»‡u ${idx + 1}`;
                    return (
                      <a
                        key={idx}
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-3 transition-all hover:border-primary hover:bg-slate-100 dark:bg-[#272727]"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                            isImage
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : isPdf
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                                : 'bg-[#004785] dark:bg-blue-600-container text-white-container'
                          }`}
                        >
                          <Icon name={isImage ? 'image' : isPdf ? 'file-text' : 'file'} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-[#e5e5e5]">
                            {displayName}
                          </p>
                          <p className="truncate text-[10px] text-slate-400 dark:text-[#666666]">{displayUrl}</p>
                        </div>
                        <Icon name="external-link" size={14} className="text-slate-400 dark:text-[#666666]" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: AUDIT */}
          {tab === 'audit' && (
            <div className="space-y-3">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#999999]">
                Audit Trail
              </h4>
              <div className="relative space-y-3 border-l-2 border-slate-200 dark:border-[#333333] pl-5">
                <div className="relative">
                  <div className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-[#004785] dark:bg-blue-600-container">
                    <Icon name="send" size={11} className="text-white-container" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-[#e5e5e5]">Há»“ sÆ¡ Ä‘Æ°á»£c gá»­i</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#999999]">
                    {formatDateTime(data.createdAt)} · bởi{' '}
                    <span className="font-semibold">{data.ownerName}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-[#666666]">
                    userId = {data.userId}
                  </p>
                </div>

                {data.status !== 'PENDING' && (
                  <div className="relative">
                    <div
                      className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full ${
                        data.status === 'APPROVED'
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500'
                      }`}
                    >
                      <Icon name={data.status === 'APPROVED' ? 'check' : 'x'} size={11} />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#e5e5e5]">
                      Hồ sơ {data.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BỊ TỪ CHỐI'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-[#999999]">
                      {formatDateTime(data.reviewedAt)} · bởi{' '}
                      <span className="font-semibold">
                        {data.reviewerName || `#${String(data.reviewedBy).slice(0, 8)}`}
                      </span>
                    </p>
                    {data.rejectReason && (
                      <div className="mt-1.5 rounded-md bg-red-50 dark:bg-red-900/30/30 px-3 py-2 text-[11px] leading-relaxed text-slate-900 dark:text-[#e5e5e5]">
                        <strong className="text-red-600 dark:text-red-500">LÃ½ do: </strong>
                        {data.rejectReason}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Raw JSON */}
              <details className="mt-4 rounded-md border border-slate-200 dark:border-[#333333] bg-slate-50 dark:bg-[#1a1a1a] p-3">
                <summary className="cursor-pointer text-[11px] font-bold uppercase text-slate-500 dark:text-[#999999]">
                  Raw DTO (debug)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-white dark:bg-[#0f0f0f] p-2 text-[10px] leading-relaxed text-slate-500 dark:text-[#999999]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#333333] px-6 py-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#999999]">
            <Icon name="info" size={12} />
            <span>
              Approval ID: <span className="font-mono">{data.approvalId}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-200 dark:border-[#333333] px-5 py-2 text-sm font-bold text-slate-500 dark:text-[#999999] hover:bg-slate-100 dark:bg-[#272727]"
          >
            ÄÃ³ng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreApprovalDetailModal;

