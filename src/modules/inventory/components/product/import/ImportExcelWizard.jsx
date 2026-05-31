/**
 * ImportExcelWizard - Modal nhập Excel với Stepper 4 bước.
 * Sử dụng sub-components: StepUpload, StepMapping, StepValidation.
 */
import { useState } from 'react';
import Icon from '../../../../../shared/components/Icon';
import StepUpload from './import/StepUpload';
import StepMapping from './import/StepMapping';
import StepValidation from './import/StepValidation';

const STEPS = ['Tải lên tệp', 'Ghép cột', 'Kiểm tra dữ liệu', 'Hoàn tất'];

const ImportExcelWizard = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({
    code: 'Mã hàng (A)',
    name: 'Tên hàng (B)',
    unit: 'ĐVT (C)',
    price: '',
  });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileSelect = (f) => {
    setFile(f);
    setTimeout(() => setStep(2), 500);
  };
  const handleStartImport = () => {
    setImporting(true);
    let p = 0;
    const t = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setImporting(false);
        setStep(4);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Nhập dữ liệu từ Excel</h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex items-center border-b border-slate-200 px-6 py-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span
                className={`ml-2 text-sm font-semibold ${i + 1 === step ? 'text-slate-800' : 'text-slate-400'}`}
              >
                {s}
              </span>
              {i < 3 && (
                <div
                  className={`mx-3 h-0.5 w-8 ${i + 1 < step ? 'bg-green-500' : 'bg-slate-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-5">
          {step === 1 && <StepUpload onFileSelect={handleFileSelect} />}
          {step === 2 && (
            <StepMapping
              mapping={mapping}
              onChange={(k, v) => setMapping((p) => ({ ...p, [k]: v }))}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepValidation
              onBack={() => setStep(2)}
              onStartImport={handleStartImport}
              importing={importing}
              progress={progress}
            />
          )}
          {step === 4 && (
            <div className="flex flex-col items-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon name="check" size={32} className="text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-800">Nhập dữ liệu thành công</h3>
              <p className="mt-1 text-sm text-slate-500">Đã nhập 5 dòng dữ liệu</p>
              <div className="mt-6 w-full rounded-lg bg-slate-100">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '40%' }} />
              </div>
              <button
                type="button"
                className="mt-6 rounded-lg bg-[#004785] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#003566]"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcelWizard;
