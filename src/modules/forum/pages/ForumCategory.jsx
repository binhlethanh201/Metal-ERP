/**
 * ForumCategory Page - Xem tất cả bài viết trong tin tức ngành
 */

import { useState, useEffect } from 'react';
import ForumHeader from '../components/ForumHeader';
import CreatePostModal from '../components/CreatePostModal';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { PostCard } from '../components/PostCard';
import { TrendInsightCard } from '../components/TrendInsightCard';
import { mockCategories, mockPosts, mockSuggestions } from '../data/forumMockData';

export const ForumCategory = ({ categoryId = 1 }) => {
  const category = mockCategories.find((c) => c.id === categoryId);
  const [posts, setPosts] = useState([]);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  useEffect(() => {
    const filtered = mockPosts.filter((p) => p.category === category?.name);
    setPosts(filtered);
  }, [category]);

  const handleLike = (postId) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  if (!category) {
    return <div className="py-8 text-center text-slate-500">Tin tức ngành không tìm thấy</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="mx-auto flex max-w-[1400px] justify-center gap-4 px-4 py-4">
        {/* Left Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 overflow-y-auto lg:block">
          <ForumLeftSidebar activeKey="category" />
        </aside>

        {/* Main Feed */}
        <main className="w-full min-w-0 max-w-[720px] space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
                  <p className="text-sm text-slate-500">{category.postCount} bài viết</p>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => setIsCreatePostModalOpen(true)}>
              + Đăng bài
            </Button>
          </div>

          {/* Description */}
          <Card className="border-blue-200 bg-blue-50">
            <p className="text-[15px] leading-relaxed text-slate-600">
              Tin tức ngành {category.name.toLowerCase()} là nơi chia sẻ những kinh nghiệm, mẹo vặt,
              xu hướng mới trong lĩnh vực này. Hãy tham gia thảo luận và học hỏi từ cộng đồng.
            </p>
          </Card>

          {/* Product Suggestions */}
          {categoryId === 5 && (
            <Card header="📊 Gợi ý sản phẩm từ cộng đồng">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {mockSuggestions.map((suggestion) => (
                  <TrendInsightCard key={suggestion.id} trend={suggestion} type="suggestion" />
                ))}
              </div>
            </Card>
          )}

          {/* Posts */}
          <Card header={`Bài viết trong tin tức ngành (${posts.length})`}>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg text-slate-500">Chưa có bài viết trong tin tức ngành này</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setIsCreatePostModalOpen(true)}
                  >
                    Đăng bài đầu tiên
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handleLike(post.id)}
                    onClick={() => console.log('View post:', post.id)}
                  />
                ))
              )}
            </div>
          </Card>

          {/* Related Categories */}
          <Card header="Tin tức ngành liên quan">
            <div className="flex flex-wrap gap-2">
              {mockCategories
                .filter((c) => c.id !== categoryId)
                .map((relCat) => (
                  <button
                    key={relCat.id}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    <span>{relCat.icon}</span>
                    <span>{relCat.name}</span>
                  </button>
                ))}
            </div>
          </Card>
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default ForumCategory;
