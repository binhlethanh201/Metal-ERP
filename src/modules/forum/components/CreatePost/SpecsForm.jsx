/**
 * SpecsForm - Form thông số kỹ thuật (dùng cho Default + Supply).
 * Các dòng input (Tên thông số + Giá trị) + Nút thêm/xóa từng dòng.
 * Props: specRows[], onAdd, onRemove, onChange.
 */
import MaterialIconBase from '../shared/MaterialIcon';

const MaterialIcon = (props) => <MaterialIconBase opsz={24} {...props} />;

const SpecsForm = ({ specRows, onAdd, onRemove, onChange }) => (
  <div className="space-y-4">
    {specRows.map((row) => (
      <div key={row.id} className="flex items-start gap-3">
        <input
          className="w-[45%] rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
          placeholder="Tên thông số"
          value={row.name}
          onChange={(event) => onChange?.(row.id, 'name', event.target.value)}
        />
        <input
          className="flex-1 rounded-lg border border-outline-variant bg-surface-bright px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary-container"
          placeholder="Giá trị"
          value={row.value}
          onChange={(event) => onChange?.(row.id, 'value', event.target.value)}
        />
        <button
          type="button"
          onClick={() => onRemove?.(row.id)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <MaterialIcon name="close" className="text-[20px]" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center gap-2 rounded-lg border border-dashed border-outline-variant px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary"
    >
      <MaterialIcon name="add" className="text-[20px]" /> Thêm thông số
    </button>
  </div>
);

export default SpecsForm;
