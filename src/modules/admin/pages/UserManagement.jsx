import React, { useState, useMemo } from 'react';
import Icon from '../../../shared/components/Icon';
import { MOCK_TENANTS } from '../data/mockData';

const UserManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants] = useState(MOCK_TENANTS);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
      const matchesSearch =
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tenants, filterStatus, searchTerm]);

  return (
    <div className="space-y-4">
      {/* HEADER TRANG */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2.5">
        <div>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            Duyệt cấp phát &amp; Kiểm soát phân hệ Tenant
          </h1>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-tight text-slate-500">
            Xác minh tư cách pháp nhân đại lý và xử lý cấu hình khóa lõi
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            EXPORT DATA (CSV)
          </button>
          <button
            type="button"
            className="rounded-[4px] bg-[#0F172A] px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-slate-800"
          >
            + THÊM NEW TENANT NODE
          </button>
        </div>
      </div>

      {/* THANH TAB LỌC KỸ THUẬT BOX CHUẨN */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-slate-300 bg-white p-2 shadow-sm">
        <div className="no-scrollbar flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[2px] border border-slate-200 bg-slate-100 p-0.5">
          {[
            { id: 'all', label: 'Tất cả Tenants' },
            { id: 'pending', label: 'Yêu cầu chờ duyệt' },
            { id: 'active', label: 'Node đang hoạt động' },
            { id: 'suspended', label: 'Hệ thống đã khóa' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`whitespace-nowrap rounded-[2px] px-3.5 py-1.5 text-xs font-bold transition-all ${filterStatus === tab.id ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" size={13} />
          </span>
          <input
            type="text"
            placeholder="Tra cứu chính xác tên shop, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[4px] border border-slate-300 bg-slate-50 px-3 py-1.5 pl-9 pr-4 text-xs font-semibold outline-none focus:border-slate-500 focus:bg-white"
          />
        </div>
      </div>

      {/* BẢNG SỐ LIỆU ĐẠI LÝ CHUỖI CUNG ỨNG */}
      <div className="overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50/70 font-mono text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Thông tin định danh chuỗi đại lý</th>
                <th className="px-4 py-3">Ngày khởi tạo</th>
                <th className="px-4 py-3">Cấp độ xác minh</th>
                <th className="px-4 py-3">Trạng thái Node</th>
                <th className="px-4 py-3 text-right">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-slate-50/65">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar khối vuông đanh chuẩn công nghiệp */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-slate-200 bg-slate-100 font-mono text-xs font-black text-slate-800">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            {tenant.name}
                            {tenant.isVerified && (
                              <span className="text-emerald-600">
                                <Icon name="shield_check" size={13} />
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 font-mono text-xs font-medium text-slate-400">
                            {tenant.email} • <span>ID: {tenant.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{tenant.regDate}</td>
                    <td className="px-4 py-3">
                      {tenant.isVerified ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700">
                          <Icon name="check_circle" size={12} /> VERIFIED_OK
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-black uppercase text-slate-400 hover:text-[#004785] hover:underline"
                        >
                          CẤP HUY HIỆU
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tenant.status === 'active' && (
                        <span className="inline-flex rounded-[2px] border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ONLINE
                        </span>
                      )}
                      {tenant.status === 'pending' && (
                        <span className="inline-flex rounded-[2px] border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          WAIT_APPROVAL
                        </span>
                      )}
                      {tenant.status === 'suspended' && (
                        <span className="inline-flex rounded-[2px] border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-[#9A1616]">
                          LOCKED_BAN
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 font-mono">
                        {tenant.status === 'pending' && (
                          <button
                            type="button"
                            className="rounded-[2px] bg-[#004785] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-black"
                          >
                            DUYỆT
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-[2px] border border-slate-200 bg-white p-1 text-slate-400 hover:text-slate-900"
                        >
                          <Icon name="external_link" size={13} />
                        </button>
                        <button
                          type="button"
                          className="rounded-[2px] border border-red-200 bg-white p-1 text-slate-400 hover:bg-red-50 hover:text-[#9A1616]"
                        >
                          <Icon name="ban" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-10 text-center font-mono text-xs font-bold uppercase tracking-wider text-slate-400"
                  >
                    Không tìm thấy dữ liệu khớp mã lọc log
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG GÓC VIỀN PHẲNG */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs font-bold text-slate-500">
          <p>
            Hiển thị {filteredTenants.length} / {tenants.length} node active
          </p>
          <div className="flex gap-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-slate-300 bg-white text-slate-400 hover:text-slate-900 active:scale-95 disabled:opacity-40"
            >
              <Icon name="chevron_left" size={13} />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-slate-300 bg-white text-slate-400 hover:text-slate-900 active:scale-95"
            >
              <Icon name="chevron_right" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
