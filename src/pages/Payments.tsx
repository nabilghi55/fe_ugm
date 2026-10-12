import React from 'react';
import { Printer } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Payments: React.FC = () => {
  const dummyPayments = [
    { number: 'PAY-260917-001', pawn_number: 'PWN-260917-002', type: 'EXTENSION_PAYMENT', total: 190000, method: 'CASH', date: '2026-09-17 10:15' },
    { number: 'PAY-260917-002', pawn_number: 'PWN-260917-005', type: 'FULL_PAYOFF', total: 5200000, method: 'BANK_TRANSFER', date: '2026-09-17 11:30' },
  ];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Pembayaran & Ledger Keuangan Syariah</h1>
          <p className="text-xs text-slate-500">Catatan transaksi pembayaran biaya titip (ijarah), perpanjangan akad rahn, dan pelunasan unit (Syariah Immutable Ledger)</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No Pembayaran</th>
                <th className="px-6 py-3.5">No Transaksi Gadai</th>
                <th className="px-6 py-3.5">Jenis Pembayaran</th>
                <th className="px-6 py-3.5">Metode</th>
                <th className="px-6 py-3.5">Total Nominal</th>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5 text-right">Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dummyPayments.map((p) => (
                <tr key={p.number} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{p.number}</td>
                  <td className="px-6 py-4 font-mono text-slate-700">{p.pawn_number}</td>
                  <td className="px-6 py-4">
                    <Badge variant={p.type === 'FULL_PAYOFF' ? 'purple' : 'info'}>{p.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{p.method}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{formatIDR(p.total)}</td>
                  <td className="px-6 py-4 text-slate-500 text-[11px] font-mono">{p.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => alert(`Cetak Kuitansi Pembayaran ${p.number}`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 ml-auto cursor-pointer transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cetak Kuitansi</span>
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
