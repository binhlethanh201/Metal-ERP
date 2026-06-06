/**
 * CommentItem - Hiển thị một bình luận + replies trong PostDetailComments.
 */
import React from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const CommentItem = ({ comment, isReply = false }) => (
  <div
    className={`relative rounded-xl border bg-white p-4 shadow-sm ${
      comment.isBest && !isReply ? 'border-2 border-[#004785]' : 'border-slate-100'
    }`}
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
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default CommentItem;
