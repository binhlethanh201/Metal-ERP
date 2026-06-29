import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../../../shared/components/Icon';
import {
  getPostList,
  getReportList,
  lockPost,
  unlockPost,
  pinPost,
  unpinPost,
  hidePost,
  resolveReport,
} from '../services/adminService';
import ConfirmActionModal from '../components/ConfirmActionModal';
import HandleViolationModal from '../components/post/HandleViolationModal';

const PostModeration = () => {
  const [viewMode, setViewMode] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    data: null,
    actionType: null,
  });
  const [violationModalData, setViolationModalData] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getPostList(), getReportList({ status: 'PENDING' })])
      .then(([postsData, reportsData]) => {
        setPosts(Array.isArray(postsData) ? postsData : postsData?.items || []);
        setReports(Array.isArray(reportsData) ? reportsData : reportsData?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PostModeration API error:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeModals = () => {
    setConfirmModalConfig({ isOpen: false, data: null, actionType: null });
    setViolationModalData(null);
  };

  const triggerDismissReport = (report) => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: 'dismiss',
      data: {
        title: 'Bỏ qua Báo cáo',
        message: `Bài viết của "${report.target}" không vi phạm tiêu chuẩn cộng đồng?`,
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
          ? 'Cho phép người dùng tiếp tục bình luận.'
          : 'Khóa luồng bình luận.',
        warningNote: !post.isLocked ? 'BR-51: Backend từ chối API tạo bình luận mới.' : '',
        confirmText: post.isLocked ? 'Mở Khóa' : 'Xác nhận Khóa',
        type: post.isLocked ? 'primary' : 'danger',
      },
    });
  };

  const triggerHidePost = (post) => {
    setConfirmModalConfig({
      isOpen: true,
      actionType: 'hide_post',
      data: {
        title: 'Ẩn Bài Viết',
        message: 'Gỡ bài viết này khỏi luồng cộng đồng.',
        warningNote: 'BR-54: Soft-delete — dữ liệu vẫn giữ trên database.',
        confirmText: 'Ẩn bài viết',
        type: 'danger',
      },
    });
  };

  const handleConfirmAction = async () => {
    const { actionType } = confirmModalConfig;
    try {
      if (actionType === 'dismiss')
        await resolveReport(confirmModalConfig.data?.report?.id, 'dismiss', '');
      else if (actionType === 'toggle_lock') {
        const post = confirmModalConfig.data?.post;
        if (post?.isLocked) await unlockPost(post.id);
        else await lockPost(post.id);
      } else if (actionType === 'hide_post') await hidePost(confirmModalConfig.data?.post?.id);
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Moderation action error:', err);
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleTogglePin = async (post, currentStatus) => {
    try {
      if (currentStatus) await unpinPost(post.id);
      else await pinPost(post.id);
      fetchData();
    } catch (err) {
      console.error('Pin error:', err);
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleViolationConfirm = async (payload) => {
    try {
      await resolveReport(payload.reportId, payload.action, payload.adminNote);
      closeModals();
      fetchData();
    } catch (err) {
      console.error('Violation error:', err);
      alert(err.message || 'Xử lý vi phạm thất bại');
    }
  };

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          !searchTerm ||
          (r.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.target || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [reports, searchTerm]
  );

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          !searchTerm ||
          (p.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [posts, searchTerm]
  );

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

      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
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
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('reports')}
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold transition-all ${viewMode === 'reports' ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
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
            className={`flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold transition-all ${viewMode === 'posts' ? 'bg-on-surface text-surface-container-lowest shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}
          >
            <Icon name="message_square" size={16} /> Tất cả Bài viết
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-xs text-on-surface-variant">
          Đang tải...
        </div>
      )}

      {!loading &&
        viewMode === 'reports' &&
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
                  Người báo: <span className="text-on-surface">{report.reporter}</span>
                  <span className="text-outline">➔</span> Bị tố cáo:{' '}
                  <span className="text-error">{report.target}</span>
                </p>
                {report.content && (
                  <div className="rounded-md border-l-4 border-outline-variant bg-surface-container-low p-3 font-mono text-xs leading-relaxed text-on-surface-variant">
                    "{report.content}"
                  </div>
                )}
              </div>
              <div className="ml-4 flex shrink-0 flex-col gap-2">
                <button
                  onClick={() =>
                    setViolationModalData({
                      id: report.id,
                      reportId: report.id,
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

      {!loading &&
        viewMode === 'posts' &&
        filteredPosts.map((post) => (
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
                  onClick={() => handleTogglePin(post, post.isPinned)}
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
                  onClick={() => triggerHidePost(post)}
                  className="rounded-md border border-error-container px-3 py-2 text-xs font-bold text-error hover:bg-error-container/50"
                >
                  ẨN BÀI VIẾT
                </button>
              </div>
            </div>
          </div>
        ))}

      {!loading && viewMode === 'reports' && filteredReports.length === 0 && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-xs text-on-surface-variant">
          Không có báo cáo vi phạm nào.
        </div>
      )}
      {!loading && viewMode === 'posts' && filteredPosts.length === 0 && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-xs text-on-surface-variant">
          Không có bài viết nào.
        </div>
      )}

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
        onConfirm={handleViolationConfirm}
      />
    </div>
  );
};

export default PostModeration;
