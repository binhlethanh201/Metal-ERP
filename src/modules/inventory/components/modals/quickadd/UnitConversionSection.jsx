/**
 * UnitConversionSection - Phần Đơn vị tính + quy đổi trong popup Thêm mới Hàng hóa.
 */
import Icon from '../../../../../shared/components/Icon';

const UnitConversionSection = ({ p }) => (
  <div className="rounded-lg border border-slate-200">
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
      <h4 className="text-sm font-bold uppercase text-slate-500">Đơn vị tính</h4>
    </div>
    <div className="p-4">
      <p className="mb-4 text-[13px] text-slate-500">
        Thêm đơn vị bán hoặc nhập như chai, lốc, thùng. Đặt công thức quy đổi để tính nhanh giá và
        tồn kho.
      </p>

      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div className="min-w-[160px] flex-1 space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Tên đơn vị cơ bản</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="Ví dụ: chai"
            value={p.baseUnit.name}
            onChange={(e) => p.setBaseUnit({ ...p.baseUnit, name: e.target.value })}
          />
        </div>
        <div className="w-36 space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Giá bán</label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-right text-sm text-slate-500 cursor-not-allowed"
            value={p.formatMoney(p.baseUnit.price)}
            disabled
            readOnly
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary"
            id="direct-sale-base"
            checked={!!p.baseUnit.directSale}
            onChange={(e) => p.setBaseUnit({ ...p.baseUnit, directSale: e.target.checked })}
          />
          <label className="cursor-pointer text-sm text-slate-700" htmlFor="direct-sale-base">
            Bán trực tiếp
          </label>
        </div>
      </div>

      {p.conversionUnits.length > 0 && <div className="mb-5 border-t border-slate-200" />}

      {p.conversionUnits.length > 0 && (
        <div className="mb-5 space-y-2.5">
          <h5 className="text-sm font-semibold text-slate-700">Đơn vị quy đổi</h5>
          {p.conversionUnits.map((unit) => (
            <div
              key={unit.id}
              className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm font-medium text-slate-700">1</span>
                <span className="max-w-[32ch] truncate text-sm font-semibold text-slate-700">
                  {unit.name}
                </span>
                <span className="text-sm font-semibold text-slate-600">=</span>
                <span className="text-sm font-medium text-slate-700">
                  {p.formatMoney(unit.convertValue)}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {unit.convertFrom || p.baseUnit.name}
                </span>
              </div>
              <div className="min-w-0 flex-1" />
              <div className="min-w-[100px] flex-shrink-0 text-right">
                <span className="text-sm text-slate-600">
                  {(() => {
                    const base = Number(p.baseUnit.price) || 0;
                    const unitsByName = p.conversionUnits.reduce((acc, u) => {
                      acc[u.name] = u;
                      return acc;
                    }, {});
                    const computeM = (uName, visited = new Set()) => {
                      if (!uName || visited.has(uName)) return null;
                      if (uName === p.baseUnit.name) return 1;
                      const u = unitsByName[uName];
                      if (!u) return null;
                      visited.add(uName);
                      if (u.convertFrom === p.baseUnit.name) return u.convertValue;
                      const pm = computeM(u.convertFrom, visited);
                      return pm == null ? null : u.convertValue * pm;
                    };
                    const mult = computeM(unit.name);
                    const price = mult && base ? base * mult : unit.calculatedPrice || 0;
                    return price ? p.formatMoney(price) : '-';
                  })()}
                </span>
              </div>
              <label className="flex flex-shrink-0 items-center gap-1.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-primary"
                  checked={unit.directSale || false}
                  onChange={(e) => p.updateConversionUnit(unit.id, 'directSale', e.target.checked)}
                />
                Bán
              </label>
              <button
                type="button"
                onClick={() => p.removeConversionUnit(unit.id)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Icon name="delete" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => p.setAddConversionUnitModal(true)}
        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <Icon name="add" size={16} />
        <span>Thêm đơn vị</span>
      </button>
    </div>
  </div>
);

export default UnitConversionSection;
