import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
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
    <div className="space-y-4">
      {/* HEADER KHỐI TÁC VỤ */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5">
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            Kiểm duyệt Nội dung &amp; Tranh chấp B2B
          </h1>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-tight text-slate-500">
            Xử lý báo cáo vi phạm quy chuẩn diễn đàn và bạn hàng đại lý
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-3 py-1.5 font-mono text-xs font-bold text-[#9A1616] shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#9A1616]" />
          {MOCK_REPORTS.filter((r) => r.status === 'pending').length} LOGS PENDING
        </div>
      </div>

      {/* THANH BỘ LỌC ĐANH THÉP CHUẨN ERP TAB BOX */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-slate-300 bg-white p-2 shadow-sm">
        <div className="flex min-w-[240px] items-center gap-0.5 rounded-[2px] border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`flex-1 rounded-[2px] py-1.5 text-center text-xs font-bold transition-all ${tab === 'pending' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Chờ xử lý
          </button>
          <button
            type="button"
            onClick={() => setTab('resolved')}
            className={`flex-1 rounded-[2px] py-1.5 text-center text-xs font-bold transition-all ${tab === 'resolved' ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đã giải quyết
          </button>
        </div>

        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={13} />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo lý do, đích danh shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[4px] border border-slate-300 bg-slate-50 px-3 py-1.5 pl-9 text-xs font-semibold outline-none focus:border-slate-500 focus:bg-white"
          />
        </div>
      </div>

      {/* LUỒNG BÀI VIẾT BỊ BÁO CÁO */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-[4px] border border-slate-300 bg-white p-4 shadow-sm transition-all hover:border-slate-400"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex items-start gap-3.5">
                {/* Icon phân biệt loại vi phạm cơ khí */}
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border ${report.type === 'dispute' ? 'border-red-200 bg-red-50 text-[#9A1616]' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
                >
                  <Icon name={report.type === 'dispute' ? 'gavel' : 'message_square'} size={15} />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="font-bold text-slate-400">{report.id}</span>
                    <span
                      className={`rounded-[2px] border px-1.5 py-0.5 text-[10px] font-bold uppercase ${report.type === 'dispute' ? 'border-red-200 bg-red-50 text-[#9A1616]' : 'border-slate-300 bg-slate-100 text-slate-700'}`}
                    >
                      {report.type === 'dispute' ? 'Tranh chấp hợp đồng' : 'Bài viết cộng đồng'}
                    </span>
                    <span className="font-medium text-slate-400">{report.date}</span>
                  </div>

                  <h4 className="pt-0.5 text-sm font-bold leading-tight text-slate-900">
                    {report.reason}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-semibold text-slate-500">
                    <span>Đơn vị báo:</span>
                    <span className="font-mono font-bold text-slate-800 underline">
                      {report.reporter}
                    </span>
                    <span className="text-slate-300">
                      <Icon name="arrow_up_right" size={10} />
                    </span>
                    <span className="ml-1">Bị tố cáo:</span>
                    <span className="rounded-[2px] border border-red-100 bg-red-50/60 px-1.5 py-0.5 font-mono font-black text-[#9A1616]">
                      {report.target}
                    </span>
                  </div>

                  {/* Chuỗi nội dung trích dẫn văn bản */}
                  <div className="mt-2.5 max-w-4xl rounded-[2px] border-l-2 border-slate-300 bg-slate-50 p-2.5 font-mono text-xs leading-relaxed text-slate-600">
                    "{report.content}"
                  </div>
                </div>
              </div>

              {/* KHỐI ACTION CONTROL TRỰC DIỆN GÓC PHẢI */}
              <div className="flex shrink-0 flex-row justify-end gap-1.5 border-t border-slate-100 pt-2 md:flex-col md:border-t-0 md:pt-0">
                {report.status !== 'resolved' ? (
                  <>
                    <button
                      type="button"
                      className="rounded-[4px] border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      BỎ QUA LOG
                    </button>
                    <button
                      type="button"
                      className="rounded-[4px] border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-[#9A1616] transition-all hover:bg-red-50"
                    >
                      ẨN NỘI DUNG
                    </button>
                    <button
                      type="button"
                      className="rounded-[4px] bg-[#9A1616] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black"
                    >
                      XÓA &amp; BAN LOCK
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-[2px] border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-700">
                    <Icon name="check_circle" size={13} /> TERMINATED_OK
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="rounded-[4px] border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-[4px] border border-slate-200 bg-slate-50 text-slate-400">
              <span className="text-emerald-600">
                <Icon name="shield_check" size={18} />
              </span>
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
              Không tồn đọng bản ghi vi phạm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
