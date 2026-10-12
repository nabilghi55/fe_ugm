import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, CircleAlert, PackageCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NativeDonut, NativeTrendChart } from '../components/charts/NativeCharts';
import { Skeleton } from '../components/ui/Skeleton';
import { dashboardApi } from '../services/endpoints';
import { DashboardSummary } from '../types';

const trendData = [
  { name: 'Sen', pencairan: 25_000_000, pembayaran: 12_000_000 },
  { name: 'Sel', pencairan: 32_000_000, pembayaran: 18_000_000 },
  { name: 'Rab', pencairan: 45_000_000, pembayaran: 28_000_000 },
  { name: 'Kam', pencairan: 38_000_000, pembayaran: 35_000_000 },
  { name: 'Jum', pencairan: 52_000_000, pembayaran: 42_000_000 },
  { name: 'Sab', pencairan: 60_000_000, pembayaran: 48_000_000 },
  { name: 'Min', pencairan: 20_000_000, pembayaran: 15_000_000 },
];

const categoryData = [
  { name: 'Smartphone', value: 45, color: '#126447' },
  { name: 'Laptop', value: 25, color: '#3b7c6a' },
  { name: 'Emas', value: 15, color: '#bd8124' },
  { name: 'Kamera', value: 10, color: '#64748b' },
  { name: 'Kendaraan', value: 5, color: '#b4533c' },
];

const formatIDR = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((data) => setSummary(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const coverageRatio = useMemo(() => {
    if (!summary?.total_loan_outstanding) return 0;
    return Math.round((summary.total_asset_market_value / summary.total_loan_outstanding) * 100);
  }, [summary]);

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72 rounded-md" />
        <Skeleton className="h-64 w-full rounded-[10px]" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-[10px] lg:col-span-2" />
          <Skeleton className="h-80 rounded-[10px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-7">
      <div className="flex flex-col gap-4 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-300">
              Pusat Gadai Terbesar di Kota Padang
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-300">
              Omzet Rp 1.2 - 1.5 M / Bulan
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-semibold border border-teal-200">
              5 Cabang Padang • 3 Sentra Gudang
            </span>
          </div>
          <h1 className="page-title">Executive Command Center Operasional</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">
            Monitoring perputaran likuiditas, posisi agunan, dan mitigasi risiko kredit lintas 5 cabang Kota Padang & 3 gudang penyimpanan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <CalendarDays className="h-4 w-4 text-[#126447]" strokeWidth={1.8} />
          <span className="capitalize">{currentDate}</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-[10px] bg-[#17261f] text-white" aria-labelledby="portfolio-title">
        <div className="grid lg:grid-cols-[1.35fr_2fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p id="portfolio-title" className="eyebrow text-emerald-200/65">
              Total Outstanding
            </p>
            <p className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-medium leading-none tracking-[-0.05em] tabular-nums">
              {formatIDR(summary?.total_loan_outstanding || 0)}
            </p>
            <div className="mt-8 flex items-center gap-2 text-[11px] text-emerald-100/70">
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
              <span>Portofolio aktif terpantau lintas cabang</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4">
            <div className="border-b border-r border-white/10 p-5 sm:border-b-0 sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">Gadai Aktif</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] tabular-nums">{summary?.active_loans_count || 0}</p>
              <p className="mt-2 text-[10px] text-white/45">kontrak berjalan</p>
            </div>
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">Nilai Agunan</p>
              <p className="mt-3 text-[15px] font-semibold leading-snug tabular-nums">{formatIDR(summary?.total_asset_market_value || 0)}</p>
              <p className="mt-2 text-[10px] text-white/45">coverage {coverageRatio}%</p>
            </div>
            <div className="border-r border-white/10 p-5 sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">Pendapatan</p>
              <p className="mt-3 text-[15px] font-semibold leading-snug tabular-nums">{formatIDR(summary?.interest_income_total || 0)}</p>
              <p className="mt-2 text-[10px] text-white/45">ujrah ijarah & administrasi</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45">Overdue</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#ffb4a3] tabular-nums">{summary?.overdue_count || 0}</p>
              <Link to="/overdue" className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#ffb4a3] hover:text-white">
                Tinjau risiko <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid border-t border-white/10 sm:grid-cols-3">
          {[
            ['Pencairan Hari Ini', formatIDR(summary?.today_disbursement || 0)],
            ['Pembayaran Hari Ini', formatIDR(summary?.today_payment || 0)],
            ['Pinjaman Selesai', `${summary?.completed_loans_count || 0} kontrak`],
          ].map(([label, value], index) => (
            <div key={label} className={`flex items-center justify-between px-6 py-4 ${index < 2 ? 'border-b border-white/10 sm:border-b-0 sm:border-r' : ''}`}>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/45">{label}</span>
              <span className="text-[12px] font-semibold tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(310px,0.85fr)]">
        <section className="rounded-[10px] border border-slate-200 bg-white" aria-labelledby="cashflow-title">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 id="cashflow-title" className="text-[14px] font-semibold text-slate-950">Arus kas 7 hari</h2>
              <p className="mt-1 text-[11px] text-slate-500">Pencairan dibanding pembayaran masuk</p>
            </div>
            <div className="flex gap-4 text-[10px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#17261f]" />Pencairan</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#2f8a67]" />Pembayaran</span>
            </div>
          </div>

          <div className="h-[330px] px-2 pb-4 pt-6 sm:px-5">
            <NativeTrendChart
              labels={trendData.map((item) => item.name)}
              series={[
                { name: 'Pencairan', values: trendData.map((item) => item.pencairan), color: '#17261f', fill: '#e3e9e4' },
                { name: 'Pembayaran', values: trendData.map((item) => item.pembayaran), color: '#2f8a67', fill: '#dceee6' },
              ]}
              formatValue={formatIDR}
              ariaLabel="Grafik pencairan dan pembayaran selama tujuh hari"
            />
          </div>
        </section>

        <section className="rounded-[10px] border border-slate-200 bg-white" aria-labelledby="category-title">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 id="category-title" className="text-[14px] font-semibold text-slate-950">Komposisi agunan</h2>
            <p className="mt-1 text-[11px] text-slate-500">Sebaran barang yang tersimpan</p>
          </div>
          <div className="grid items-center gap-3 p-5 sm:grid-cols-[150px_1fr] xl:grid-cols-1 2xl:grid-cols-[150px_1fr]">
            <div className="mx-auto">
              <NativeDonut items={categoryData} value={summary?.stored_assets_count || 0} label="unit" />
            </div>
            <div className="space-y-2.5">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">{category.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="grid border-y border-slate-300 md:grid-cols-3" aria-label="Ringkasan operasional">
        <Link to="/customers" className="group flex items-center gap-4 border-b border-slate-300 px-2 py-5 transition-colors duration-150 hover:bg-white md:border-b-0 md:border-r md:px-5">
          <Users className="h-5 w-5 text-[#126447]" strokeWidth={1.7} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Nasabah Terdaftar</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 tabular-nums">{summary?.total_customers || 0}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#126447]" />
        </Link>
        <Link to="/inventory" className="group flex items-center gap-4 border-b border-slate-300 px-2 py-5 transition-colors duration-150 hover:bg-white md:border-b-0 md:border-r md:px-5">
          <PackageCheck className="h-5 w-5 text-[#126447]" strokeWidth={1.7} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Barang di Gudang</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 tabular-nums">{summary?.stored_assets_count || 0}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#126447]" />
        </Link>
        <Link to="/overdue" className="group flex items-center gap-4 px-2 py-5 transition-colors duration-150 hover:bg-white md:px-5">
          <CircleAlert className="h-5 w-5 text-[#b42318]" strokeWidth={1.7} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Butuh Tindakan</p>
            <p className="mt-1 text-lg font-semibold text-[#b42318] tabular-nums">{summary?.overdue_count || 0}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#b42318]" />
        </Link>
      </section>
    </div>
  );
};
