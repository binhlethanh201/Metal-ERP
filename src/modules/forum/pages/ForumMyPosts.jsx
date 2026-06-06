/**
 * ForumMyPosts - Trang "Bài viết của tôi".
 */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MyPostListItem from '../components/myPosts/MyPostListItem';
import Pagination from '../components/shared/Pagination';
import Icon from '../../../shared/components/Icon';
import { myPostsTabs, myPosts as initialPosts } from '../data/forumPageData';

const ForumMyPosts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Đã đăng');
  const [posts, setPosts] = useState(initialPosts);
  const { setRightSidebar } = useOutletContext();

  useEffect(() => {
    setRightSidebar?.(null);
    return () => setRightSidebar?.(null);
  }, [setRightSidebar]);

  const filteredPosts = useMemo(() => {
    if (activeTab === 'Tất cả') return posts;
    return posts.filter((p) => p.tab === activeTab);
  }, [activeTab, posts]);

  const counts = useMemo(
    () => ({
      'Đã đăng': posts.filter((p) => p.tab === 'Đã đăng').length,
      'Chờ duyệt': posts.filter((p) => p.tab === 'Chờ duyệt').length,
      Nháp: posts.filter((p) => p.tab === 'Nháp').length,
      'Đã ẩn': posts.filter((p) => p.tab === 'Đã ẩn').length,
    }),
    [posts]
  );

  const handleEdit = (post) => {
    navigate(`/forum/post/${post.id}?edit=true`);
  };

  const handleToggleVisibility = (post) => {
    const isHidden = post.tab === 'Đã ẩn';
    const action = isHidden ? 'hiển thị lại' : 'ẩn';
    if (!window.confirm(`Bạn có chắc muốn ${action} bài viết này?`)) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              tab: isHidden ? 'Đã đăng' : 'Đã ẩn',
              status: isHidden ? 'Đã đăng' : 'Đã ẩn',
              statusClass: isHidden ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
            }
          : p
      )
    );
  };

  const handleDelete = (post) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn bài viết "${post.title}"?`)) return;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  const statCards = [
    {
      label: 'Đã đăng',
      count: counts['Đã đăng'],
      icon: 'check_circle',
      tone: 'text-green-600 bg-green-50',
    },
    {
      label: 'Chờ duyệt',
      count: counts['Chờ duyệt'],
      icon: 'schedule',
      tone: 'text-amber-600 bg-amber-50',
    },
    { label: 'Nháp', count: counts['Nháp'], icon: 'edit', tone: 'text-slate-600 bg-slate-100' },
    {
      label: 'Đã ẩn',
      count: counts['Đã ẩn'],
      icon: 'visibility_off',
      tone: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900">Bài viết của tôi</h2>
        <p className="text-sm text-slate-500 opacity-90">
          Quản lý tất cả bài viết bạn đã đăng trên diễn đàn.
        </p>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setActiveTab(item.label)}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
              activeTab === item.label
                ? 'border-[#004785] bg-blue-50/30 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
              <Icon name={item.icon} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{item.count}</p>
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs filter */}
      <section className="rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1">
          {['Tất cả', ...myPostsTabs].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2.5 text-center text-sm font-bold transition-all duration-200 ${
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

      {/* Post list */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Icon name="description" size={28} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Chưa có bài viết nào</p>
            <p className="mt-1 text-xs text-slate-400">
              Bài viết của bạn sẽ xuất hiện tại đây sau khi đăng.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPosts.map((post) => (
              <MyPostListItem
                key={post.id}
                post={post}
                onClick={() => navigate(`/forum/post/${post.id}`)}
                onEdit={handleEdit}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
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

export default ForumMyPosts;
