/**
 * PostCard Component - Thẻ bài viết
 */

import { Badge } from '../../../shared/components/Badge';
import { formatDate } from '../../../shared/utils/formatDate';

export const PostCard = ({ post, onLike, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600">
            {post.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm">
              {post.category}
            </Badge>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-600">{formatDate(post.date)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 line-clamp-2 text-sm text-gray-700">{post.content}</p>

      {/* Author */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {post.author[0]}
        </div>
        <span className="text-sm font-medium text-gray-900">{post.author}</span>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <div className="flex gap-4 text-xs text-gray-600">
          <span>👁️ {post.views}</span>
          <span>💬 {post.comments}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className={`flex items-center gap-1 rounded-lg px-3 py-1 transition-colors ${
            post.liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>❤️</span>
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
