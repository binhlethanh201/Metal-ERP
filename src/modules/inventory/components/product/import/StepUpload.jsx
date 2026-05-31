/**
 * StepUpload - BÆ°á»›c 1: Táº£i lÃªn file Excel.
 */
import Icon from '../../../../../shared/components/Icon';

const StepUpload = ({ onFileSelect }) => {
  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) onFileSelect(f);
  };

  return (
    <div className="space-y-4">
      <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
        Táº£i file máº«u
      </button>
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-16"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer?.files?.[0]);
        }}
        onClick={() => {
          const i = document.createElement('input');
          i.type = 'file';
          i.accept = '.xlsx,.xls';
          i.onchange = (e) => handleFile(e.target.files?.[0]);
          i.click();
        }}
      >
        <Icon name="upload_file" size={48} className="text-slate-300" />
        <p className="mt-4 text-sm font-semibold text-slate-600">
          KÃ©o tháº£ file vÃ o Ä‘Ã¢y hoáº·c click Ä‘á»ƒ chá»n
        </p>
        <p className="mt-1 text-xs text-slate-400">Há»— trá»£ .xlsx, .xls</p>
      </div>
    </div>
  );
};

export default StepUpload;
