import { Table } from '../../../../shared/components/Table';
import { Card } from '../../../../shared/components/Card';

const exportColumns = [
  { key: 'id', header: 'ID', width: '10%' },
  { key: 'productName', header: 'Sản phẩm', width: '30%' },
  { key: 'quantity', header: 'Số lượng', width: '15%' },
  { key: 'date', header: 'Ngày', width: '20%' },
  { key: 'reason', header: 'Lý do', width: '25%' },
];

export const ExportTable = ({ data }) => {
  return (
    <Card header="Lịch sử xuất kho">
      <Table columns={exportColumns} data={data} emptyMessage="Chưa có lần xuất nào" />
    </Card>
  );
};
