/**
 * MyPostListItem - Item bài viết trong trang "Bài viết của tôi" kèm CRUD actions.
 */
import React from 'react';
import Avatar from '../shared/Avatar';
import Icon from '../../../../shared/components/Icon';

const MyPostListItem = ({ post, onClick, onEdit, onToggleVisibility, onDelete }) => (
  <article className="group cursor-pointer border-b border-gray-100 bg-white p-5 transition-all last:border-b-0 hover:bg-gray-50/50">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Avatar src={post.avatar} name={post.author} size="md" />
        <span className="text-sm font-bold text-gray-900">{post.author}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.roleClass}`}
        >
          {post.role}
        </span>
        <span className="text-xs text-slate-400">• {post.time}</span>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${post.statusClass}`}>
        {post.status}
      </span>
    </div>

    <div onClick={onClick}>
      <h3 className="mb-1.5 text-xl font-bold text-gray-900 hover:text-[#004785]">{post.title}</h3>
      <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-gray-600">
        {post.description}
      </p>
    </div>

    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {/* Stats */}
        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400">
          <Icon name="chat_bubble" size={14} /> {post.comments}
        </span>
        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400">
          <Icon name="visibility" size={14} /> {post.views}
        </span>

        <span className="mx-1 h-4 w-px bg-slate-200" />

        {/* CRUD Actions */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(post);
          }}
          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#004785] transition-colors hover:bg-blue-100 hover:text-blue-900"
          title="Chỉnh sửa"
        >
          <Icon name="edit" size={14} />
          <span className="hidden sm:inline">Sửa</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility?.(post);
          }}
          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            post.tab === 'Đã ẩn'
              ? 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800'
              : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-800'
          }`}
          title={post.tab === 'Đã ẩn' ? 'Hiển thị lại' : 'Ẩn bài viết'}
        >
          <Icon name={post.tab === 'Đã ẩn' ? 'visibility' : 'visibility_off'} size={14} />
          <span className="hidden sm:inline">{post.tab === 'Đã ẩn' ? 'Hiện' : 'Ẩn'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(post);
          }}
          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
          title="Xóa"
        >
          <Icon name="delete" size={14} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  </article>
);

export default MyPostListItem;
