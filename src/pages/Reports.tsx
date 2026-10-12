import React, { useState } from 'react';
import { BarChart3, FileSpreadsheet, FileText, Filter, TrendingUp, Package, ShieldCheck, DollarSign, Building } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

export const Reports: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const isPusat = user?.username === 'admin_pusat' || user?.role === 'SUPER_ADMIN';

  const reportTypes = [
    { title: 'Laporan Consolidated Profit & Margin Syariah', desc: 'Rincian profitabilitas bersih, pendapatan ujrah titip & admin per cabang' },
    { title: 'Laporan Konsolidasi Barang Gadai (Inventory)', desc: 'Rincian total fisik barang gadai yang tersimpan di gudang 3 cabang' },
    { title: 'Laporan Pencairan Pinjaman (Disbursement)', desc: 'Rincian nominal pencairan per cabang & tanggal' },
    { title: 'Laporan Outstanding Pinjaman Active', desc: 'Portofolio pinjaman berjalan dan agunan' },
    { title: 'Laporan Ta\'widh & Kompensasi Keterlambatan', desc: 'Daftar kompensasi operasional riil dari transaksi overdue' },
    { title: 'Laporan Audit Performa Appraiser', desc: 'Akurasi appraisal vs harga pasar second' },
  ];

  const branchProfitData = [
    { code: 'BR-PDG-001', name: 'Cabang Nanggalo', totalLoan: 'Rp 450.000.000', interestIncome: 'Rp 18.000.000', adminFee: 'Rp 4.500.000', totalProfit: 'Rp 22.500.000', itemStored: 42, status: 'Top Performer' },
    { code: 'BR-PDG-002', name: 'Cabang Pasar Raya', totalLoan: 'Rp 380.000.000', interestIncome: 'Rp 15.200.000', adminFee: 'Rp 3.800.000', totalProfit: 'Rp 19.000.000', itemStored: 35, status: 'High Volume' },
    { code: 'BR-PDG-003', name: 'Cabang Azizi', totalLoan: 'Rp 290.000.000', interestIncome: 'Rp 11.600.000', adminFee: 'Rp 2.900.000', totalProfit: 'Rp 14.500.000', itemStored: 28, status: 'Growing' },
  ];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Operasional & Keuangan</h1>
          <p className="text-xs text-slate-500">
            {isPusat
              ? 'Laporan Konsolidasi Kantor Pusat Padang — Profitabilitas & Rekap Barang Gadai per Cabang'
              : 'Export laporan bisnis gadai dalam format Excel & PDF'}
          </p>
        </div>

        {isPusat && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Akses Kantor Pusat (Head Office)</span>
            </span>
          </div>
        )}
      </div>

      {/* Head Office Executive Summary Section (Shown for Pusat / Admin) */}
      {isPusat && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Laporan Profitabilitas & Barang Gadai 3 Cabang Kota Padang</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-medium">Total Profit Konsolidasi (3 Cabang)</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-700">Rp 56.000.000</h3>
              <p className="text-[11px] text-slate-600">Gabungan Ujrah Titip & Admin (Nanggalo, Pasar Raya, Azizi)</p>
            </Card>

            <Card className="p-4 bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-teal-800 font-medium">Total Barang Tersimpan (Cross-Branch)</span>
                <Package className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-teal-700">105 Unit Barang</h3>
              <p className="text-[11px] text-slate-600">Total Nilai Agunan Rp 1.120.000.000</p>
            </Card>

            <Card className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 font-medium">Total Loan Outstanding</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Rp 1.120.000.000</h3>
              <p className="text-[11px] text-slate-500">Portofolio aktif di seluruh cabang Padang</p>
            </Card>
          </div>

          {/* Branch Profit & Inventory Breakdown Table */}
          <Card className="p-4 bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Breakdown Kinerja Profit & Gudang per Cabang</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Kode & Nama Cabang</th>
                    <th className="py-2.5 px-3">Total Pinjaman</th>
                    <th className="py-2.5 px-3">Pendapatan Ujrah Titip</th>
                    <th className="py-2.5 px-3">Biaya Admin</th>
                    <th className="py-2.5 px-3">Total Profit</th>
                    <th className="py-2.5 px-3">Barang di Gudang</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {branchProfitData.map((b) => (
                    <tr key={b.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block">{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{b.code}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{b.totalLoan}</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">{b.interestIncome}</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">{b.adminFee}</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700">{b.totalProfit}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]">
                          {b.itemStored} unit
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Badge variant="success">{b.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Controls Card */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 shadow-sm">
        <div>
          <label className="text-xs text-slate-600 block mb-1 font-semibold">Filter Cabang</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Cabang (Pusat Konsolidasi)</option>
            <option value="BR-PDG-001">BR-PDG-001 - Cabang Nanggalo</option>
            <option value="BR-PDG-002">BR-PDG-002 - Cabang Pasar Raya</option>
            <option value="BR-PDG-003">BR-PDG-003 - Cabang Azizi</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1 font-semibold">Tanggal Mulai</label>
          <input type="date" defaultValue="2026-09-01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer" />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1 font-semibold">Tanggal Selesai</label>
          <input type="date" defaultValue="2026-09-17" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer" />
        </div>
        <div className="flex items-end">
          <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Terapkan Filter</span>
          </button>
        </div>
      </Card>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportTypes.map((rep, idx) => (
          <Card key={idx} className="space-y-4 bg-white border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{rep.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{rep.desc}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex space-x-2">
              <button className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
              <button className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Export PDF</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
