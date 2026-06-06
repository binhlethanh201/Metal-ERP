import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const PostDetailSpecsTable = ({ specs = [], type }) => {
  const [expanded, setExpanded] = useState(false);

  if (!specs || specs.length === 0) {
    if (type === 'supply') {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            YÊU CẦU KỸ THUẬT
          </h4>
          <p className="mt-3 text-sm text-slate-500">
            Yêu cầu báo giá kèm thông số kỹ thuật chi tiết từ nhà cung cấp.
          </p>
        </div>
      );
    }
    return null;
  }

  const visible = expanded ? specs : specs.slice(0, 5);
  const hasMore = specs.length > 5;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
        THÔNG SỐ KỸ THUẬT
      </h4>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {visible.map((spec, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-1 md:grid-cols-2 ${
              idx < visible.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="bg-slate-50/50 p-4">
              <p className="text-xs font-bold text-slate-500">{spec.name}</p>
            </div>
            <div className="border-slate-100 p-4 md:border-l">
              <p className="text-sm font-medium text-slate-800">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-sm font-bold text-[#004785] hover:underline"
        >
          <Icon name={expanded ? 'keyboard_arrow_up' : 'add'} size={16} />
          {expanded ? 'Thu gọn' : `Xem thêm ${specs.length - 5} thông số khác`}
        </button>
      )}
    </div>
  );
};

export default PostDetailSpecsTable;
