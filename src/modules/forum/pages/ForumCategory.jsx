/**
 * Trang Danh mục - Xem bài viết theo danh mục.
 * Dùng PostCard + TrendInsightCard. Không có right sidebar.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ForumLayout from '../layouts/ForumLayout';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { PostCard } from '../components/shared/PostCard';
import { TrendInsightCard } from '../components/shared/TrendInsightCard';
import { mockCategories, mockPosts, mockSuggestions } from '../data/forumMockData';

export const ForumCategory = ({ categoryId = 1 }) => {
  const navigate = useNavigate();
  const category = mockCategories.find((c) => c.id === categoryId);
  const [posts, setPosts] = useState([]);

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
    <ForumLayout activeKey="category" hideRightSidebar>
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
        <Button variant="primary" onClick={() => navigate('/forum/create')}>
          + Đăng bài
        </Button>
      </div>

      <Card className="mt-4 border-blue-200 bg-blue-50">
        <p className="text-[15px] leading-relaxed text-slate-600">
          Tin tức ngành {category.name.toLowerCase()} là nơi chia sẻ những kinh nghiệm, mẹo vặt, xu
          hướng mới trong lĩnh vực này. Hãy tham gia thảo luận và học hỏi từ cộng đồng.
        </p>
      </Card>

      {categoryId === 5 && (
        <Card header="📊 Gợi ý sản phẩm từ cộng đồng">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {mockSuggestions.map((s) => (
              <TrendInsightCard key={s.id} trend={s} type="suggestion" />
            ))}
          </div>
        </Card>
      )}

      <Card header={`Bài viết trong tin tức ngành (${posts.length})`}>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-slate-500">Chưa có bài viết trong tin tức ngành này</p>
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
    </ForumLayout>
  );
};

export default ForumCategory;
