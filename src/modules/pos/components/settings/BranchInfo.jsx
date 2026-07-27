/**
 * BranchInfo - Thông tin chi nhánh (chỉ đọc)
 */
import { Card } from '../../../../shared/components/Card';

const BranchInfo = ({ data }) => {
  if (!data) return null;

  return (
    <Card header="Thông tin chi nhánh">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">
            Tên chi nhánh
          </p>
          <p className="mt-1 font-semibold">{data.branchName || data.branch_name || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">
            Mã chi nhánh
          </p>
          <p className="mt-1 font-mono font-semibold">
            {data.branchCode || data.branch_code || '-'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">Địa chỉ</p>
          <p className="mt-1 font-semibold">{data.address || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">
            Số điện thoại
          </p>
          <p className="mt-1 font-semibold">{data.phone || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">Mã số thuế</p>
          <p className="mt-1 font-semibold">{data.taxCode || data.tax_code || '-'}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-400 dark:text-[#808080]">
            Đơn vị tiền tệ
          </p>
          <p className="mt-1 font-semibold">{data.currency || 'VND'}</p>
        </div>
      </div>
    </Card>
  );
};

export default BranchInfo;
