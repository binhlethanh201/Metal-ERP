import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  CheckCircle,
  Trash2,
  EyeOff,
  Gavel,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_REPORTS } from '../data/mockData';

const Moderation = () => {
  const [tab, setTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter((report) => {
      const matchesTab =
        tab === 'pending' ? report.status !== 'resolved' : report.status === 'resolved';
      const matchesSearch =
        report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.target.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [tab, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-uppercase text-2xl font-black text-textAdmin">
            Kiểm duyệt Cộng đồng
          </h1>
          <p className="mt-1 text-sm text-placeholder">
            Xử lý bài đăng sai quy định và giải quyết tranh chấp giao dịch B2B
          </p>
        </div>
        <div className="flex gap-2 text-xs font-bold uppercase">
          <div className="flex items-center gap-2 rounded-admin border border-borderLight bg-white px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#CC0000]"></span>
            {MOCK_REPORTS.filter((r) => r.status === 'pending').length} Báo cáo mới
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-admin border border-borderLight bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`rounded-admin px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'pending'
                ? 'bg-admin text-white'
                : 'bg-bodyAdmin text-placeholder hover:text-textAdmin'
            }`}
          >
            Chờ xử lý
          </button>
          <button
            onClick={() => setTab('resolved')}
            className={`rounded-admin px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              tab === 'resolved'
                ? 'bg-admin text-white'
                : 'bg-bodyAdmin text-placeholder hover:text-textAdmin'
            }`}
          >
            Đã giải quyết
          </button>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder" size={16} />
          <input
            type="text"
            placeholder="Tìm theo nội dung, đối tượng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-admin border border-borderLight bg-[#FAFAFA] py-2 pl-10 pr-4 text-sm focus:border-admin focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="group rounded-admin border border-borderLight bg-white p-5 transition-all hover:border-admin"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-admin ${
                    report.type === 'dispute'
                      ? 'bg-[#CC0000]/10 text-[#CC0000]'
                      : 'bg-[#FBC02D]/10 text-[#8f4e00]'
                  }`}
                >
                  {report.type === 'dispute' ? <Gavel size={20} /> : <MessageSquare size={20} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-placeholder">
                      {report.id}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        report.type === 'dispute'
                          ? 'bg-[#CC0000] text-white'
                          : 'bg-admin text-white'
                      }`}
                    >
                      {report.type === 'dispute' ? 'Tranh chấp' : 'Bài viết'}
                    </span>
                    <span className="text-xs font-bold text-placeholder">{report.date}</span>
                  </div>

                  <h3 className="text-sm font-black text-textAdmin">{report.reason}</h3>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-placeholder">Người báo cáo:</span>
                    <span className="text-textAdmin underline">{report.reporter}</span>
                    <ArrowUpRight size={12} className="text-placeholder" />
                    <span className="ml-2 text-placeholder">Đối tượng bị báo cáo:</span>
                    <span className="font-bold text-[#CC0000]">{report.target}</span>
                  </div>

                  <div className="mt-3 max-w-3xl rounded-admin border-l-2 border-borderLight bg-bodyAdmin p-3 text-xs italic text-[#666666]">
                    "{report.content}"
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {report.status !== 'resolved' && (
                  <>
                    <button className="flex items-center justify-center gap-2 rounded-admin bg-admin px-4 py-2 text-[10px] font-bold text-white hover:bg-black">
                      <CheckCircle size={14} /> GIỮ LẠI / BỎ QUA
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-admin border border-[#CC0000] px-4 py-2 text-[10px] font-bold text-[#CC0000] hover:bg-[#CC0000]/5">
                      <EyeOff size={14} /> ẨN BÀI VIẾT
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-admin bg-[#CC0000] px-4 py-2 text-[10px] font-bold text-white hover:bg-red-800">
                      <Trash2 size={14} /> XÓA & CẢNH CÁO
                    </button>
                  </>
                )}
                {report.status === 'resolved' && (
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2D6A4F]">
                    <CheckCircle size={16} /> ĐÃ XỬ LÝ XONG
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bodyAdmin text-placeholder">
              <ShieldCheck size={32} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-placeholder">
              Hiện không có báo cáo nào cần xử lý
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
