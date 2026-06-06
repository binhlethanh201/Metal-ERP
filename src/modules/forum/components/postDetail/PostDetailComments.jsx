import React, { useState, useMemo } from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const PostDetailComments = ({ comments: initialComments = [] }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [sortBy, setSortBy] = useState('newest');
  const [commentCount, setCommentCount] = useState(initialComments.length);
  const [visibleCount, setVisibleCount] = useState(3);

  const sortedComments = useMemo(() => {
    const ordered = [...comments];
    if (sortBy === 'oldest') return ordered.reverse();
    return ordered;
  }, [comments, sortBy]);

  const visibleComments = sortedComments.slice(0, visibleCount);
  const hasMore = visibleCount < sortedComments.length;

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

  const renderComment = (comment, isReply = false) => (
    <div
      key={comment.id}
      className={`relative rounded-xl border bg-white p-4 shadow-sm ${
        comment.isBest ? 'border-2 border-[#004785]' : 'border-slate-100'
      } ${isReply ? '' : ''}`}
    >
      {comment.isBest && !isReply && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-[#004785] px-3 py-0.5 text-[10px] font-bold text-white">
          <Icon name="check_circle" size={12} />
          CÂU TRẢ LỜI HỮU ÍCH NHẤT
        </div>
      )}
      <div className="flex gap-4">
        <Avatar name={comment.author} src={comment.avatar} size={isReply ? 'sm' : 'md'} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{comment.author}</span>
            {comment.role && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#004785]">
                {comment.role}
              </span>
            )}
            <span className="text-xs text-slate-400">{comment.time}</span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">{comment.content}</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
            >
              <Icon name="thumb_up" size={14} />
              <span>{comment.likes}</span>
            </button>
            <button type="button" className="text-xs font-bold text-[#004785] hover:underline">
              Trả lời
            </button>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-slate-100 pl-6">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar name={reply.author} src={reply.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{reply.author}</span>
                      {reply.role && (
                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#004785]">
                          {reply.role}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{reply.time}</span>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-slate-600">{reply.content}</p>
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
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Bình luận ({commentCount})</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sắp xếp theo:</span>
          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#004785] hover:bg-slate-200"
          >
            {sortBy === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
            <Icon name="expand_more" size={14} />
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-4">
        <Avatar
          name="Current user"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd7kAzZGsawf2ZQAN57Bsk8gVkPiWD9arBCWHLjg6ufHd97yZTYrvQo3xCtGQriM3eOdInWBcO61hueNNIsMWnYmBNIUrjvKOuu-1GtuqyIq1TKaVOIGmUMC-Cza2B-wHCMvOWnC8CUXUJZh3Jb6wLvziATIcpGPUrB0ukKIK6yVJYMq5XJJczpggzmiyWzbo2igT8L7B0ziAwsdAK0TeAd3-5-L6Y3QyosjGG_WbBR7HjL2_Aw4acMTT26KrvGPVMofcjAMiRgSNZ"
          size="md"
        />
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#004785]/20"
            placeholder="Chia sẻ ý kiến của bạn..."
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddComment}
              className="rounded-full bg-[#004785] px-8 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#003560] active:scale-95"
            >
              Gửi bình luận
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visibleComments.map((c) => renderComment(c))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setVisibleCount((p) => p + 5)}
            className="mt-4 w-full rounded-xl border-2 border-[#004785] py-3 text-sm font-bold text-[#004785] transition-colors hover:bg-blue-50"
          >
            Xem thêm bình luận ({sortedComments.length - visibleCount} còn lại)
          </button>
        )}
      </div>
    </section>
  );
};

export default PostDetailComments;
