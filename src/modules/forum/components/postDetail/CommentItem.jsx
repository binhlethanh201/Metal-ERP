/**
 * CommentItem - Hiển thị một bình luận + replies + actions.
 */
import React, { useState } from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const CommentItem = ({ comment, isReply = false, onReport }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);

  const handleLike = () => {
    if (disliked) setDisliked(false);
    if (liked) {
      setLiked(false);
      setLikes((l) => l - 1);
    } else {
      setLiked(true);
      setLikes((l) => l + 1);
    }
  };

  const handleDislike = () => {
    if (liked) {
      setLiked(false);
      setLikes((l) => l - 1);
    }
    if (disliked) setDisliked(false);
    else setDisliked(true);
  };

  return (
    <div
      className={`relative rounded-xl border bg-white p-4 shadow-sm ${comment.isBest && !isReply ? 'border-2 border-[#004785]' : 'border-slate-100'}`}
    >
      {comment.isBest && !isReply && (
        <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-[#004785] px-3 py-0.5 text-[10px] font-bold text-white">
          <Icon name="check_circle" size={12} />
          CÂU TRẢ LỜI HỮU ÍCH NHẤT
        </div>
      )}
      <div className={`flex gap-${isReply ? 3 : 4}`}>
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${liked ? 'bg-blue-100 text-[#004785]' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#004785]'}`}
            >
              <Icon name="thumb_up" size={14} />
              <span>{likes}</span>
            </button>

            <button
              type="button"
              onClick={handleDislike}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${disliked ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
            >
              <Icon name="thumb_down" size={14} />
            </button>

            <button type="button" className="text-xs font-bold text-[#004785] hover:underline">
              Trả lời
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onReport?.('bình luận')}
                className="rounded-lg p-1.5 text-xs text-slate-400 transition-colors hover:text-red-500"
                title="Báo cáo"
              >
                <Icon name="flag" size={14} />
              </button>
            </div>
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-slate-100 pl-6">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply onReport={onReport} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
