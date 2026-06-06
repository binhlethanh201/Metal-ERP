/**
 * ForumTopProductsRightSidebar - Sidebar phải cho trang Top sản phẩm bán chạy.
 */
import React, { useState } from 'react';
import Icon from '../../../../shared/components/Icon';

const suggestedProducts = [
  {
    name: 'Máy hàn điện tử Hồng Ký 200A',
    price: '2.450.000đ',
    area: 'TP.HCM',
    growth: '+22%',
    pct: 22,
    demand: 48,
    season: 32,
    priceShare: 20,
    market: '95 shop quan tâm',
  },
  {
    name: 'Que hàn Kim Tín 2.5mm',
    price: '85.000đ/kg',
    area: 'Hà Nội',
    growth: '+18%',
    pct: 18,
    demand: 42,
    season: 38,
    priceShare: 20,
    market: '72 shop quan tâm',
  },
  {
    name: 'Thép hộp Hòa Phát 30x60',
    price: '180.000đ/cây',
    area: 'Toàn quốc',
    growth: '+15%',
    pct: 15,
    demand: 38,
    season: 35,
    priceShare: 27,
    market: '110 shop quan tâm',
  },
];

const getAccent = (pct) => {
  if (pct >= 50)
    return {
      bar: 'bg-red-500',
      barM: 'bg-red-500/60',
      barL: 'bg-red-500/30',
      text: 'text-red-600',
      label: 'Bùng nổ',
    };
  if (pct >= 35)
    return {
      bar: 'bg-[#004785]',
      barM: 'bg-[#004785]/60',
      barL: 'bg-[#004785]/30',
      text: 'text-[#004785]',
      label: 'Tăng mạnh',
    };
  if (pct >= 25)
    return {
      bar: 'bg-orange-500',
      barM: 'bg-orange-500/60',
      barL: 'bg-orange-500/30',
      text: 'text-orange-600',
      label: 'Tăng khá',
    };
  return {
    bar: 'bg-emerald-500',
    barM: 'bg-emerald-500/60',
    barL: 'bg-emerald-500/30',
    text: 'text-emerald-600',
    label: 'Ổn định',
  };
};

const ForumTopProductsRightSidebar = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      {/* Sản phẩm gợi ý theo khu vực */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="location_on" size={18} className="text-[#004785]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Gợi ý cho khu vực của bạn
          </h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Dựa trên vị trí <span className="font-bold text-slate-700">TP.HCM</span> của bạn
        </p>
        <div className="space-y-3">
          {suggestedProducts.map((item, i) => (
            <div
              key={i}
              onClick={() => setSelected(item)}
              className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-[#004785] hover:bg-blue-50/30"
            >
              <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-[#004785]">{item.price}</span>
                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  {item.growth}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{item.area}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lưu ý */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
        <div className="mb-3 flex items-center gap-2 text-amber-700">
          <Icon name="warning" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest">Lưu ý</h3>
        </div>
        <ul className="space-y-2 text-xs leading-relaxed text-amber-800">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Dữ liệu tăng trưởng được cập nhật mỗi 24h từ hệ thống POS.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Giá hiển thị là giá tham khảo, có thể thay đổi theo thời điểm.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Nên kiểm tra tồn kho thực tế trước khi quyết định nhập hàng.
          </li>
        </ul>
      </div>

      {/* Mẹo - Cách đọc chỉ số */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
        <div className="mb-3 flex items-center gap-2 text-[#004785]">
          <Icon name="lightbulb" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest">Mẹo - Cách đọc chỉ số</h3>
        </div>
        <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
            <b>% Tăng trưởng:</b> So với kỳ trước. Đỏ: bùng nổ, Xanh: tăng mạnh, Cam: tăng khá, Lục:
            ổn định.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
            <b>Nhu cầu:</b> Càng cao → càng nhiều shop nhập hàng.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
            <b>Mùa vụ:</b> Cao = đang vào mùa cao điểm.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#004785]" />
            <b>Giá:</b> Cao = giá đang biến động mạnh.
          </li>
        </ul>
      </div>

      {/* Product detail popup */}
      {selected &&
        (() => {
          const c = getAccent(selected.pct);
          const color =
            selected.pct >= 50
              ? '#dc2626'
              : selected.pct >= 35
                ? '#004785'
                : selected.pct >= 25
                  ? '#ea580c'
                  : '#059669';
          return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h3 className="text-base font-bold text-slate-900">{selected.name}</h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black" style={{ color }}>
                      {selected.growth}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${selected.pct >= 50 ? 'bg-red-50 text-red-700' : selected.pct >= 35 ? 'bg-blue-50 text-[#004785]' : selected.pct >= 25 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      {c.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Giá tham khảo:{' '}
                    <span className="font-bold text-[#004785]">{selected.price}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Khu vực: {selected.area} • {selected.market}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Nhu cầu {selected.demand}%</span>
                      <span>Mùa vụ {selected.season}%</span>
                      <span>Giá {selected.priceShare}%</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${c.bar}`} style={{ width: `${selected.demand}%` }} />
                      <div
                        className={`h-full ${c.barM}`}
                        style={{ width: `${selected.season}%` }}
                      />
                      <div
                        className={`h-full ${c.barL}`}
                        style={{ width: `${selected.priceShare}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full rounded-xl bg-[#004785] py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default ForumTopProductsRightSidebar;
