/**
 * PostDetail Page - Chi tiết bài viết
 */

import { useMemo, useState } from 'react';
import ForumHeader from '../components/ForumHeader';
import CreatePostModal from '../components/CreatePostModal';
import ForumLeftSidebar from '../components/ForumLeftSidebar';
import postDetailMockData from '../data/postDetailMockData';

const MaterialIcon = ({ name, className = '', fill = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
    }}
  >
    {name}
  </span>
);

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const Avatar = ({ name, className = '', size = 'md' }) => {
  const sizeStyles = {
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#004785] to-[#005296] font-bold text-white ${sizeStyles[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

const ProductThumbnail = ({ name }) => (
  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-[#D9E6FF] bg-gradient-to-br from-[#EFF4FF] to-[#C7DBFF] px-2 text-center">
    <MaterialIcon name="ink_pen" className="mb-1 text-2xl text-[#005296]" fill />
    <span className="line-clamp-3 text-[10px] font-bold leading-tight text-[#005296]">{name}</span>
  </div>
);

export const PostDetail = ({ postId = 1 }) => {
  const [commentText, setCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(124);
  const [sortBy, setSortBy] = useState('newest');
  const [commentCount, setCommentCount] = useState(46);
  const post = postDetailMockData.post;
  const [comments, setComments] = useState(postDetailMockData.comments);

  const sortedComments = useMemo(() => {
    const ordered = [...comments];
    if (sortBy === 'oldest') {
      return ordered.reverse();
    }

    return ordered;
  }, [comments, sortBy]);

  const relatedPosts = postDetailMockData.relatedPosts;
  const trends = postDetailMockData.trends;
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        author: 'Bạn',
        role: null,
        time: 'Vừa xong',
        content: commentText.trim(),
        likes: 0,
        isBest: false,
        replies: [],
      };

      setComments((currentComments) => [newComment, ...currentComments]);
      setCommentCount((currentCount) => currentCount + 1);
      setCommentText('');
    }
  };

  const primaryButtonClass = 'bg-[#005296] text-white hover:bg-[#00457f]';
  const secondaryButtonClass = 'bg-[#E5EEFF] text-[#005296] hover:bg-[#D9E6FF]';
  const ghostButtonClass = 'text-[#005296] hover:bg-[#EFF4FF]';

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 antialiased">
      <ForumHeader onCreatePostClick={() => setIsCreatePostModalOpen(true)} />

      <div className="mx-auto flex max-w-[1400px] justify-center gap-4 px-4 py-4">
        {/* Left Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 overflow-y-auto lg:block">
          <ForumLeftSidebar activeKey="detail" />
        </aside>

        {/* Main Content */}
        <main className="w-full min-w-0 max-w-[720px] space-y-4">
          {/* Post Card */}
          <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            {/* Post Header */}
            <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={post.author} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{post.author}</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-[#004785]">
                      {post.authorRole}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Đã đăng {post.date} • {post.views.toLocaleString()} lượt xem
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Post Content */}
            <div className="p-5">
              <h1 className="mb-4 text-xl font-bold text-gray-900">{post.title}</h1>

              {/* Trend Info */}
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-blue-50/50 p-3">
                <div className="flex items-center gap-1 text-sm font-bold text-[#004785]">
                  <MaterialIcon name="trending_up" className="text-base" />
                  📊 {post.trend}
                </div>
                <div className="h-4 w-[1px] bg-slate-200"></div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <MaterialIcon name="location_on" className="text-base" />
                  {post.location}
                </div>
              </div>

              {/* Post Text */}
              <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-gray-600">
                <p>{post.content}</p>
                <p>{post.content2}</p>
              </div>

              {/* Product Card */}
              <div className="group mb-8 flex items-center gap-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-[#004785]/30">
                <ProductThumbnail name={post.product.name} />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{post.product.name}</h4>
                  <div className="mt-1 flex items-center gap-4">
                    <span className="text-xl font-bold text-[#004785]">{post.product.price}</span>
                    <span className="flex items-center text-sm font-bold text-green-600">
                      <MaterialIcon name="arrow_upward" className="text-base" />
                      {post.product.trend}
                    </span>
                  </div>
                </div>
                <button
                  className={`flex items-center gap-2 rounded-full px-6 py-2 font-medium transition-colors ${primaryButtonClass}`}
                >
                  <MaterialIcon name="add_shopping_cart" fill />
                  Thêm vào kho
                </button>
              </div>
            </div>

            {/* Post Footer */}
            <footer className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-full bg-slate-100 p-1">
                  <button
                    onClick={() => {
                      setIsVoted(!isVoted);
                      setVoteCount(isVoted ? voteCount - 1 : voteCount + 1);
                    }}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-slate-500 transition-all hover:bg-white"
                  >
                    <MaterialIcon name="thumb_up" fill={isVoted} />
                    <span className="text-xs font-bold">{voteCount}</span>
                  </button>
                  <div className="h-4 w-[1px] bg-slate-300"></div>
                  <button className="flex items-center rounded-full px-3 py-1 text-slate-500 transition-all hover:bg-white">
                    <MaterialIcon name="thumb_down" />
                  </button>
                </div>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${ghostButtonClass}`}
                >
                  <MaterialIcon name="bookmark" fill={isSaved} />
                  <span className="text-xs font-bold">Lưu</span>
                </button>
                <button
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${ghostButtonClass}`}
                >
                  <MaterialIcon name="share" />
                  <span className="text-xs font-bold">Chia sẻ</span>
                </button>
              </div>
              <button className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-50">
                <MaterialIcon name="report" />
                Báo cáo
              </button>
            </footer>
          </article>

          {/* Comments Section */}
          <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Bình luận ({commentCount})</h3>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs">Sắp xếp theo:</span>
                <button
                  onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${secondaryButtonClass}`}
                >
                  {sortBy === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
                  <MaterialIcon name="expand_more" className="text-base" />
                </button>
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-8 flex items-start gap-4">
              <Avatar name="Current user" size="md" />
              <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-0">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[112px] w-full resize-none rounded-2xl border-none bg-white p-4 text-[15px] text-gray-600 placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#004785]"
                  placeholder="Chia sẻ ý kiến của bạn..."
                />
                <div className="flex justify-end p-2 pt-0">
                  <button
                    onClick={handleAddComment}
                    className={`rounded-full px-6 py-2 font-medium transition-colors ${primaryButtonClass}`}
                  >
                    Gửi bình luận
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {sortedComments.map((comment) => (
                <div key={comment.id}>
                  <div
                    className={`relative rounded-2xl p-5 ${comment.isBest ? 'border border-[#B9D7FF] bg-[#F4F8FF]' : 'border border-gray-100 bg-white'}`}
                  >
                    {comment.isBest && (
                      <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-[#004785] px-3 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
                        <MaterialIcon name="verified" className="text-xs" fill />
                        Câu trả lời hữu ích nhất
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Avatar name={comment.author} size="md" />
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold">{comment.author}</span>
                          {comment.role && (
                            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#004785]">
                              {comment.role}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p className="mb-3 text-[15px] leading-relaxed text-gray-600">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-6">
                          <button
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${secondaryButtonClass}`}
                          >
                            <MaterialIcon name="thumb_up" />
                            {comment.likes}
                          </button>
                          <button className="text-xs font-bold text-[#004785] transition-colors hover:underline">
                            Trả lời
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies && (
                          <div className="mt-6 space-y-4 border-l-2 border-blue-100 pl-6">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-4">
                                <Avatar name={reply.author} size="sm" />
                                <div className="flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold">{reply.author}</span>
                                    {reply.role && (
                                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#004785]">
                                        {reply.role}
                                      </span>
                                    )}
                                    <span className="text-xs text-slate-400">{reply.time}</span>
                                  </div>
                                  <p className="mb-2 text-[15px] leading-relaxed text-gray-600">
                                    {reply.content}
                                  </p>
                                  <button className="text-xs font-bold text-[#004785] transition-colors hover:underline">
                                    Trả lời
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className={`mt-6 w-full rounded-xl border py-3 font-bold transition-colors ${secondaryButtonClass} border-[#B9D7FF]`}
              >
                Xem thêm bình luận
              </button>
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-[300px] shrink-0 space-y-4 overflow-y-auto xl:block">
          {/* Product Trends */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
              <MaterialIcon name="trending_up" className="text-[#004785]" />
              Xu hướng sản phẩm
            </h4>
            <ul className="space-y-4">
              {trends.map((trend, idx) => (
                <li key={idx} className="group flex items-center justify-between">
                  <span className="cursor-pointer text-sm text-slate-600 transition-colors group-hover:text-[#004785]">
                    {trend.name}
                  </span>
                  <span
                    className={`${trend.isPositive ? 'text-green-600' : 'text-red-500'} text-xs font-bold`}
                  >
                    {trend.change}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Related Posts */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-sm font-bold text-slate-700">Bài viết liên quan</h4>
            <div className="space-y-4">
              {relatedPosts.map((relPost) => (
                <button
                  key={relPost.id}
                  type="button"
                  className="group block w-full cursor-pointer text-left"
                >
                  <p className="line-clamp-2 text-sm font-medium text-slate-700 transition-colors group-hover:text-[#004785]">
                    {relPost.title}
                  </p>
                  <span className="mt-1 block text-xs text-slate-400">
                    {relPost.comments} bình luận • {relPost.date}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Tags */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-sm font-bold text-slate-700">Tags liên quan</h4>
            <div className="flex flex-wrap gap-2">
              {postDetailMockData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition-all hover:bg-blue-50 hover:text-[#004785]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Guidelines */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-bold text-slate-700">Quy định cộng đồng</h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Vui lòng tuân thủ quy tắc ứng xử văn minh. Không đăng tin rác, quảng cáo không đúng
              tin tức ngành. Các bài viết sai quy định sẽ bị gỡ bỏ không báo trước.
            </p>
            <button type="button" className="mt-3 inline-block text-sm font-bold text-[#004785]">
              Xem chi tiết
            </button>
          </section>
        </aside>
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
      />
    </div>
  );
};

export default PostDetail;
