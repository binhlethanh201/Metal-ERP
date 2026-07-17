import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { registerStartRequest } from '../../../services/authService';

const RegisterStep1Email = ({ onNextStep }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email doanh nghiệp.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerStartRequest({ email });
      onNextStep(email);
    } catch (err) {
      setError(err?.message || 'Email này đã được đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-error-container bg-error-container/20 p-3 text-center text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant"
          htmlFor="email"
        >
          Email Doanh Nghiệp
        </label>
        <div className="group relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary"
            size={18}
          />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            disabled={loading}
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-3 pl-10 pr-4 text-sm font-semibold text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
            placeholder="owner@mepcoffee.com"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold tracking-wider text-on-primary shadow-sm transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Đang kiểm tra...
            </>
          ) : (
            <>
              Tiếp tục xác thực <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RegisterStep1Email;
