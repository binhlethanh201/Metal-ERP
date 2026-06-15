import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { MOCK_REPORTS } from '../data/mockData';
import ConfirmActionModal from '../components/ConfirmActionModal';
import HandleViolationModal from '../components/post/HandleViolationModal';

const MOCK_POSTS = [
  {
    id: 'POST-001',
    author: 'Sắt thép Hòa Phát',
    category: 'Sắt hình & Thép xây dựng',
    content: 'Cập nhật bảng giá thép xây dựng quý 3/2026. Anh em tham khảo.',
    date: '15/05/2026',
    isPinned: false,
    isLocked: false,
  },
  {
    id: 'POST-002',
    author: 'Cơ khí Nam Định',
    category: 'Dây cáp & Thiết bị điện',
    content: 'Cần tìm nguồn sỉ cáp điện Cadivi chiết khấu cao khu vực miền Bắc.',
    date: '14/05/2026',
    isPinned: true,
    isLocked: true,
  },
];

const PostModeration = () => {
  const [viewMode, setViewMode] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');

  // States quản lý Modal
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    data: null,
    actionType: null,
  });
  const [violationModalData, setViolationModalData] = useState(null);

  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter(
      (report) =>
        report.status !== 'resolved' &&
        (report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.target.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const closeModals = () => {
    setConfirmModalConfig({ isOpen: false, data: null, actionType: null });
    setViolationModalData(null);
  };

  // --- TRIGGERS ---
  const triggerDismissReport = (report) => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: 'dismiss',
      data: {
        title: 'Bỏ qua Báo cáo',
        message: `Bạn xác nhận bài viết của "${report.target}" không vi phạm tiêu chuẩn cộng đồng? Báo cáo này sẽ được gỡ bỏ.`,
        confirmText: 'Đồng ý bỏ qua',
        type: 'primary',
      },
    });
  };

  const triggerToggleLock = (post) => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: 'toggle_lock',
      data: {
        title: post.isLocked ? 'Mở khóa Bình luận' : 'Khóa luồng Thảo luận',
        message: post.isLocked
          ? 'Cho phép người dùng tiếp tục bình luận vào bài viết này.'
          : 'Khóa luồng bình luận. Người dùng vẫn có thể xem nhưng không thể tương tác thêm.',
        warningNote: !post.isLocked
          ? 'BR-51: Backend sẽ từ chối mọi API tạo bình luận mới vào luồng này trừ Admin.'
          : '',
        confirmText: post.isLocked ? 'Mở Khóa' : 'Xác nhận Khóa',
        type: post.isLocked ? 'primary' : 'danger',
      },
    });
  };

  const triggerHidePost = (postId) => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: 'hide_post',
      data: {
        title: 'Ẩn Bài Viết',
        message: 'Gỡ bỏ bài viết này khỏi luồng cộng đồng chung.',
        warningNote: 'BR-54: Hệ thống áp dụng Soft-delete. Dữ liệu vẫn được giữ trên database.',
        confirmText: 'Ẩn bài viết',
        type: 'danger',
      },
    });
  };

  // --- EXECUTORS ---
  const handleConfirmAction = () => {
    const { actionType } = confirmModalConfig;
    if (actionType === 'dismiss') alert('Đã bỏ qua báo cáo.');
    if (actionType === 'toggle_lock') alert('Đã thay đổi trạng thái khóa bình luận.');
    if (actionType === 'hide_post') alert('Đã ẩn bài viết thành công.');
    closeModals();
  };

  const handleTogglePin = (id, currentStatus) => {
    alert(
      currentStatus
        ? 'Đã bỏ ghim bài viết.'
        : 'Đã ghim bài viết lên đầu (Ghi đè thuật toán xếp hạng).'
    );
  };

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface">
            Quản lý Nội dung Cộng đồng
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-tight text-on-surface-variant">
            Kiểm duyệt bài đăng, ghim thông báo & xử lý vi phạm
          </p>
        </div>
      </div>

      {/* VIEW & SEARCH BAR */}
      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
        {/* SEARCH BAR */}
        <div className="relative w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 pl-9 text-xs font-semibold outline-none focus:border-primary focus:bg-surface-container-lowest"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('reports')}
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold transition-all ${
              viewMode === 'reports'
                ? 'bg-error text-on-error shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Icon name="shield_alert" size={16} /> Báo cáo Vi phạm
            {filteredReports.length > 0 && (
              <span
                className={`ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-sm px-1.5 text-[10px] ${viewMode === 'reports' ? 'bg-on-error text-error' : 'bg-error text-on-error'}`}
              >
                {filteredReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('posts')}
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold transition-all ${
              viewMode === 'posts'
                ? 'bg-on-surface text-surface-container-lowest shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
            }`}
          >
            <Icon name="message_square" size={16} /> Tất cả Bài viết
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === 'reports' &&
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="max-w-3xl space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    <span className="text-error">{report.id}</span>
                    <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-on-surface-variant">
                      {report.type}
                    </span>
                    <span className="text-outline">{report.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface">{report.reason}</h4>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Người báo: <span className="text-on-surface">{report.reporter}</span>{' '}
                    <span className="text-outline">➔</span> Bị tố cáo:{' '}
                    <span className="text-error">{report.target}</span>
                  </p>
                  <div className="rounded-md border-l-4 border-outline-variant bg-surface-container-low p-3 font-mono text-xs leading-relaxed text-on-surface-variant">
                    "{report.content}"
                  </div>
                </div>
                <div className="ml-4 flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() =>
                      setViolationModalData({
                        id: report.id,
                        targetId: report.target,
                        targetName: report.target,
                      })
                    }
                    className="rounded-md bg-error px-4 py-2 text-xs font-bold text-on-error shadow-sm hover:bg-on-error-container"
                  >
                    PHẠT / ẨN BÀI
                  </button>
                  <button
                    onClick={() => triggerDismissReport(report)}
                    className="rounded-md border border-outline-variant px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                  >
                    BỎ QUA REPORT
                  </button>
                </div>
              </div>
            </div>
          ))}

        {viewMode === 'posts' &&
          MOCK_POSTS.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    <span className="text-primary">{post.id}</span>
                    <span className="text-outline">{post.date}</span>
                    {post.isPinned && (
                      <span className="rounded bg-secondary-container px-1.5 py-0.5 text-on-secondary-container">
                        PINNED
                      </span>
                    )}
                    {post.isLocked && (
                      <span className="rounded bg-error-container px-1.5 py-0.5 text-error">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Tác giả: <span className="text-on-surface">{post.author}</span> | Danh mục:{' '}
                    {post.category}
                  </p>
                  <div className="text-base leading-relaxed text-on-surface">{post.content}</div>
                </div>
                <div className="ml-4 flex min-w-[140px] shrink-0 flex-col gap-2">
                  <button
                    onClick={() => handleTogglePin(post.id, post.isPinned)}
                    className={`rounded-md border px-3 py-2 text-xs font-bold transition-colors ${post.isPinned ? 'border-secondary-container text-on-secondary-container hover:bg-secondary-fixed' : 'border-outline-variant bg-on-surface text-surface-container-lowest hover:bg-on-surface/90'}`}
                  >
                    {post.isPinned ? 'BỎ GHIM' : 'GHIM BÀI'}
                  </button>
                  <button
                    onClick={() => triggerToggleLock(post)}
                    className="rounded-md border border-outline-variant px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
                  >
                    {post.isLocked ? 'MỞ BÌNH LUẬN' : 'KHÓA BÌNH LUẬN'}
                  </button>
                  <button
                    onClick={() => triggerHidePost(post.id)}
                    className="rounded-md border border-error-container px-3 py-2 text-xs font-bold text-error hover:bg-error-container/50"
                  >
                    ẨN BÀI VIẾT
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* MODALS RENDER AREA */}
      <ConfirmActionModal
        isOpen={confirmModalConfig.isOpen}
        onClose={closeModals}
        onConfirm={handleConfirmAction}
        title={confirmModalConfig.data?.title}
        message={confirmModalConfig.data?.message}
        warningNote={confirmModalConfig.data?.warningNote}
        confirmText={confirmModalConfig.data?.confirmText}
        type={confirmModalConfig.data?.type}
      />

      <HandleViolationModal
        isOpen={!!violationModalData}
        onClose={closeModals}
        reportData={violationModalData}
        onConfirm={(payload) => {
          console.log('Penalty Payload:', payload);
          alert('Đã áp dụng mức phạt và lưu Audit Log.');
          closeModals();
        }}
      />
    </div>
  );
};

export default PostModeration;
