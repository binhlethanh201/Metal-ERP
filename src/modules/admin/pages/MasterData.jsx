import React from 'react';
import { Database, Megaphone, Plus, Edit2, Trash2, Send, Globe } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_BROADCASTS } from '../data/mockData';

const MasterData = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase text-textAdmin">
            Quản lý Dữ liệu Lõi & Vận hành
          </h1>
          <p className="mt-1 text-sm text-placeholder">
            Chuẩn hóa danh mục cho AI OCR và điều phối thông báo toàn hệ thống
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-admin border border-borderLight bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-borderLight bg-[#FAFAFA] px-6 py-4">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-admin" />
              <h2 className="text-sm font-black uppercase tracking-widest text-textAdmin">
                Cây danh mục chuẩn
              </h2>
            </div>
            <button className="flex items-center gap-1 rounded-admin bg-admin px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-black">
              <Plus size={14} /> THÊM NHÓM MỚI
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-2">
              {MOCK_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between rounded-admin border border-borderLight p-3 transition-all hover:border-admin"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-placeholder">{cat.id}</div>
                    <div>
                      <div className="text-sm font-bold text-textAdmin">{cat.name}</div>
                      <div className="text-[10px] font-semibold text-placeholder">
                        {cat.items} mã hàng chuẩn • Cập nhật: {cat.lastUpdate}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded p-1.5 text-placeholder hover:bg-bodyAdmin hover:text-admin">
                      <Edit2 size={14} />
                    </button>
                    <button className="rounded p-1.5 text-placeholder hover:bg-error-container hover:text-error">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-admin bg-bodyAdmin p-3 text-[11px] italic text-placeholder">
              * Lưu ý: Danh mục này được đồng bộ trực tiếp với Model AI OCR để tự động phân loại hóa
              đơn đầu vào cho khách hàng.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-admin border border-borderLight bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-borderLight bg-[#FAFAFA] px-6 py-4">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-[#CC0000]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-textAdmin">
                Thông báo toàn hệ thống
              </h2>
            </div>
            <button className="flex items-center gap-1 rounded-admin bg-[#CC0000] px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-red-800">
              <Send size={14} /> TẠO TIN MỚI
            </button>
          </div>

          <div className="space-y-6 p-6">
            {MOCK_BROADCASTS.map((bc) => (
              <div
                key={bc.id}
                className="relative border-l-2 border-borderLight pl-6 transition-colors hover:border-admin"
              >
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white bg-admin"></div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      bc.status === 'scheduled'
                        ? 'bg-[#FBC02D]/20 text-[#8f4e00]'
                        : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                    }`}
                  >
                    {bc.status === 'scheduled' ? 'Đã lên lịch' : 'Đã gửi'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-placeholder">
                    {bc.time}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-textAdmin">{bc.title}</h4>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-placeholder">
                  <Globe size={12} /> Đối tượng: {bc.target}
                </div>
              </div>
            ))}

            <div className="mt-4 border-t border-borderLight pt-4">
              <div className="rounded-admin bg-admin p-4 text-white">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-black uppercase">
                  <Megaphone size={14} /> Soạn tin nhanh (Quick Broadcast)
                </h4>
                <textarea
                  className="w-full rounded border border-white/20 bg-white/10 px-3 py-2 text-xs placeholder:text-white/40 focus:bg-white/20 focus:outline-none"
                  placeholder="Nhập nội dung thông báo khẩn cấp..."
                  rows="2"
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button className="rounded-admin bg-white px-4 py-1.5 text-[10px] font-black uppercase text-admin hover:bg-gray-200">
                    Gửi ngay
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
