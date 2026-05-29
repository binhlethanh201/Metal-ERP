/**
 * ConfirmUnsavedModal - Modal cảnh báo khi form bị thay đổi mà người dùng muốn thoát.
 * 3 nút: Hủy (giữ form) | Không (đóng, ko lưu) | Có (lưu rồi đóng)
 */
import Icon from '../../../../shared/components/Icon';

const ConfirmUnsavedModal = ({ isOpen, onCancel, onDiscard, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Icon Warning */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Icon name="warning" className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Dữ liệu đã bị thay đổi</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn có muốn cất không?</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onCancel}
          >
            Huy
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            onClick={onDiscard}
          >
            Khong
          </button>
          <button
            type="button"
            className="rounded-lg bg-[#004785] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#003566] active:scale-95"
            onClick={onSave}
          >
            Co
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUnsavedModal;
