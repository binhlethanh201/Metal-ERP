import React from 'react';
import Icon from '../../../shared/components/Icon';
import { MOCK_CATEGORIES, MOCK_BROADCASTS } from '../data/mockData';

const MasterData = () => {
  return (
    <div className="space-y-4">
      {/* BANNER HEADER TIÊU ĐỀ */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5">
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            Cấu hình Hệ thống &amp; Đồng bộ Dữ liệu Lõi
          </h1>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-tight text-slate-500">
            Chuẩn hóa từ điển mã vật tư cho AI OCR và kiểm soát trung tâm thông báo
          </p>
        </div>
      </div>

      {/* LƯỚI HAI CỘT PHẲNG CÂN ĐỐI KỸ THUẬT */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* CỘT TRÁI: CÂY DANH MỤC MASTER VẬT TƯ */}
        <div className="overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">
                <Icon name="database" size={14} />
              </span>
              <h3 className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">
                Cây danh mục chuẩn hóa hệ thống
              </h3>
            </div>
            <button className="flex items-center gap-1 rounded-[2px] bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:bg-slate-800">
              <Icon name="plus" size={12} /> THÊM NHÓM HÀNG
            </button>
          </div>

          <div className="space-y-2 p-4">
            {MOCK_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center justify-between rounded-[2px] border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs font-bold text-slate-400">{cat.id}</div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-800">
                      {cat.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-semibold text-slate-400">
                      {cat.items} Model SKUs chuẩn • Đồng bộ log: {cat.lastUpdate}
                    </div>
                  </div>
                </div>
                {/* Thanh action nút bấm tinh gọn */}
                <div className="flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded-[2px] border border-slate-200 bg-white p-1 text-slate-500 hover:text-slate-900"
                  >
                    <Icon name="edit_2" size={12} />
                  </button>
                  <button
                    type="button"
                    className="rounded-[2px] border border-red-200 bg-white p-1 text-slate-400 hover:bg-red-50 hover:text-[#9A1616]"
                  >
                    <Icon name="trash_2" size={12} />
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-2.5 flex items-start gap-2 rounded-[2px] border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              <span className="mt-0.5 text-slate-400">
                <Icon name="alert_triangle" size={13} />
              </span>
              <p className="font-mono italic leading-relaxed">
                * Note: Cấu trúc từ điển vật tư này liên kết cứng trực tiếp vào Model AI OCR Engine
                nhằm phục vụ bóc tách hóa đơn hóa đơn bán sỉ đầu vào.
              </p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TRUNG TÂM PHÁT TIN THÔNG BÁO PUSH LOG */}
        <div className="overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[#9A1616]">
                <Icon name="megaphone" size={14} />
              </span>
              <h3 className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">
                Điều phối thông báo toàn hệ thống
              </h3>
            </div>
            <button className="flex items-center gap-1 rounded-[2px] bg-[#9A1616] px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:bg-red-800">
              <Icon name="send" size={11} /> PHÁT TIN KHẨN
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div className="space-y-3.5">
              {MOCK_BROADCASTS.map((bc) => (
                <div
                  key={bc.id}
                  className="relative border-l-2 border-slate-300 pl-4 transition-colors hover:border-slate-500"
                >
                  <div className="absolute -left-[4px] top-1.5 h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <div className="mb-0.5 flex items-center gap-2 font-mono">
                    <span
                      className={`rounded-[2px] border px-1.5 py-0.5 text-[9px] font-bold uppercase ${bc.status === 'scheduled' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-300 bg-slate-100 text-slate-600'}`}
                    >
                      {bc.status === 'scheduled' ? 'Đã lên lịch' : 'Đã đẩy tin'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{bc.time}</span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug text-slate-800">{bc.title}</h4>
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-400">
                    <Icon name="globe" size={11} /> Nodes target: {bc.target}
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK BROADCAST TERMINAL - BOX SOẠN KHẨN CẤP CHUẨN XÁM ĐÁ PHIẾN */}
            <div className="border-t border-slate-200 pt-3.5">
              <div className="rounded-[4px] border border-slate-300 bg-slate-50 p-4">
                <h4 className="mb-2 flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wide text-slate-700">
                  <Icon name="megaphone" size={13} /> SOẠN BẢN TIN NHANH (QUICK NODE BROADCAST)
                </h4>
                <textarea
                  className="w-full rounded-[2px] border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-500"
                  placeholder="Nhập chuỗi nội dung thông báo phát tức thời tới tất cả màn hình phân hệ POS đại lý..."
                  rows="2"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="rounded-[2px] bg-[#0F172A] px-4 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
                  >
                    PHÁT TIN NGAY
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterData;
