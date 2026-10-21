import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles?: Role[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Ringkasan',
    items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operasional',
    items: [
      { name: 'Nasabah', path: '/customers', icon: Users },
      { name: 'Barang Gadai', path: '/assets', icon: Package },
      { name: 'Transaksi Gadai', path: '/pawn-transactions', icon: FileText },
      { name: 'Pembayaran', path: '/payments', icon: CreditCard },
      { name: 'Inventory', path: '/inventory', icon: Boxes },
      { name: 'Jatuh Tempo', path: '/overdue', icon: Clock },
    ],
  },
  {
    label: 'Intelijen & Laporan',
    items: [
      { name: 'Appraisal', path: '/appraisal', icon: Calculator },
      { name: 'Laporan', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { name: 'Pengguna', path: '/users', icon: UserCheck, roles: ['SUPER_ADMIN', 'MANAGER'] },
      { name: 'Cabang', path: '/branches', icon: Building2, roles: ['SUPER_ADMIN'] },
      { name: 'Tarif Ijarah & LTV', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'MANAGER'] },
      { name: 'Audit Log', path: '/audit-logs', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'MANAGER'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    document.body.style.overflow = isOpen && window.innerWidth < 1024 ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/55 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[272px] flex-col border-r border-white/10 bg-[#13231c] text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex min-h-[76px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-emerald-300/35 bg-emerald-300 text-[9px] font-bold tracking-[-0.03em] text-[#13231c]">
              UGM
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-none tracking-[0.05em]">UNIT GADAI MANDIRI</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                  SYARIAH
                </span>
                <span className="text-[9px] font-medium tracking-[0.1em] text-emerald-200/75">
                  Padang (Bebas Riba)
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigasi utama">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || (user && item.roles.includes(user.role))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-5 last:mb-0">
                <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex min-h-10 items-center gap-3 border-l-2 px-3 py-2 text-[12px] font-medium tracking-[0.01em] transition-colors duration-150 ${
                            isActive
                              ? 'border-emerald-300 bg-white/[0.09] text-white'
                              : 'border-transparent text-white/58 hover:bg-white/[0.05] hover:text-white'
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.8} aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-emerald-100">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-white">{user?.full_name || 'Pengguna'}</p>
              <p className="mt-0.5 truncate text-[9px] font-medium uppercase tracking-[0.12em] text-white/40">
                {user?.role?.replace(/_/g, ' ') || 'Operator'}
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-300" aria-label="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
