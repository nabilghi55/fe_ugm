import React from 'react';
import { PhoneCall } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Overdue: React.FC = () => {
  const overdueItems = [
    {
      pawn_number: 'PWN-260917-004',
      customer_name: 'Budi Santoso',
      phone: '081298765432',
      asset_name: 'MacBook Pro M3 14" 512GB',
      principal: 12000000,
      days_overdue: 4,
      bracket: '1-7 Hari',
    },
    {
      pawn_number: 'PWN-260917-009',
      customer_name: 'Dewi Lestari',
      phone: '081311223344',
      asset_name: 'Samsung Galaxy S24 Ultra 256GB',
      principal: 9500000,
      days_overdue: 12,
      bracket: '8-14 Hari',
    },
    {
      pawn_number: 'PWN-260917-015',
      customer_name: 'Eko Prasetyo',
      phone: '081555667788',
      asset_name: 'Sony Alpha A7 IV Kit 28-70mm',
      principal: 15000000,
      days_overdue: 24,
      bracket: '15-30 Hari',
    },
  ];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monitoring Overdue & NPL</h1>
        <p className="text-xs text-slate-500">Klasifikasi keterlambatan berdasarkan braket umur pinjaman & pemicu notifikasi pengingat</p>
      </div>

      {/* Ageing Classification Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-amber-50/80 border border-amber-200">
          <span className="text-xs font-semibold text-amber-800 block">1 - 7 Hari</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1 Akun</h3>
          <p className="text-xs text-slate-600 mt-1">Outstanding: {formatIDR(12000000)}</p>
        </Card>
        <Card className="p-4 bg-orange-50/80 border border-orange-200">
          <span className="text-xs font-semibold text-orange-800 block">8 - 14 Hari</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1 Akun</h3>
          <p className="text-xs text-slate-600 mt-1">Outstanding: {formatIDR(9500000)}</p>
        </Card>
        <Card className="p-4 bg-rose-50/80 border border-rose-200">
          <span className="text-xs font-semibold text-rose-800 block">15 - 30 Hari</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">1 Akun</h3>
          <p className="text-xs text-slate-600 mt-1">Outstanding: {formatIDR(15000000)}</p>
        </Card>
        <Card className="p-4 bg-slate-100 border border-slate-300">
          <span className="text-xs font-semibold text-slate-800 block">&gt; 30 Hari (Default / Lelang)</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">0 Akun</h3>
          <p className="text-xs text-slate-600 mt-1">Outstanding: {formatIDR(0)}</p>
        </Card>
      </div>

      {/* Overdue Accounts Table */}
      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No Transaksi</th>
                <th className="px-6 py-3.5">Nasabah</th>
                <th className="px-6 py-3.5">Barang Agunan</th>
                <th className="px-6 py-3.5">Pokok Pinjaman</th>
                <th className="px-6 py-3.5">Hari Terlambat</th>
                <th className="px-6 py-3.5">Kategori Braket</th>
                <th className="px-6 py-3.5 text-right">Aksi Penagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueItems.map((item) => (
                <tr key={item.pawn_number} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{item.pawn_number}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 block">{item.customer_name}</span>
                    <span className="text-[11px] text-slate-500">{item.phone}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{item.asset_name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{formatIDR(item.principal)}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{item.days_overdue} Hari</td>
                  <td className="px-6 py-4">
                    <Badge variant="warning">{item.bracket}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center space-x-1.5 ml-auto cursor-pointer hover:bg-emerald-100 transition-colors">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kirim WA Pengingat</span>
                    </button>
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
