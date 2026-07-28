import React, { useMemo, useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const STATUS_META = {
  PENDING: { label: 'Chờ duyệt', bg: 'bg-secondary-container', fg: 'text-on-secondary-container' },
  APPROVED: { label: 'Đã duyệt', bg: 'bg-tertiary-container', fg: 'text-on-tertiary-container' },
  REJECTED: { label: 'Bị từ chối', bg: 'bg-error-container', fg: 'text-error' },
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
      className="group inline-flex items-center gap-1.5 rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-mono text-[11px] font-semibold text-on-surface-variant transition-all hover:border-primary hover:text-primary"
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
  <div className={`rounded-md bg-surface-container-low p-3 ${fullWidth ? 'col-span-2' : ''}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-bold text-on-surface ${mono ? 'font-mono text-[13px]' : ''} break-words`}
    >
      {value || '—'}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
              <Icon name="store" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-on-surface">{data.storeName}</h3>
                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold ${statusMeta.bg} ${statusMeta.fg}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span>Hồ sơ:</span>
                <CopyChip
                  value={data.approvalId}
                  label={`#${String(data.approvalId).slice(0, 8)}`}
                />
                {isPending && (
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
                      daysWaiting > 3
                        ? 'bg-error-container text-error'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    Chờ duyệt {daysWaiting} ngày {daysWaiting > 3 && '· QUÁ HẠN'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* TAB BAR */}
        <div className="flex border-b border-outline-variant bg-surface-container-low px-6">
          {[
            { key: 'info', label: 'Thông tin', icon: 'info' },
            { key: 'documents', label: `Tài liệu (${docs.length})`, icon: 'file-text' },
            { key: 'audit', label: 'Lịch sử', icon: 'activity' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
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
              {/* Section: Cửa hàng */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="store" size={13} />
                  Thông tin Cửa hàng
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tên cửa hàng" value={data.storeName} />
                  <Field label="Địa chỉ" value={data.storeAddress} fullWidth />
                  <Field label="Mã số thuế (MST)" value={data.taxCode} mono />
                  <Field label="Giấy phép kinh doanh" value={data.businessLicense} mono />
                </div>
              </div>

              {/* Section: Chủ sở hữu */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="user" size={13} />
                  Chủ sở hữu (Owner)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Họ và tên" value={data.ownerName} />
                  <Field label="Email" value={data.ownerEmail} />
                  <Field
                    label="ID người dùng"
                    value={data.userId ? `#${String(data.userId).slice(0, 8)}` : null}
                    mono
                    fullWidth
                  />
                </div>
              </div>

              {/* Section: Trạng thái & thời gian */}
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <Icon name="clock" size={13} />
                  Trạng thái & Thời gian
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ngày gửi hồ sơ" value={formatDateTime(data.createdAt)} />
                  <Field label="Ngày review" value={formatDateTime(data.reviewedAt) || '—'} />
                  <Field
                    label="Người đánh giá (ID)"
                    value={data.reviewedBy ? `#${String(data.reviewedBy).slice(0, 8)}` : '—'}
                    mono
                  />
                  <Field label="Tên reviewer" value={data.reviewerName} />
                </div>
              </div>

              {/* Section: REJECTED */}
              {data.status === 'REJECTED' && data.rejectReason && (
                <div className="rounded-md border border-error-container bg-error-container/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-error">
                    <Icon name="x-circle" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Lý do Từ chối</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface">{data.rejectReason}</p>
                </div>
              )}

              {/* Section: APPROVED */}
              {data.status === 'APPROVED' && (
                <div className="rounded-md border border-tertiary-container bg-tertiary-container/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-tertiary">
                    <Icon name="check-circle" size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Tác dụng phụ khi duyệt
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-on-surface">
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Set{' '}
                        <code className="rounded bg-surface-container-low px-1 py-0.5 font-mono">
                          User.IsVerified = true
                        </code>{' '}
                        cho Owner
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Tự động tạo{' '}
                        <code className="rounded bg-surface-container-low px-1 py-0.5 font-mono">
                          Branch
                        </code>{' '}
                        mới với tên = StoreName
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Tạo{' '}
                        <code className="rounded bg-surface-container-low px-1 py-0.5 font-mono">
                          StaffAssignment
                        </code>{' '}
                        gán Owner → Branch
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="check" size={12} className="mt-0.5 text-tertiary" />
                      <span>
                        Gửi notification tới Owner qua{' '}
                        <code className="rounded bg-surface-container-low px-1 py-0.5 font-mono">
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
                <div className="rounded-md border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
                  <Icon name="file-x" size={32} className="mx-auto mb-2 text-outline" />
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Owner chưa upload tài liệu nào.
                  </p>
                  <p className="mt-1 text-[11px] text-outline">
                    Nếu cần bổ sung, liên hệ Owner qua email {data.ownerEmail}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Danh sách tài liệu ({docs.length})
                    </h4>
                    <span className="text-[10px] text-outline">Click để mở trong tab mới</span>
                  </div>
                  {docs.map((doc, idx) => {
                    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.url || doc);
                    const isPdf = /\.pdf$/i.test(doc.url || doc);
                    const displayUrl = doc.url || doc;
                    const displayName =
                      doc.name || displayUrl.split('/').pop() || `Tài liệu ${idx + 1}`;
                    return (
                      <a
                        key={idx}
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low p-3 transition-all hover:border-primary hover:bg-surface-container-high"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                            isImage
                              ? 'bg-tertiary-container text-on-tertiary-container'
                              : isPdf
                                ? 'bg-error-container text-error'
                                : 'bg-primary-container text-on-primary-container'
                          }`}
                        >
                          <Icon name={isImage ? 'image' : isPdf ? 'file-text' : 'file'} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-on-surface">
                            {displayName}
                          </p>
                          <p className="truncate text-[10px] text-outline">{displayUrl}</p>
                        </div>
                        <Icon name="external-link" size={14} className="text-outline" />
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
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Audit Trail
              </h4>
              <div className="relative space-y-3 border-l-2 border-outline-variant pl-5">
                <div className="relative">
                  <div className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full bg-primary-container">
                    <Icon name="send" size={11} className="text-on-primary-container" />
                  </div>
                  <p className="text-xs font-semibold text-on-surface">Hồ sơ được gửi</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {formatDateTime(data.createdAt)} · bởi{' '}
                    <span className="font-semibold">{data.ownerName}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-outline">
                    userId = {data.userId}
                  </p>
                </div>

                {data.status !== 'PENDING' && (
                  <div className="relative">
                    <div
                      className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full ${
                        data.status === 'APPROVED'
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : 'bg-error-container text-error'
                      }`}
                    >
                      <Icon name={data.status === 'APPROVED' ? 'check' : 'x'} size={11} />
                    </div>
                    <p className="text-xs font-semibold text-on-surface">
                      Hồ sơ {data.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BỊ TỪ CHỐI'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {formatDateTime(data.reviewedAt)} · bởi{' '}
                      <span className="font-semibold">
                        {data.reviewerName || `#${String(data.reviewedBy).slice(0, 8)}`}
                      </span>
                    </p>
                    {data.rejectReason && (
                      <div className="mt-1.5 rounded-md bg-error-container/30 px-3 py-2 text-[11px] leading-relaxed text-on-surface">
                        <strong className="text-error">Lý do: </strong>
                        {data.rejectReason}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Raw JSON */}
              <details className="mt-4 rounded-md border border-outline-variant bg-surface-container-low p-3">
                <summary className="cursor-pointer text-[11px] font-bold uppercase text-on-surface-variant">
                  Raw DTO (debug)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-surface-container-lowest p-2 text-[10px] leading-relaxed text-on-surface-variant">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-outline-variant px-6 py-4">
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
            <Icon name="info" size={12} />
            <span>
              Approval ID: <span className="font-mono">{data.approvalId}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-outline-variant px-5 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreApprovalDetailModal;
