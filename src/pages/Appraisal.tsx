import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { assetApi, marketPriceApi, appraisalApi } from '../services/endpoints';
import { Asset, MarketPriceResult } from '../types';
import { useAlert } from '../context/AlertContext';

export const Appraisal: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { showSuccess, showError } = useAlert();

  // Market Engine Result State
  const [marketResult, setMarketResult] = useState<MarketPriceResult | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);

  // Right Form State
  const [conditionAdjustmentPercent, setConditionAdjustmentPercent] = useState<number>(-5);
  const [appraiserPrice, setAppraiserPrice] = useState<number>(0);
  const [appraiserNotes, setAppraiserNotes] = useState('');
  const [ltvPercent, setLtvPercent] = useState<number>(70);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    assetApi.list().then((res) => {
      setAssets(res.data);
      if (res.data.length > 0) {
        setSelectedAssetId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      assetApi.get(selectedAssetId).then((asset) => {
        setSelectedAsset(asset);
        if (asset.category?.ltv_percent) {
          setLtvPercent(asset.category.ltv_percent);
        }
        fetchMarketIntelligence(asset);
      });
    }
  }, [selectedAssetId]);

  const fetchMarketIntelligence = (asset: Asset) => {
    setLoadingMarket(true);
    marketPriceApi
      .search({
        brand: asset.brand,
        model: asset.model,
        variant: asset.variant,
        condition: asset.physical_condition,
      })
      .then((res) => {
        setMarketResult(res);
        const rec = res.recommended_price;
        const adjusted = rec * (1 + conditionAdjustmentPercent / 100);
        setAppraiserPrice(Math.round(adjusted));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingMarket(false));
  };

  const handleConditionChange = (percent: number) => {
    setConditionAdjustmentPercent(percent);
    if (marketResult) {
      const rec = marketResult.recommended_price;
      const adjusted = rec * (1 + percent / 100);
      setAppraiserPrice(Math.round(adjusted));
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const calculatedMaxLoan = Math.round(appraiserPrice * (ltvPercent / 100));
  const calculatedRecLoan = Math.round(calculatedMaxLoan * 0.95);

  const handleSubmitAppraisal = async () => {
    if (!selectedAsset || !marketResult) return;
    setSubmitting(true);
    try {
      await appraisalApi.create({
        asset_id: selectedAsset.id,
        market_price: marketResult.recommended_price,
        market_price_min: marketResult.minimum_price,
        market_price_max: marketResult.maximum_price,
        market_confidence: marketResult.confidence_score,
        historical_price: marketResult.historical_price,
        condition_adjustment_percent: conditionAdjustmentPercent,
        appraiser_price: appraiserPrice,
        appraiser_notes: appraiserNotes,
        loan_to_value: ltvPercent,
      });

      showSuccess('Appraisal berhasil disimpan! Mengarahkan ke pembuatan transaksi gadai...', 'Penafsiran Selesai');
      navigate('/pawn-transactions');
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Menyimpan Appraisal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appraisal & Decision Support Engine</h1>
          <p className="text-xs text-slate-500">Pemeriksaan fisik barang, Market Price Intelligence, dan kalkulasi otomatis Loan-To-Value (LTV)</p>
        </div>

        {/* Asset Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Pilih Barang:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.asset_code} - {a.brand} {a.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Asset Details & Photos & Inspections (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">1. Detail Barang & Inspeksi</h3>
            
            {selectedAsset && (
              <div className="space-y-3">
                <div className="h-44 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
                  {selectedAsset.photos && selectedAsset.photos.length > 0 && selectedAsset.photos[0].view_url ? (
                    <img src={selectedAsset.photos[0].view_url} alt={selectedAsset.model} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Dokumentasi Foto</div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-mono text-emerald-700 font-bold border border-emerald-200">
                    {selectedAsset.asset_code}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-800 text-sm">{selectedAsset.brand} {selectedAsset.model}</p>
                  <p className="text-slate-500">{selectedAsset.variant} • Tahun {selectedAsset.year || 2024}</p>
                  <p className="text-slate-400 font-mono">IMEI/SN: {selectedAsset.imei || selectedAsset.serial_number || '-'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">Hasil Checklist Pemeriksaan:</span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {selectedAsset.inspections?.map((insp) => (
                      <div key={insp.id} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-700 font-medium">{insp.item_name}</span>
                        <Badge variant={insp.status === 'GOOD' ? 'success' : insp.status === 'FAIR' ? 'info' : 'danger'}>
                          {insp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* CENTER COLUMN: Market Intelligence & Comparable Listings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>2. Market Price Intelligence</span>
              </h3>
              <Badge variant="purple">Confidence: {marketResult?.confidence_score || 0}%</Badge>
            </div>

            {loadingMarket ? (
              <div className="py-12 text-center text-xs text-slate-400">Mengkalkulasi harga pasar second...</div>
            ) : marketResult ? (
              <div className="space-y-4">
                {/* Recommended Price Display Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                  <span className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">Rekomendasi Harga Pasar Second (Median Trimmed)</span>
                  <h2 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{formatIDR(marketResult.recommended_price)}</h2>
                  <p className="text-[11px] text-slate-600">
                    Rentang Pasar: <strong className="text-slate-800">{formatIDR(marketResult.minimum_price)}</strong> — <strong className="text-slate-800">{formatIDR(marketResult.maximum_price)}</strong>
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Median Price Listing</span>
                    <span className="font-bold text-slate-800">{formatIDR(marketResult.median_price)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Trimmed Mean Price</span>
                    <span className="font-bold text-slate-800">{formatIDR(marketResult.trimmed_mean_price)}</span>
                  </div>
                </div>

                {/* Comparable Listings Table */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">Data Comparable Marketplace Verified ({marketResult.comparable_count} listing):</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {marketResult.comparables.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-800 block truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500">{item.source} • {item.location}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-emerald-700 block">{formatIDR(item.price)}</span>
                          <span className="text-[10px] text-emerald-600 font-mono">Similarity: {item.similarity_score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        {/* RIGHT COLUMN: Final Appraisal & LTV & Recommended Loan (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">3. Final Appraisal & LTV</h3>

            {/* Condition Adjustment Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Penyesuaian Kondisi (%)</span>
                <span className="text-emerald-600 font-mono font-bold">{conditionAdjustmentPercent}%</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, -5, -10, -15, -20, -30].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleConditionChange(p)}
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                      conditionAdjustmentPercent === p
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Appraiser Price Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Harga Appraisal Final Appraiser (IDR)</label>
              <input
                type="number"
                value={appraiserPrice}
                onChange={(e) => setAppraiserPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* LTV & Maximum Loan Breakdown: "Berapa Cairnya?" */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-slate-800">Skema Pencairan ("Berapa Cairnya?")</span>
                <span className="font-mono text-[11px] font-bold text-emerald-700">LTV {ltvPercent}%</span>
              </div>

              {/* 3 Tiers of Disbursement */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">1. Pencairan Konservatif (Aman)</span>
                    <span className="text-[11px] text-slate-600">85% dari plafon (nasabah baru/risiko)</span>
                  </div>
                  <span className="font-bold text-slate-800">{formatIDR(Math.round(calculatedMaxLoan * 0.85))}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-300">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">2. Rekomendasi Standar</span>
                    <span className="text-[11px] text-emerald-700">95% plafon (taksiran wajar kantor)</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[13px]">{formatIDR(calculatedRecLoan)}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Plafon Maksimal Otorisasi</span>
                    <span className="text-[11px] text-slate-600">Batas atas LTV kategori aset</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatIDR(calculatedMaxLoan)}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                <span>Estimasi Biaya Titip / Ijarah (1.2% / bln):</span>
                <span className="font-semibold text-emerald-800 font-mono">{formatIDR(Math.round(calculatedRecLoan * 0.012))}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Catatan Appraiser</label>
              <textarea
                rows={3}
                value={appraiserNotes}
                onChange={(e) => setAppraiserNotes(e.target.value)}
                placeholder="Layar mulus, garansi iBox aktif..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              onClick={handleSubmitAppraisal}
              disabled={submitting || !selectedAsset}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Konfirmasi & Simpan Appraisal'}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
