/**
 * SpecEditorModal - Modal soạn thảo chi tiết kỹ thuật sản phẩm.
 * Dùng chung cho cả inventory (ProductInfoTab) và forum (CreatePostModal).
 */
import React from 'react';

const SpecEditorModal = ({ value = '', onChange, onClose, maxLength = 500 }) => (
  <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-2xl rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Viết chi tiết sản phẩm</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
        >
          ×
        </button>
      </div>

      <div className="mt-4">
        <textarea
          maxLength={maxLength}
          className="min-h-[160px] w-full rounded-lg border border-outline-variant px-3 py-2 text-sm focus:ring-0"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <div>
            {value.length}/{maxLength} ký tự
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SpecEditorModal;
