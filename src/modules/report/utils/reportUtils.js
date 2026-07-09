export const exportToCSV = (data, columns, fileName) => {
  if (!data || !data.length) return;

  const headers = columns.map((col) => `"${col.header}"`).join(',');

  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
