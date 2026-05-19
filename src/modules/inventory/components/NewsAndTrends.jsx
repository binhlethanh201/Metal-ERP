import React from 'react';
import MaterialIcon from './MaterialIcon';
import { forumProducts, forumReports } from '../data/inventoryMockData';

const NewsAndTrends = () => {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-slate-500">
          TIN TỨC & XU HƯỚNG DIỄN ĐÀN
        </h4>
        <MaterialIcon name="forum" className="text-[#004785]" />
      </div>

      <div className="flex-1 space-y-6">
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Sản phẩm mới
          </p>
          <div className="space-y-3">
            {forumProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{product.name}</p>
                  <button className="cursor-pointer text-[10px] font-bold text-[#004785] hover:underline">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Báo cáo xu hướng
          </p>
          <div className="space-y-2">
            {forumReports.map((report) => (
              <div
                key={report.id}
                className={`flex items-start justify-between rounded-xl border p-3 ${
                  report.tone === 'red'
                    ? 'border-blue-100 bg-blue-50'
                    : 'border-green-100 bg-green-50'
                }`}
              >
                <div>
                  <p
                    className={`mb-1 text-xs font-bold ${report.tone === 'red' ? 'text-[#004785]' : 'text-green-800'}`}
                  >
                    {report.title}
                  </p>
                  <p className="text-[10px] text-slate-500">{report.desc}</p>
                </div>
                <span
                  className={`ml-2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                    report.tone === 'red'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {report.level}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewsAndTrends;
