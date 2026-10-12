import React from 'react';
import { Bell, Building2, LogOut, Menu, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/endpoints';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Nasabah',
  assets: 'Barang Gadai',
  appraisal: 'Appraisal',
  'pawn-transactions': 'Transaksi Gadai',
  payments: 'Pembayaran',
  inventory: 'Inventory',
  overdue: 'Jatuh Tempo',
  'market-intelligence': 'Harga Pasar',
  reports: 'Laporan',
  users: 'Pengguna',
  branches: 'Cabang',
  settings: 'Tarif Ijarah & LTV',
  'audit-logs': 'Audit Log',
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, setAuth, logout } = useAuthStore();
  const location = useLocation();
  const currentRoute = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const pageLabel = routeLabels[currentRoute] || 'Workspace';

  const accounts = [
    { username: 'admin_pusat', label: 'Kantor Pusat' },
    { username: 'admin_nanggalo', label: 'Cabang Nanggalo' },
    { username: 'admin_pasarraya', label: 'Cabang Pasar Raya' },
    { username: 'admin_azizi', label: 'Cabang Azizi' },
  ];

  const currentAccount = accounts.find((account) => account.username === user?.username) || accounts[0];

  const handleAccountSwitch = async (username: string) => {
    try {
      const response = await authApi.login(username, 'Admin123!');
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.access_token, response.data.refresh_token);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          aria-label="Buka navigasi"
          onClick={onToggleSidebar}
          className="grid h-10 w-10 flex-shrink-0 place-items-center border border-slate-200 text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="eyebrow text-[#126447]">Workspace / {pageLabel}</p>
          <p className="mt-1 truncate text-[12px] text-slate-500">Operasional gadai & kontrol portofolio</p>
        </div>
      </div>

      <div className="hidden w-full max-w-[430px] px-8 xl:block">
        <label className="group flex h-10 items-center gap-2.5 border-b border-slate-300 transition-colors duration-150 focus-within:border-[#126447]">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#126447]" aria-hidden="true" />
          <span className="sr-only">Cari data</span>
          <input
            type="search"
            placeholder="Cari transaksi, NIK, nasabah, atau IMEI…"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">⌘ K</kbd>
        </label>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <label className="hidden h-10 items-center gap-2 border border-slate-200 bg-[#f8f9f7] px-3 md:flex">
          <Building2 className="h-4 w-4 text-[#126447]" aria-hidden="true" />
          <span className="sr-only">Pilih akun cabang</span>
          <select
            value={currentAccount.username}
            onChange={(event) => handleAccountSwitch(event.target.value)}
            className="max-w-[155px] bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-none"
          >
            {accounts.map((account) => (
              <option key={account.username} value={account.username}>
                {account.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-label="Notifikasi, 1 belum dibaca"
          className="relative grid h-10 w-10 place-items-center text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-950"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        <div className="mx-0.5 h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={logout}
          className="flex h-10 items-center gap-2 px-2.5 text-[11px] font-semibold text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 sm:px-3"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
