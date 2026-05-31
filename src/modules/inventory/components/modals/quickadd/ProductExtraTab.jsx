/**
 * ProductExtraTab - Tab Thông tin bổ sung trong popup Thêm mới Hàng hóa.
 */
import Icon from '../../../../../shared/components/Icon';

const ProductExtraTab = ({ p }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-6">
      {/* Cột trái - Thông tin kỹ thuật */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Thông tin kỹ thuật
        </h3>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Trọng lượng</label>
          <div className="flex items-center overflow-hidden rounded-[8px] border border-slate-300 bg-white">
            <input
              type="text"
              className="flex-1 border-none bg-transparent px-3 py-2 text-right text-[15px] font-semibold leading-[1.35] focus:ring-0"
              value={p.form.weight || ''}
              onChange={(e) => p.handleChange('weight', e.target.value)}
              placeholder="0"
            />
            <select
              className="cursor-pointer border-l border-slate-300 bg-slate-50 px-2 py-2 text-sm font-bold text-primary focus:ring-0"
              value={p.form.weightUnit || 'g'}
              onChange={(e) => p.handleChange('weightUnit', e.target.value)}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Kích thước</label>
          <div className="max-w-lg">
            <div className="inline-flex w-full items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white">
              <input
                type="text"
                placeholder="Rộng"
                value={p.form.width || ''}
                onChange={(e) => p.handleChange('width', e.target.value)}
                className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Dài"
                value={p.form.length || ''}
                onChange={(e) => p.handleChange('length', e.target.value)}
                className="w-1/3 border-r border-[#e5e7eb] bg-white px-3 py-2 text-center text-[15px] placeholder-slate-400 focus:outline-none"
              />
              <div className="relative w-1/3">
                <select
                  value={p.form.sizeUnit || ''}
                  onChange={(e) => p.handleChange('sizeUnit', e.target.value)}
                  className="w-full appearance-none bg-white px-3 py-2 text-left text-[15px] focus:outline-none"
                >
                  <option value="">mm</option>
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="expand_more" size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải - Vị trí */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Vị trí</h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Vị trí lưu trữ trong kho</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
            value={p.form.newLocationName || ''}
            onChange={(e) => p.handleChange('newLocationName', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                p.addLocation();
              }
            }}
            placeholder="Nhập vị trí, Enter để thêm..."
          />
          <div className="relative flex min-h-[44px] w-full flex-wrap items-center gap-2 rounded-[8px] border border-slate-300 bg-slate-50 px-3 py-2.5">
            {(p.form.locations || []).length === 0 ? (
              <span className="text-sm text-slate-400">Chưa có vị trí nào</span>
            ) : (
              (p.form.locations || []).map((loc) => (
                <div
                  key={loc}
                  className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-800"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => p.removeLocation(loc)}
                    className="font-bold text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Mô tả - full width */}
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Mô tả sản phẩm</h3>
      <textarea
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
        rows={5}
        value={p.form.description}
        onChange={(e) => p.handleChange('description', e.target.value)}
        placeholder="Nhập mô tả chi tiết sản phẩm..."
      />
    </div>
  </div>
);

export default ProductExtraTab;
