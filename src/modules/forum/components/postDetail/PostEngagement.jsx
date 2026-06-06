/**
 * PostEngagement - Thanh like/dislike/lưu/báo cáo cho bài viết.
 */
import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const PostEngagement = () => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(245);

  const handleLike = () => {
    if (disliked) setDisliked(false);
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    }
    setDisliked(!disliked);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <button
        type="button"
        onClick={handleLike}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${liked ? 'bg-blue-100 text-[#004785]' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#004785]'}`}
      >
        <Icon name="thumb_up" size={16} />
        <span>{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={handleDislike}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${disliked ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'}`}
      >
        <Icon name="thumb_down" size={16} />
      </button>

      <span className="mx-1 h-5 w-px bg-slate-200" />

      <button
        type="button"
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${saved ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600'}`}
      >
        <Icon name="bookmark" size={16} />
        <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Lưu bài viết'}</span>
      </button>

      <button
        type="button"
        onClick={() => alert('Đã gửi báo cáo. Chúng tôi sẽ xem xét bài viết này.')}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <Icon name="flag" size={16} />
        <span className="hidden sm:inline">Báo cáo</span>
      </button>
    </div>
  );
};

export default PostEngagement;
