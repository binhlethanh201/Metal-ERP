/**
 * PostDetailEditBar - Thanh công cụ sửa bài viết trên trang PostDetail.
 */
import React from 'react';
import Icon from '../../../../shared/components/Icon';

const PostDetailEditBar = ({ onSave, onCancel, saving }) => (
  <div className="sticky top-[84px] z-40 -mx-2 mb-2 rounded-2xl border-2 border-[#004785] bg-white px-6 py-3 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Icon name="edit" size={20} className="text-[#004785]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#004785]">Chế độ chỉnh sửa</p>
          <p className="text-xs text-slate-500">
            Bạn đang sửa trực tiếp bài viết này. Nhấn Lưu để áp dụng thay đổi.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-[#004785] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-black disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  </div>
);

export default PostDetailEditBar;
