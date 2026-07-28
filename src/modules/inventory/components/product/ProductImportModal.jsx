import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../../../../shared/components/Modal';
import Icon from '../../../../shared/components/Icon';
import { apiPost } from '../../../../services/apiClient';

// Tải file mẫu
const handleDownloadTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      'Mã hàng': 'SP001',
      'Tên hàng': 'Sản phẩm mẫu 1',
      'ĐVT': 'Cái',
      'Nhóm hàng': 'Nhóm A',
      'Thương hiệu': 'Brand X',
      'Giá vốn': 100000,
      'Giá bán': 150000,
      'Tồn kho': 10,
    }
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'Mau_Nhap_Hang_Hoa.xlsx');
};

export const ProductImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV.');
      return;
    }

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        setPreviewData(data);
      } catch (err) {
        setError('Không thể đọc file. File có thể bị hỏng hoặc sai định dạng.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const mapDataToDto = (rows) => {
    return rows.map((row) => ({
      ProductCode: row['Mã hàng']?.toString() || '',
      ProductName: row['Tên hàng']?.toString() || '',
      Unit: row['ĐVT']?.toString() || 'Cái',
      CategoryName: row['Nhóm hàng']?.toString() || '',
      BrandName: row['Thương hiệu']?.toString() || '',
      CostPrice: parseFloat(row['Giá vốn']) || 0,
      SalePrice: parseFloat(row['Giá bán']) || 0,
      AvailableStock: parseFloat(row['Tồn kho']) || 0,
      ActualStock: parseFloat(row['Tồn kho']) || 0,
    }));
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      setError('Không có dữ liệu để import.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productsToImport = mapDataToDto(previewData);
      
      const payload = {
        Products: productsToImport,
        AutoCreateMissingCategories: true,
        AutoCreateMissingBrands: true
      };

      const res = await apiPost('/api/products/bulk-import', payload);
      
      if (res.success) {
        onSuccess(res.message);
        handleClose();
      } else {
        setError(res.message || 'Lỗi khi import dữ liệu.');
      }
    } catch (err) {
      console.error('Import failed', err);
      setError(err.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nhập hàng hóa từ Excel" size="3xl">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Icon name="table_view" size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Tải lên file dữ liệu</p>
              <p className="text-xs text-slate-500">Hỗ trợ .xlsx, .xls, .csv</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Tải file mẫu
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-[#004785] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
            >
              Chọn file
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {file && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Bản xem trước ({previewData.length} dòng)
              </span>
              {previewData.length > 5 && (
                <span className="text-xs text-slate-500">Hiển thị 5 dòng đầu</span>
              )}
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Mã hàng</th>
                    <th className="px-4 py-2">Tên hàng</th>
                    <th className="px-4 py-2">ĐVT</th>
                    <th className="px-4 py-2">Giá vốn</th>
                    <th className="px-4 py-2">Giá bán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-slate-500">
                        File trống hoặc không đúng định dạng
                      </td>
                    </tr>
                  ) : (
                    previewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{row['Mã hàng'] || '-'}</td>
                        <td className="px-4 py-2">{row['Tên hàng'] || '-'}</td>
                        <td className="px-4 py-2">{row['ĐVT'] || '-'}</td>
                        <td className="px-4 py-2">{row['Giá vốn'] || '-'}</td>
                        <td className="px-4 py-2">{row['Giá bán'] || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleImport}
            disabled={loading || previewData.length === 0}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold text-white transition-all ${
              loading || previewData.length === 0
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              'Tiến hành Import'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
