import React, { useState, useMemo } from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';
import CommentItem from './CommentItem';

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
        {visibleComments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}

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
