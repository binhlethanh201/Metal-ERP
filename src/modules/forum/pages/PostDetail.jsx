/**
 * src/modules/forum/pages/PostDetail.jsx
 * Trang Chi tiết bài viết - Đã bóc tách lỗi trùng lặp Layout và đồng bộ hóa toàn diện
 * hệ thống nút bấm khối, bo góc rounded-xl theo chuẩn POS/Inventory.
 */
import { useMemo, useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import PostDetailRightSidebar from '../components/postDetail/PostDetailRightSidebar';
import Avatar from '../components/shared/Avatar';
import Icon from '../../../shared/components/Icon';
import postDetailMockData from '../data/postDetailMockData';

const ProductThumbnail = ({ name }) => (
  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-blue-100 bg-slate-50 px-2 text-center">
    <Icon name="package" className="mb-1 text-slate-400" size={20} />
    <span className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-500">{name}</span>
  </div>
);

export const PostDetail = () => {
  const navigate = useNavigate();
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

  const { setRightSidebar } = useOutletContext();

  // Bắn cụm Right Sidebar lên Layout mẹ tập trung ở rễ
  useEffect(() => {
    if (setRightSidebar) {
      setRightSidebar(
        <PostDetailRightSidebar
          trends={trends}
          relatedPosts={relatedPosts}
          tags={postDetailMockData.tags}
        />
      );
    }
    return () => setRightSidebar?.(null);
  }, [setRightSidebar, trends, relatedPosts]);

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

  // Đồng bộ hoàn toàn style nút bấm vuông bo mềm mại chuẩn ERP
  const btnPrimary = 'bg-[#004785] text-white hover:bg-black font-bold';
  const btnSecondary = 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold';
  const btnGhost = 'text-slate-600 hover:bg-slate-100 font-semibold';

  return (
    <div className="space-y-4">
      {/* Breadcrumb điều hướng quay lại */}
      <nav className="mb-2 flex items-center gap-1 px-1 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => navigate('/forum')}
          className="transition-colors hover:text-[#004785]"
        >
          Diễn đàn
        </button>
        <Icon name="chevron_right" size={12} />
        <span className="font-medium text-[#004785]">Chi tiết bài viết</span>
      </nav>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER BÀI ĐĂNG CHI TIẾT */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={post.author} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{post.author}</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004785]">
                  {post.authorRole || 'Thành viên'}
                </span>
              </div>
              <span className="mt-0.5 block text-xs font-medium text-slate-400">
                Đã đăng {post.date} • {post.views.toLocaleString()} lượt xem
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* NỘI DUNG CHI TIẾT BÀI ĐĂNG */}
        <div className="p-5">
          <h1 className="mb-3 text-xl font-bold leading-tight text-gray-900">{post.title}</h1>

          <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-orange-600">
              <Icon name="trending_up" size={14} />
              <span>{post.trend}</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-500">
              <Icon name="location_on" size={14} />
              <span>{post.location}</span>
            </div>
          </div>

          <div className="mb-6 space-y-4 text-[15px] font-medium leading-relaxed text-slate-600">
            <p>{post.content}</p>
            <p>{post.content2}</p>
          </div>

          {/* SẢN PHẨM SỈ ĐÍNH KÈM CHUẨN KHỐI ERP */}
          <div className="group mb-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#004785]/30">
            <ProductThumbnail name={post.product.name} />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-bold text-slate-800">{post.product.name}</h4>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-lg font-black text-[#004785]">{post.product.price}</span>
                <span className="flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-600">
                  <Icon name="arrow_upward" size={12} className="mr-0.5" />
                  {post.product.trend}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition-all active:scale-95 ${btnPrimary}`}
            >
              <Icon name="add" size={14} />
              <span>Thêm vào kho</span>
            </button>
          </div>
        </div>

        {/* CHÂN ĐẾ TƯƠNG TÁC TẬP TRUNG BUTTON ROUNDED-XL */}
        <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsVoted(!isVoted);
                  setVoteCount(isVoted ? voteCount - 1 : voteCount + 1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${isVoted ? 'bg-white text-[#004785] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Icon name="thumb_up" size={14} />
                <span>{voteCount}</span>
              </button>
              <div className="h-4 w-[1px] bg-slate-300/60" />
              <button
                type="button"
                className="flex items-center rounded-lg px-2 py-1.5 text-slate-500 hover:bg-white/50 hover:text-slate-800"
              >
                <Icon name="thumb_down" size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors ${btnGhost}`}
            >
              <Icon name="bookmark" size={15} />
              <span>Lưu</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors ${btnGhost}`}
            >
              <Icon name="share" size={15} />
              <span>Chia sẻ</span>
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-50"
          >
            <Icon name="report" size={14} />
            <span>Báo cáo</span>
          </button>
        </footer>
      </article>

      {/* 📊 PHÂN PHÂN PHÂN PHÂN HỆ BÌNH LUẬN CAO CẤP */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-800">Bình luận ({commentCount})</h3>
          <div className="flex items-center gap-2 font-medium text-slate-400">
            <span className="text-xs">Sắp xếp:</span>
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-colors ${btnSecondary}`}
            >
              <span>{sortBy === 'newest' ? 'Mới nhất' : 'Cũ nhất'}</span>
              <Icon name="chevron_down" size={14} />
            </button>
          </div>
        </div>

        {/* Khối khung Viết bình luận mới */}
        <div className="mb-6 flex items-start gap-4">
          <Avatar name="Current user" size="md" />
          <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 focus-within:border-slate-300">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[96px] w-full resize-none border-none bg-white p-3.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
              placeholder="Chia sẻ ý kiến chuyên môn của bạn..."
            />
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 p-2">
              <button
                type="button"
                onClick={handleAddComment}
                className={`rounded-xl px-4 py-2 text-xs shadow-sm transition-all active:scale-95 ${btnPrimary}`}
              >
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>

        {/* Khối cây danh sách Bình luận */}
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="shadow-sm/5 relative rounded-xl border border-slate-100 bg-white p-4"
            >
              {comment.isBest && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-[#004785] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                  <Icon name="check_circle" size={10} />
                  <span>Hữu ích nhất</span>
                </div>
              )}
              <div className="flex gap-4">
                <Avatar name={comment.author} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 font-medium">
                    <span className="text-sm font-bold text-slate-800">{comment.author}</span>
                    {comment.role && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#004785]">
                        {comment.role}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{comment.time}</span>
                  </div>
                  <p className="mb-3 text-sm font-medium leading-relaxed text-slate-600">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <button
                      type="button"
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${btnSecondary}`}
                    >
                      <Icon name="thumb_up" size={12} />
                      <span>{comment.likes}</span>
                    </button>
                    <button type="button" className="text-[#004785] hover:underline">
                      Trả lời
                    </button>
                  </div>

                  {/* Nhánh con replies câu trả lời đệm */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 border-l-2 border-slate-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar name={reply.author} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex flex-wrap items-center gap-2 font-medium">
                              <span className="text-sm font-bold text-slate-800">
                                {reply.author}
                              </span>
                              {reply.role && (
                                <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#004785]">
                                  {reply.role}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">{reply.time}</span>
                            </div>
                            <p className="mb-2 text-sm font-medium leading-relaxed text-slate-600">
                              {reply.content}
                            </p>
                            <button
                              type="button"
                              className="text-xs font-bold text-[#004785] hover:underline"
                            >
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
          ))}

          <button
            type="button"
            className={`mt-2 w-full rounded-xl border py-2.5 text-xs font-bold transition-colors ${btnSecondary} border-slate-200`}
          >
            Xem thêm bình luận
          </button>
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
