/**
 * CommentBox - Hộp bình luận.
 * Textarea nhập bình luận + Danh sách bình luận kèm author, date, nút like.
 */
/**
 * CommentBox Component - Hộp bình luận
 */

import { useState } from 'react';
import { Button } from '../../../../shared/components/Button';
import { formatDate } from '../../../../shared/utils/formatDate';

export const CommentBox = ({ comments = [], onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await onAddComment?.(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-900">Bình luận ({comments.length})</h3>

      {/* Comment Input */}
      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 focus:border-[#004785] focus:outline-none"
          rows="3"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!commentText.trim() || loading}
            loading={loading}
            variant="primary"
            size="sm"
          >
            Gửi bình luận
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-start justify-between">
              <h4 className="font-bold text-slate-900">{comment.author}</h4>
              <span className="text-xs text-slate-500">{formatDate(comment.date)}</span>
            </div>
            <p className="mb-3 text-sm text-slate-600">{comment.content}</p>
            <button className="text-sm text-[#004785] hover:underline">❤️ {comment.likes}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
