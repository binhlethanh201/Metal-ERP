/**
 * TechSpecsSection - Section 4: Thông số kỹ thuật (dùng cho supply/trusted).
 */
import React from 'react';
import { Settings, Plus, X } from 'lucide-react';
import Toggle from '../../../../shared/components/Toggle';
import ProductNavBar from './ProductNavBar';
import ProductImageField from './ProductImageField';

const TechSpecsSection = ({ form, quoteProduct }) => {
  const currentProduct = form.supplyProducts[form.currentProductIndex];
  if (!form.showTrustedSpecs || !currentProduct) return null;

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) =>
      form.setSupplyProducts((prev) => {
        const u = [...prev];
        u[form.currentProductIndex].image = ev.target.result;
        return u;
      });
    r.readAsDataURL(f);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="text-[#004785]" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#004785]">
            {form.isTrustedPost
              ? '4. Thông tin & Thông số kỹ thuật sản phẩm'
              : '4. Thông số kỹ thuật sản phẩm'}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Hiển thị thông tin</span>
          <Toggle checked={form.showTrustedSpecs} onChange={form.setShowTrustedSpecs} />
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <ProductNavBar
          currentIndex={form.currentProductIndex}
          total={form.supplyProducts.length}
          onPrev={form.handleSupplyPrevProduct}
          onNext={form.handleSupplyNextProduct}
          onAdd={form.handleSupplyAddProduct}
          onRemove={form.handleSupplyRemoveProduct}
        />

        <div className="flex flex-col items-start gap-4 md:flex-row">
          <div className="w-full md:w-auto md:flex-shrink-0">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Ảnh SP
            </label>
            <ProductImageField
              image={currentProduct.image}
              defaultImage={quoteProduct.image}
              onRemove={() =>
                form.setSupplyProducts((prev) => {
                  const u = [...prev];
                  u[form.currentProductIndex].image = quoteProduct.image;
                  return u;
                })
              }
              onUpload={handleImageUpload}
            />
          </div>
          <div className="w-full flex-1 space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Tiêu đề sản phẩm
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#004785] focus:bg-white"
              placeholder="Ví dụ: Máy khoan bê tông chuyên dụng đời mới"
              type="text"
              value={currentProduct.title}
              onChange={(e) => form.handleSupplyProductChange('title', e.target.value)}
            />
            <p className="text-[11px] font-medium text-slate-400">
              Tên sản phẩm cụ thể giúp khách hàng đại lý dễ dàng tra cứu thông số kỹ thuật.
            </p>
          </div>
        </div>

        {form.isTrustedPost && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PriceInput
              label="Giá sỉ (VNĐ)"
              value={form.productWholesalePrice}
              onChange={form.setProductWholesalePrice}
              tone="primary"
            />
            <PriceInput
              label="Giá lẻ (VNĐ)"
              value={form.productRetailPrice}
              onChange={form.setProductRetailPrice}
            />
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">
              <span>Tên thông số kỹ thuật</span>
            </div>
            <div className="col-span-6">
              <span>Giá trị / Nội dung chi tiết</span>
            </div>
            <div className="col-span-1" />
          </div>
          <div className="space-y-2">
            {currentProduct.specs.map((spec) => (
              <div key={spec.id} className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-5">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                    placeholder="Ví dụ: Công suất máy"
                    type="text"
                    value={spec.name}
                    onChange={(e) => form.handleSupplySpecChange(spec.id, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-6">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-semibold outline-none focus:border-[#004785] focus:bg-white"
                    placeholder="Ví dụ: 750W hành trình liên tục"
                    type="text"
                    value={spec.value}
                    onChange={(e) => form.handleSupplySpecChange(spec.id, 'value', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => form.handleSupplyRemoveSpec(spec.id)}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={form.handleSupplyAddSpec}
            className="mt-1 flex items-center gap-1.5 p-1 text-xs font-bold text-[#004785] hover:underline"
          >
            <Plus size={14} />
            <span>Thêm thông số kỹ thuật khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PriceInput = ({ label, value, onChange, tone }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <input
      className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold ${tone === 'primary' ? 'text-[#004785]' : 'text-slate-700'}`}
      placeholder={tone === 'primary' ? 'Thỏa thuận sỉ' : 'Liên hệ'}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default TechSpecsSection;
