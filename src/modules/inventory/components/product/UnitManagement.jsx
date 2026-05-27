/** Quản lý đơn vị tính + quy đổi - Base unit, conversion units, giá tự tính theo công thức. */
import Icon from '../../../../shared/components/Icon';
const UnitManagement = ({ f }) => (
  <div className="mb-8">
    <h4 className="text-label-md mb-1 font-bold text-on-surface">Đơn vị tính</h4>
    <p className="text-body-md mb-6 leading-relaxed text-on-surface-variant">
      Thêm đơn vị bán hoặc nhập như chai, lốc, thùng. Đặt công thức quy đổi để tính nhanh giá và tồn
      kho. Ví dụ: 1 lốc = 4 chai, 1 thùng = 20 lốc.
    </p>

    <div className="mb-6 flex flex-wrap items-end gap-5">
      <div className="min-w-[200px] flex-1 space-y-2">
        <label className="text-label-md text-on-surface-variant">Tên đơn vị cơ bản</label>
        <input
          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 focus:ring-0"
          placeholder="Ví dụ: chai"
          type="text"
          value={f.form.baseUnit?.name || ''}
          onChange={(e) =>
            f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), name: e.target.value })
          }
        />
      </div>
      <div className="w-40 space-y-2">
        <label className="text-label-md text-on-surface-variant">Giá bán</label>
        <input
          className="text-body-md w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-right focus:ring-0"
          type="text"
          value={f.formatMoney(f.form.baseUnit?.price || 0)}
          onChange={(e) =>
            f.handleChange('baseUnit', {
              ...(f.form.baseUnit || {}),
              price: Number(e.target.value.replaceAll(',', '')) || 0,
            })
          }
        />
      </div>
      <div className="flex items-center space-x-2 pb-2.5">
        <input
          checked={!!f.form.baseUnit?.directSale}
          className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8] focus:ring-[#1E6BB8]"
          id="direct-sell-main"
          type="checkbox"
          onChange={(e) =>
            f.handleChange('baseUnit', { ...(f.form.baseUnit || {}), directSale: e.target.checked })
          }
        />
        <label className="cursor-pointer text-[15px] leading-[1.35]" htmlFor="direct-sell-main">
          Bán trực tiếp
        </label>
      </div>
    </div>

    {(f.form.conversionUnits || []).length > 0 && <div className="mb-6 border-t border-gray-200" />}

    {(f.form.conversionUnits || []).length > 0 && (
      <div className="mb-6 space-y-3">
        <h5 className="text-[14px] font-semibold text-gray-700">Đơn vị quy đổi</h5>
        {(f.form.conversionUnits || []).map((unit) => (
          <div
            key={unit.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-medium text-gray-700">1</span>
              <span className="text-[14px] font-semibold text-gray-700">{unit.name}</span>
              <span className="text-[16px] font-semibold text-gray-600">=</span>
              <span className="text-[14px] font-medium text-gray-700">{unit.convertValue}</span>
              <span className="text-[14px] font-semibold text-gray-700">{unit.convertFrom}</span>
            </div>
            <div className="min-w-[20px] flex-1" />
            <div className="min-w-[100px] text-right">
              <span className="text-[14px] text-gray-600">
                {(() => {
                  const base = Number(f.form.baseUnit?.price) || 0;
                  const unitsByName = (f.form.conversionUnits || []).reduce((acc, u) => {
                    acc[u.name] = u;
                    return acc;
                  }, {});
                  const computeMultiplierForUnit = (uName, visited = new Set()) => {
                    if (!uName || visited.has(uName)) return null;
                    if (uName === f.form.baseUnit?.name) return 1;
                    const uu = unitsByName[uName];
                    if (!uu) return null;
                    visited.add(uName);
                    if (uu.convertFrom === f.form.baseUnit?.name) return uu.convertValue;
                    const pm = computeMultiplierForUnit(uu.convertFrom, visited);
                    return pm == null ? null : uu.convertValue * pm;
                  };
                  const mult = computeMultiplierForUnit(unit.name);
                  const price = mult && base ? base * mult : unit.calculatedPrice || 0;
                  return price ? f.formatMoney(price) : '-';
                })()}
              </span>
            </div>
            <div className="flex flex-none items-center space-x-2">
              <input
                type="checkbox"
                checked={unit.directSale || false}
                onChange={(e) => f.updateConversionUnit(unit.id, 'directSale', e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-[#1E6BB8]"
              />
              <span className="text-[14px] text-gray-600">Bán</span>
            </div>
            <button
              type="button"
              onClick={() => f.removeConversionUnit(unit.id)}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        ))}
      </div>
    )}

    <button
      type="button"
      onClick={() => f.setAddConversionUnitModal(true)}
      className="text-body-md flex items-center font-semibold text-[#1E6BB8] hover:underline"
    >
      <Icon name="add" size={18} />
      <span>Thêm đơn vị</span>
    </button>
  </div>
);

export default UnitManagement;
