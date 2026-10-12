import React from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Users: React.FC = () => {
  const userList = [
    { username: 'admin_pusat', full_name: 'Head Office Super Admin (Pusat Padang)', email: 'pusat@samplegadai.com', role: 'SUPER_ADMIN', branch: 'Konsolidasi Pusat (Padang)' },
    { username: 'admin_nanggalo', full_name: 'Admin Cabang Nanggalo', email: 'nanggalo@samplegadai.com', role: 'BRANCH_MANAGER', branch: 'BR-PDG-001 - Cabang Nanggalo' },
    { username: 'admin_pasarraya', full_name: 'Admin Cabang Pasar Raya', email: 'pasarraya@samplegadai.com', role: 'BRANCH_MANAGER', branch: 'BR-PDG-002 - Cabang Pasar Raya' },
    { username: 'admin_azizi', full_name: 'Admin Cabang Azizi', email: 'azizi@samplegadai.com', role: 'BRANCH_MANAGER', branch: 'BR-PDG-003 - Cabang Azizi' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Pengguna & Role RBAC</h1>
          <p className="text-xs text-slate-500">Daftar 4 Akun Utama (1 Kantor Pusat + 3 Cabang Padang) & Role Access Control</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Username</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role RBAC</th>
                <th className="px-6 py-3.5">Cabang Operations</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userList.map((u) => (
                <tr key={u.username} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{u.username}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{u.full_name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'SUPER_ADMIN' ? 'purple' : 'info'}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{u.branch}</td>
                  <td className="px-6 py-4">
                    <Badge variant="success">AKTIF</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
