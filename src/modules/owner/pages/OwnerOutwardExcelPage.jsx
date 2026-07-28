import React, { useRef, useState } from 'react';
import { apiGet, apiPost } from '../../../services/apiClient';
import Icon from '../../../shared/components/Icon';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Table from '../../../shared/components/Table';
import Badge from '../../../shared/components/Badge';
import { Card } from '../../../shared/components/Card';

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const OwnerOutwardExcelPage = () => {
  const fileInputRef = useRef(null);

  const [branchId, setBranchId] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState('');

  const [commitLoading, setCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState('');
  const [createdTickets, setCreatedTickets] = useState([]);

  const handleDownloadTemplate = async () => {
    setParseError('');
    try {
      const blob = await apiGet('/api/outwardinventoryexcel/template', {
        responseType: 'blob',
      });
      downloadBlob(blob, 'Template_XuatKho_Excel.xlsx');
    } catch (err) {
      setParseError(err?.message || 'Không thể tải template.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setParseResult(null);
    setCreatedTickets([]);
    setCommitError('');
    setParseError('');
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setParseError('Vui lòng chọn file Excel trước khi upload.');
      return;
    }
    setParseLoading(true);
    setParseError('');
    setParseResult(null);
    setCreatedTickets([]);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const data = await apiPost('/api/outwardinventoryexcel/parse', formData, {
        headers: {},
      });
      setParseResult(data || null);
    } catch (err) {
      setParseError(err?.message || 'Upload hoặc parse file thất bại.');
    } finally {
      setParseLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!parseResult) {
      setCommitError('Chưa có dữ liệu parse để commit.');
      return;
    }
    if (!branchId.trim()) {
      setCommitError('Vui lòng nhập ID chi nhánh.');
      return;
    }
    setCommitLoading(true);
    setCommitError('');
    try {
      const payload = {
        branchId: branchId.trim(),
        rows: parseResult.rows || [],
      };
      const data = await apiPost('/api/outwardinventoryexcel/commit', payload);
      const tickets = data?.tickets || data?.items || data?.createdTickets || [];
      setCreatedTickets(Array.isArray(tickets) ? tickets : []);
    } catch (err) {
      setCommitError(err?.message || 'Commit dữ liệu thất bại.');
    } finally {
      setCommitLoading(false);
    }
  };

  const previewRows = parseResult?.rows || [];
  const previewGroups = parseResult?.groups || [];
  const previewErrors = parseResult?.errors || [];

  const rowColumns = [
    { key: 'rowNumber', header: '#', width: '60px' },
    { key: 'productCode', header: 'Mã sản phẩm', width: '160px' },
    { key: 'productName', header: 'Tên sản phẩm' },
    { key: 'quantity', header: 'SL', width: '80px', align: 'right' },
    { key: 'unit', header: 'ĐVT', width: '80px' },
    { key: 'note', header: 'Ghi chú' },
  ];

  const ticketColumns = [
    { key: 'ticketId', header: 'Mã phiếu', width: '160px' },
    { key: 'ticketCode', header: 'Code', width: '160px' },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: '160px',
      render: (val) => (val ? new Date(val).toLocaleString('vi-VN') : '—'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '140px',
      render: (val) =>
        val ? (
          <Badge variant="success" size="sm">
            {val}
          </Badge>
        ) : (
          '—'
        ),
    },
    { key: 'totalAmount', header: 'Tổng tiền', width: '140px', align: 'right' },
  ];

  return (
    <div className="animate-fade-in w-full space-y-4 text-slate-800 dark:text-[#e5e5e5]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e5e5]">
          Xuất kho từ Excel
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-[#999999]">
          Tải template, nhập dữ liệu, upload và commit để tạo phiếu xuất kho hàng loạt.
        </p>
      </div>

      {(parseError || commitError) && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <Icon name="error" className="mt-0.5 flex-shrink-0 text-red-500" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-red-800">Đã xảy ra lỗi</p>
            <p className="mt-1 text-sm text-red-700">{parseError || commitError}</p>
          </div>
        </div>
      )}

      <Card header="Bước 1 — Template & File">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5"
            >
              <Icon name="download" size={14} />
              Tải template Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                label="File Excel"
                placeholder="Chưa chọn file"
                value={selectedFile?.name || ''}
                readOnly
                disabled
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleChooseFile}>
                Chọn file
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={parseLoading}
                onClick={handleUpload}
                className="flex items-center gap-1.5"
              >
                <Icon name="upload" size={14} />
                Upload
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {parseResult && (
        <Card header="Bước 2 — Preview dữ liệu đã parse">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-[#999999]">
              <Badge variant="info" size="sm">
                Rows: {previewRows.length}
              </Badge>
              {Array.isArray(previewGroups) && previewGroups.length > 0 && (
                <Badge variant="primary" size="sm">
                  Groups: {previewGroups.length}
                </Badge>
              )}
              {previewErrors.length > 0 && (
                <Badge variant="danger" size="sm">
                  Lỗi: {previewErrors.length}
                </Badge>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-[#333333]">
              <Table
                columns={rowColumns}
                data={previewRows}
                emptyMessage="Không có dòng dữ liệu nào"
              />
            </div>

            {Array.isArray(previewGroups) && previewGroups.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-[#333333]">
                <p className="mb-2 font-semibold text-slate-700 dark:text-[#b3b3b3]">
                  Groups ({previewGroups.length})
                </p>
                <ul className="space-y-1 text-slate-600 dark:text-[#999999]">
                  {previewGroups.map((g, idx) => (
                    <li key={idx} className="font-mono text-xs">
                      {typeof g === 'string'
                        ? g
                        : JSON.stringify(g)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewErrors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/40">
                <p className="mb-2 font-semibold text-red-700 dark:text-red-300">
                  Lỗi phát hiện ({previewErrors.length})
                </p>
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  {previewErrors.map((e, idx) => (
                    <li key={idx} className="font-mono text-xs">
                      {typeof e === 'string' ? e : JSON.stringify(e)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {parseResult && (
        <Card header="Bước 3 — Commit">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                label="ID chi nhánh"
                placeholder="Nhập UUID chi nhánh"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              />
            </div>
            <Button
              variant="success"
              size="md"
              loading={commitLoading}
              onClick={handleCommit}
              className="flex items-center gap-1.5"
            >
              <Icon name="check" size={14} />
              Commit
            </Button>
          </div>
        </Card>
      )}

      {createdTickets.length > 0 && (
        <Card header={`Phiếu đã tạo (${createdTickets.length})`}>
          <Table
            columns={ticketColumns}
            data={createdTickets}
            emptyMessage="Chưa có phiếu nào được tạo"
          />
        </Card>
      )}
    </div>
  );
};

export default OwnerOutwardExcelPage;
