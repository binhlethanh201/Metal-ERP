/**
 * ProductWarehouseTab - Tab Thông tin kho trong popup Thêm mới Hàng hóa.
 */
const ProductWarehouseTab = ({ p }) => (
  <div className="max-w-2xl space-y-4">
    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Thông tin kho</h3>
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Tồn kho tối thiểu</span>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          value={p.form.minStock || ''}
          min={0}
          onChange={(e) => p.handleChange('minStock', e.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Tồn kho tối đa</span>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          value={p.form.maxStock || ''}
          min={0}
          onChange={(e) => p.handleChange('maxStock', e.target.value)}
        />
      </label>
    </div>
  </div>
);

export default ProductWarehouseTab;
