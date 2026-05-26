/**
 * src/modules/forum/pages/ForumHome.jsx
 * Trang chủ Diễn đàn - Đã sửa lỗi kết nối để đẩy Right Sidebar lên Layout mẹ.
 */
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PostListItem from '../components/home/PostListItem';
import ForumHomeRightSidebar from '../components/home/ForumHomeRightSidebar';
import { useForumFilters } from '../hooks';
import {
  homePosts as posts,
  homeTabs as tabs,
  homeTrendSearches as trendSearches,
  homeTopicTags as topicTags,
  homeHotPosts as hotPosts,
} from '../data/forumPageData';

const ForumHome = () => {
  const navigate = useNavigate();
  const { filteredPosts, activeTab, setActiveTab, handleSearchByTag } = useForumFilters(posts);

  // Lấy hàm setRightSidebar từ Layout thông qua Outlet Context
  const { setRightSidebar } = useOutletContext();

  // Bắn cụm Right Sidebar lên Layout mẹ ngay khi Page được render
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <ForumHomeRightSidebar
          trendSearches={trendSearches}
          topicTags={topicTags}
          hotPosts={hotPosts}
          onSearchByTag={handleSearchByTag}
        />
      );
    }
    // Clean up xóa sidebar cột phải khi rời khỏi trang chủ sang trang khác
    return () => setRightSidebar?.(null);
  }, [setRightSidebar, handleSearchByTag]);

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004785] to-[#00305e] p-6 text-white shadow-md">
        <div className="relative z-10 max-w-lg">
          <h1 className="mb-2 text-xl font-bold leading-tight">
            Cộng đồng kinh doanh kim khí & vật tư xây dựng
          </h1>
          <p className="mb-4 text-sm text-blue-50 opacity-90">
            Trao đổi kinh nghiệm nhập hàng, theo dõi xu hướng thị trường và tối ưu lợi nhuận cho
            shop.
          </p>
          <div className="flex gap-3">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#004785] transition-colors hover:bg-blue-50">
              Khám phá ngay
            </button>
            <button className="rounded-lg border border-white/40 bg-transparent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10">
              Xem xu hướng
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-20">
          <img
            alt="Hardware Tools Decoration"
            className="h-full w-full object-cover contrast-125 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4F_sZRm9hvMfaDDH-YmDdniOxqEpYI2PeGabsVMpXgpR-BMzuQXBdRw-nv2UEhx3ueWJ-vvWAhvHskbDNyNH_SssdWsz_9ZlIWkF4me8X3xJC_vxBMQp56QK-QArHLCj4wgXPGKzAmhYGVu557QJxavhBaOLHIGKctm2JlYZiqdsOYoPiBYwAL63GYuMT09Nxc6qPW9bV2TdHiOAOqZKRWOHeFOARgxU3yQdTv_zJdj5xlCHeguBfpg7ZL3FmOUQSepbct_LpCbM5"
          />
        </div>
      </section>

      {/* Tabs + Post List */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center overflow-x-auto border-b border-gray-100 bg-white px-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap px-4 py-4 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'font-bold text-[#004785]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#004785]" />
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Không tìm thấy bài viết phù hợp.
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                onClick={() => navigate(`/forum/post/${post.id}`)}
                onTagClick={handleSearchByTag}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ForumHome;
