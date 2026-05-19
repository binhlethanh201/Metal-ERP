import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, ShieldCheck, Ban, ExternalLink } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-textAdmin">Quản lý Tài khoản</h1>
          <p className="mt-1 text-sm text-placeholder">
            Duyệt cấp phát, xác minh và xử lý vi phạm Tenant hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-admin border border-borderLight bg-white px-4 py-2 text-sm font-bold text-textAdmin transition-all hover:bg-bodyAdmin">
            XUẤT FILE CSV
          </button>
          <button className="rounded-admin bg-admin px-6 py-2 text-sm font-bold tracking-btn text-white transition-all hover:bg-black">
            + THÊM TENANT MỚI
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-admin border border-borderLight bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'active', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-admin px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                filterStatus === status
                  ? 'bg-admin text-white'
                  : 'bg-bodyAdmin text-placeholder hover:text-textAdmin'
              }`}
            >
              {status === 'all'
                ? 'Tất cả'
                : status === 'pending'
                  ? 'Chờ duyệt'
                  : status === 'active'
                    ? 'Hoạt động'
                    : 'Đã khóa'}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-admin border border-borderLight bg-[#FAFAFA] py-2 pl-10 pr-4 text-sm focus:border-admin focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-admin border border-borderLight bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-borderLight bg-[#FAFAFA]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[1px] text-placeholder">
                Thông tin Tài khoản
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[1px] text-placeholder">
                Ngày đăng ký
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[1px] text-placeholder">
                Xác minh (Verified)
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[1px] text-placeholder">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[1px] text-placeholder">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="border-b border-borderLight transition-colors hover:bg-[#FAFAFA]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-admin bg-bodyAdmin font-bold text-admin">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-textAdmin">
                          {tenant.name}
                          {tenant.isVerified && (
                            <ShieldCheck
                              size={14}
                              className="text-[#2E7D32]"
                              fill="#2E7D32"
                              fillOpacity="0.1"
                            />
                          )}
                        </div>
                        <div className="text-xs text-placeholder">
                          {tenant.email} • ID: {tenant.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-textAdmin">{tenant.regDate}</td>
                  <td className="px-6 py-4">
                    {tenant.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#2E7D32]">
                        <CheckCircle size={12} /> ĐÃ XÁC MINH
                      </span>
                    ) : (
                      <button className="text-[10px] font-black uppercase text-placeholder hover:text-admin hover:underline">
                        CẤP HUY HIỆU
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {tenant.status === 'active' && (
                      <div className="inline-flex rounded bg-[#2E7D32]/10 px-2 py-1 text-[10px] font-bold text-[#2E7D32]">
                        HOẠT ĐỘNG
                      </div>
                    )}
                    {tenant.status === 'pending' && (
                      <div className="inline-flex rounded bg-[#FBC02D]/20 px-2 py-1 text-[10px] font-bold text-[#8f4e00]">
                        CHỜ DUYỆT
                      </div>
                    )}
                    {tenant.status === 'suspended' && (
                      <div className="inline-flex rounded bg-[#CC0000]/10 px-2 py-1 text-[10px] font-bold text-[#CC0000]">
                        ĐÃ KHÓA
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {tenant.status === 'pending' && (
                        <button className="rounded-admin bg-admin px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-black">
                          DUYỆT NGAY
                        </button>
                      )}
                      <button className="rounded-admin border border-borderLight p-1.5 text-placeholder transition-all hover:bg-bodyAdmin hover:text-admin">
                        <ExternalLink size={16} />
                      </button>
                      <button className="rounded-admin border border-borderLight p-1.5 text-placeholder transition-all hover:bg-error-container hover:text-error">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-sm font-medium text-placeholder"
                >
                  Không tìm thấy kết quả phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between bg-[#FAFAFA] px-6 py-3">
          <p className="text-xs font-semibold text-placeholder">
            Hiển thị {filteredTenants.length} của {tenants.length} Tenant
          </p>
          <div className="flex gap-1">
            <button className="rounded-admin border border-borderLight bg-white px-3 py-1 text-xs font-bold text-admin disabled:opacity-50">
              Trước
            </button>
            <button className="rounded-admin border border-borderLight bg-white px-3 py-1 text-xs font-bold text-admin">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
