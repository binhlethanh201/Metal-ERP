/**
 * ForumSaved - Trang "Bài đã lưu".
 */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PostListItem from '../components/home/PostListItem';
import Pagination from '../components/shared/Pagination';
import Icon from '../../../shared/components/Icon';
import { savedPosts as initialPosts } from '../data/forumPageData';

const FILTER_TABS = [
  'Tất cả',
  'Bán sỉ',
  'Tìm nguồn hàng',
  'Thanh lý kho',
  'Mua chung',
  'Thảo luận',
];

const ForumSaved = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const { setRightSidebar } = useOutletContext();

  useEffect(() => {
    setRightSidebar?.(null);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  const filteredPosts = useMemo(() => {
    if (activeTab === 'Tất cả') return posts;
    return posts.filter((p) => p.category === activeTab);
  }, [posts, activeTab]);

  const handleUnsave = (post) => {
    if (!window.confirm('Bỏ lưu bài viết này?')) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Bài đã lưu</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Danh sách các bài viết bạn đã lưu để xem lại sau.
        </p>
      </header>

      {posts.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Icon name="bookmark" size={20} className="text-[#004785]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {filteredPosts.length} / {posts.length} bài viết
              </p>
              <p className="text-xs text-slate-500">
                Các bài viết được lưu trữ để bạn tham khảo khi cần.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'scale-[1.01] bg-white text-[#004785] shadow-sm ring-1 ring-black/5'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Icon name="bookmark" size={28} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {posts.length === 0
                ? 'Chưa lưu bài viết nào'
                : `Không có bài viết nào trong mục "${activeTab}"`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {posts.length === 0
                ? 'Nhấn biểu tượng dấu trang để lưu bài viết bạn quan tâm.'
                : 'Thử chọn bộ lọc khác.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                <PostListItem post={post} onClick={() => navigate(`/forum/post/${post.id}`)} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(post);
                  }}
                  className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
                  title="Bỏ lưu"
                >
                  <Icon name="bookmark" size={14} />
                  <span className="hidden sm:inline">Bỏ lưu</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {filteredPosts.length > 0 && (
        <div className="pt-2">
          <Pagination />
        </div>
      )}
    </div>
  );
};

export default ForumSaved;
