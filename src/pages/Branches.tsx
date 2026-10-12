import React from 'react';
import { Plus, Phone, MapPin, Warehouse, Rocket, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const Branches: React.FC = () => {
  const padangBranches = [
    {
      code: 'BR-PDG-001',
      name: 'Cabang Nanggalo (Pusat Ops)',
      address: 'Jl. Siteba No. 12, Nanggalo, Kota Padang',
      phone: '0751-441122',
      warehouse: 'Gudang Nanggalo (+ Brankas Pusat Emas/BPKB)',
      status: 'AKTIF',
      monthlyVolume: 'Rp 420.000.000',
      activeItems: 6,
    },
    {
      code: 'BR-PDG-002',
      name: 'Cabang Pasar Raya',
      address: 'Jl. M. Yamin No. 45, Pasar Raya, Kota Padang',
      phone: '0751-442233',
      warehouse: 'Gudang Pasar Raya',
      status: 'AKTIF',
      monthlyVolume: 'Rp 380.000.000',
      activeItems: 4,
    },
    {
      code: 'BR-PDG-003',
      name: 'Cabang Azizi',
      address: 'Jl. Dr. Sutomo No. 88, Azizi, Kota Padang',
      phone: '0751-443344',
      warehouse: 'Gudang Azizi',
      status: 'AKTIF',
      monthlyVolume: 'Rp 290.000.000',
      activeItems: 3,
    },
    {
      code: 'BR-PDG-004',
      name: 'Cabang Ulak Karang',
      address: 'Jl. S. Parman No. 102, Ulak Karang, Padang Utara',
      phone: '0751-444555',
      warehouse: 'Gudang Nanggalo (Sub-Hub)',
      status: 'AKTIF',
      monthlyVolume: 'Rp 210.000.000',
      activeItems: 2,
    },
    {
      code: 'BR-PDG-005',
      name: 'Cabang Andalas',
      address: 'Jl. Andalas No. 64, Padang Timur, Kota Padang',
      phone: '0751-445566',
      warehouse: 'Gudang Azizi (Sub-Hub)',
      status: 'AKTIF',
      monthlyVolume: 'Rp 180.000.000',
      activeItems: 1,
    },
  ];

  const comingSoonBranches = [
    {
      code: 'EXP-SLK-001',
      name: 'Cabang Solok',
      region: 'Kota Solok (Sumatera Barat)',
      targetLaunch: 'Target Q4 2026',
      progress: '70% Renovasi & Perizinan OJK',
      note: 'Ekspansi jaringan regional lintasan Padang - Solok',
    },
    {
      code: 'EXP-PYK-001',
      name: 'Cabang Payakumbuh (PYK)',
      region: 'Kota Payakumbuh (Sumatera Barat)',
      targetLaunch: 'Target Q1 2027',
      progress: '45% Survei Lokasi & Storage Facility',
      note: 'Sentra gadai komoditas emas dan elektronik Luak Limopuluah',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner KPI */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 text-white shadow-sm border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold tracking-wide uppercase">
                Pusat Gadai Swasta Terbesar di Kota Padang
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
                Omzet Rp 1.2 - 1.5 M / Bulan
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Jaringan Cabang & Sentra Gudang Operasional</h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Mengelola 5 unit cabang aktif di Kota Padang dengan dukungan 3 gudang penyimpanan berkeamanan tinggi, serta persiapan ekspansi wilayah Solok dan Payakumbuh (PYK).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-[10px] uppercase font-semibold text-emerald-300">Cabang Aktif Padang</p>
              <p className="text-xl font-bold text-white mt-0.5">5 Cabang</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <p className="text-[10px] uppercase font-semibold text-emerald-300">Sentra Gudang</p>
              <p className="text-xl font-bold text-white mt-0.5">3 Gudang</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-amber-300">Ekspansi Regional</p>
              <p className="text-xl font-bold text-amber-300 mt-0.5">2 Unit (SLK & PYK)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Cabang Aktif Kota Padang */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>5 Cabang Aktif Kota Padang</span>
            </h2>
            <p className="text-xs text-slate-500">Unit operasional layanan nasabah dan penerimaan gadai harian</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Total Estimasi Portofolio: Rp 1.48 Miliar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {padangBranches.map((b) => (
            <Card key={b.code} className="space-y-3.5 bg-white border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-700">{b.code}</span>
                  <Badge variant="success">{b.status}</Badge>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{b.activeItems} Barang Aktif</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">{b.name}</h3>
                <p className="text-xs text-slate-600 flex items-start space-x-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{b.address}</span>
                </p>
                <p className="text-xs text-slate-600 flex items-center space-x-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{b.phone}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                    Penyimpanan:
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{b.warehouse}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Volume Transaksi:</span>
                  <span className="font-bold text-emerald-700">{b.monthlyVolume} / bln</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Section (Solok & Payakumbuh) */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-amber-600" />
            <span>Rencana Ekspansi Regional (Coming Soon)</span>
          </h2>
          <p className="text-xs text-slate-500">Ekspansi jaringan ke luar Kota Padang untuk memperluas jangkauan layanan Sumatera Barat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comingSoonBranches.map((exp) => (
            <Card key={exp.code} className="p-5 bg-gradient-to-br from-amber-50/60 to-slate-50 border border-amber-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-800">{exp.code}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                  COMING SOON
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{exp.name}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{exp.region}</p>
                <p className="text-xs text-slate-500 mt-1 italic">{exp.note}</p>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">{exp.targetLaunch}</span>
                <span className="text-slate-600 font-medium">{exp.progress}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

