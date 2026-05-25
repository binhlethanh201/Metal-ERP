/**
 * Trang Chi tiết bài viết - Nội dung + bình luận + vote + sản phẩm đính kèm.
 * Dùng Avatar, PostDetailRightSidebar.
 */
import { useMemo, useState } from 'react';
import ForumLayout from '../components/shared/ForumLayout';
import PostDetailRightSidebar from '../components/postDetail/PostDetailRightSidebar';
import MaterialIcon from '../components/shared/MaterialIcon';
import Avatar from '../components/shared/Avatar';
import postDetailMockData from '../data/postDetailMockData';

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
  const relatedPosts = postDetailMockData.relatedPosts;
  const trends = postDetailMockData.trends;

  const sortedComments = useMemo(() => {
    const ordered = [...comments];
    if (sortBy === 'oldest') return ordered.reverse();
    return ordered;
  }, [comments, sortBy]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      {
        id: Date.now(),
        author: 'Bạn',
        role: null,
        time: 'Vừa xong',
        content: commentText.trim(),
        likes: 0,
        isBest: false,
        replies: [],
      },
      ...prev,
    ]);
    setCommentCount((c) => c + 1);
    setCommentText('');
  };

  const btnPrimary = 'bg-[#005296] text-white hover:bg-[#00457f]';
  const btnSecondary = 'bg-[#E5EEFF] text-[#005296] hover:bg-[#D9E6FF]';
  const btnGhost = 'text-[#005296] hover:bg-[#EFF4FF]';

  return (
    <ForumLayout
      activeKey="detail"
      rightSidebar={
        <PostDetailRightSidebar
          trends={trends}
          relatedPosts={relatedPosts}
          tags={postDetailMockData.tags}
        />
      }
    >
      <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
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

        <div className="p-5">
          <h1 className="mb-4 text-xl font-bold text-gray-900">{post.title}</h1>
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-blue-50/50 p-3">
            <div className="flex items-center gap-1 text-sm font-bold text-[#004785]">
              <MaterialIcon name="trending_up" className="text-base" />
              📊 {post.trend}
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MaterialIcon name="location_on" className="text-base" />
              {post.location}
            </div>
          </div>
          <div className="mb-8 space-y-4 text-[15px] leading-relaxed text-gray-600">
            <p>{post.content}</p>
            <p>{post.content2}</p>
          </div>
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
              className={`flex items-center gap-2 rounded-full px-6 py-2 font-medium transition-colors ${btnPrimary}`}
            >
              <MaterialIcon name="add_shopping_cart" fill />
              Thêm vào kho
            </button>
          </div>
        </div>

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
              <div className="h-4 w-[1px] bg-slate-300" />
              <button className="flex items-center rounded-full px-3 py-1 text-slate-500 transition-all hover:bg-white">
                <MaterialIcon name="thumb_down" />
              </button>
            </div>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${btnGhost}`}
            >
              <MaterialIcon name="bookmark" fill={isSaved} />
              <span className="text-xs font-bold">Lưu</span>
            </button>
            <button
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${btnGhost}`}
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

      <section className="mt-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Bình luận ({commentCount})</h3>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs">Sắp xếp theo:</span>
            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${btnSecondary}`}
            >
              {sortBy === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
              <MaterialIcon name="expand_more" className="text-base" />
            </button>
          </div>
        </div>
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
                className={`rounded-full px-6 py-2 font-medium transition-colors ${btnPrimary}`}
              >
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
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
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${btnSecondary}`}
                      >
                        <MaterialIcon name="thumb_up" />
                        {comment.likes}
                      </button>
                      <button className="text-xs font-bold text-[#004785] transition-colors hover:underline">
                        Trả lời
                      </button>
                    </div>
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
            className={`mt-6 w-full rounded-xl border py-3 font-bold transition-colors ${btnSecondary} border-[#B9D7FF]`}
          >
            Xem thêm bình luận
          </button>
        </div>
      </section>
    </ForumLayout>
  );
};

export default PostDetail;
