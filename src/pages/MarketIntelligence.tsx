import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { NativeTrendChart } from '../components/charts/NativeCharts';
import { Card } from '../components/ui/Card';
import { marketPriceApi } from '../services/endpoints';
import { MarketPriceResult } from '../types';

export const MarketIntelligence: React.FC = () => {
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [result, setResult] = useState<MarketPriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await marketPriceApi.search({ brand, model });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const historicalChartData = [
    { month: 'Jun', price: 16200000 },
    { month: 'Jul', price: 15800000 },
    { month: 'Agu', price: 15200000 },
    { month: 'Sep', price: 14700000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Market Price Intelligence Dashboard</h1>
        <p className="text-xs text-slate-500">Analisis tren harga pasar barang second, outlier filtering, dan confidence scoring</p>
      </div>

      {/* Search Input Card */}
      <Card className="p-4 bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-slate-600 font-semibold">Merek / Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-slate-600 font-semibold">Model Barang</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold self-end cursor-pointer shadow-sm transition-colors">
            {loading ? 'Mencari...' : 'Cari Intelligence Pasar'}
          </button>
        </form>
      </Card>

      {/* Product Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">Current Median Price</span>
          <h3 className="text-xl font-bold text-emerald-700 mt-1">{result ? formatIDR(result.median_price) : 'Rp 14.700.000'}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Stability Index High
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">Market Confidence Score</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">{result ? `${result.confidence_score}%` : '87%'}</h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Berdasarkan {result ? result.comparable_count : 18} listing terverifikasi</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">Perubahan 30-Hari</span>
          <h3 className="text-xl font-bold text-amber-600 mt-1 flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1 text-amber-600" /> -3.2%
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Depresiasi wajar barang elektronik</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 block">Perubahan 90-Hari</span>
          <h3 className="text-xl font-bold text-rose-600 mt-1 flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1 text-rose-600" /> -9.1%
          </h3>
          <span className="text-[11px] text-slate-500 mt-1 block">Tren pasar 3 bulan terakhir</span>
        </Card>
      </div>

      {/* Historical Trend Chart Card */}
      <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Grafik Historis Tren Harga (4 Bulan Terakhir)</h3>
            <p className="text-xs text-slate-500">Tracking depresiasi dan harga pasar aktual</p>
          </div>
        </div>

        <div className="h-64">
          <NativeTrendChart
            labels={historicalChartData.map((item) => item.month)}
            series={[{ name: 'Harga pasar', values: historicalChartData.map((item) => item.price), color: '#126447' }]}
            formatValue={formatIDR}
            ariaLabel="Grafik tren harga pasar empat bulan terakhir"
          />
        </div>
      </Card>
    </div>
  );
};
