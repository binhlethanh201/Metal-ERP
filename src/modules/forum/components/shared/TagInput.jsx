/**
 * TagInput - Ô nhập và hiển thị thẻ (tags) cho bài đăng.
 */
import React from 'react';
import { X } from 'lucide-react';

const TagInput = ({ tags = [], onAdd, onRemove, maxTags = 5 }) => {
  const [newTag, setNewTag] = React.useState('');

  const handleAdd = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const normalized = newTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (!normalized || tags.includes(normalized) || tags.length >= maxTags) return;
    onAdd?.(normalized);
    setNewTag('');
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700">Gắn thẻ bài viết (Tags)</label>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemove?.(tag)}
              className="text-blue-400 transition-colors hover:text-blue-800"
              aria-label={`Xóa thẻ ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm font-semibold outline-none focus:ring-0"
          placeholder="Thêm thẻ mới..."
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAdd}
        />
      </div>
      <p className="text-[11px] font-medium text-slate-400">
        Nhập thẻ và nhấn Enter để thêm (Tối đa {maxTags} thẻ)
      </p>
    </div>
  );
};

export default TagInput;
