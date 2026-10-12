import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/endpoints';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login(username, password);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.access_token, response.data.refresh_token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login gagal');
      }
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f4f5f2] lg:grid-cols-[minmax(420px,0.86fr)_1.14fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#13231c] px-10 py-9 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-emerald-300 text-[10px] font-bold tracking-[-0.04em] text-[#13231c]">UGM</div>
          <div>
            <p className="text-[13px] font-semibold tracking-[0.05em]">UNIT GADAI MANDIRI</p>
            <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-200/65">Kota Padang</p>
          </div>
        </div>

        <div className="relative max-w-xl py-14">
          <p className="eyebrow text-emerald-200/65">Pawn Operations System</p>
          <h1 className="mt-5 text-[clamp(2.7rem,5vw,5.3rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            Kontrol portofolio,
            <br />
            tanpa kehilangan detail.
          </h1>
          <p className="mt-7 max-w-md text-[14px] leading-7 text-white/58">
            Satu ruang kerja untuk appraisal, transaksi, gudang, pembayaran, dan risiko jatuh tempo seluruh cabang.
          </p>
        </div>

        <div className="relative grid grid-cols-3 border-y border-white/12">
          {[
            ['4', 'Akun cabang'],
            ['1', 'Kontrol pusat'],
            ['24/7', 'Jejak audit'],
          ].map(([value, label], index) => (
            <div key={label} className={`py-5 ${index > 0 ? 'border-l border-white/12 pl-5' : ''}`}>
              <p className="text-xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-14">
        <div className="w-full max-w-[480px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center bg-[#13231c] text-[10px] font-bold text-emerald-200">UGM</div>
            <div>
              <p className="text-[13px] font-semibold tracking-[0.05em] text-slate-950">UNIT GADAI MANDIRI</p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#126447]">Kota Padang</p>
            </div>
          </div>

          <div className="border-b border-slate-300 pb-6">
            <p className="eyebrow text-[#126447]">Akses Terotorisasi</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-slate-950">Masuk ke workspace</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">Gunakan akun operasional sesuai cabang dan kewenangan Anda.</p>
          </div>

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-[11px] font-semibold text-slate-700">Username / Email</label>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Masukkan username…"
                  className="control h-12 w-full rounded-none pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[11px] font-semibold text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.8} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password…"
                  className="control h-12 w-full rounded-none pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-700/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 bg-[#126447] px-4 text-[12px] font-semibold tracking-[0.01em] text-white transition-[background-color,transform] duration-150 hover:bg-[#0d5038] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <span>{isLoading ? 'Memverifikasi…' : 'Masuk ke Sistem'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-2 border-t border-slate-300 pt-5 text-[10px] leading-relaxed text-slate-500">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#126447]" strokeWidth={1.8} aria-hidden="true" />
            <span>Sesi dilindungi dengan JWT refresh-token rotation dan jejak audit.</span>
          </div>
        </div>
      </section>
    </main>
  );
};
