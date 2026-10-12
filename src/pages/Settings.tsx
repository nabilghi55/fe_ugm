import React from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-300">
            Sistem Gadai Syariah (Bebas Bunga / Riba)
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Sistem Syariah, Tarif Ijarah & LTV</h1>
        <p className="text-xs text-slate-500">Konfigurasi operasional berlandaskan Akad Rahn & Ijarah: Biaya Pemeliharaan Barang (Ujrah) dan Biaya Administrasi Riil.</p>
      </div>

      {/* Syariah Compliance Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-emerald-950">Landasan Syariah (Fatwa DSN-MUI No. 25 & 26/DSN-MUI/III/2002)</p>
          <p className="text-emerald-900/85 leading-relaxed text-[11px]">
            Pinjaman diberikan murni tanpa bunga (*Qardh al-Hasan*). Penghasilan usaha diperoleh dari <strong>Akad Ijarah</strong> atas jasa penitipan, penyimpanan di 3 gudang berpengaman, serta perawatan fisik barang gadai (*Marhun*), ditambah biaya administrasi riil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LTV Settings */}
        <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Konfigurasi Batas Pembiayaan (LTV) Kategori</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Smartphone (Elektronik)</span>
              <div className="flex items-center space-x-1">
                <input type="number" defaultValue={70} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-emerald-700 font-bold" />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Laptop & PC</span>
              <div className="flex items-center space-x-1">
                <input type="number" defaultValue={65} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-emerald-700 font-bold" />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Kamera & Lensa</span>
              <div className="flex items-center space-x-1">
                <input type="number" defaultValue={60} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-emerald-700 font-bold" />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Emas & Logam Mulia</span>
              <div className="flex items-center space-x-1">
                <input type="number" defaultValue={85} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right text-emerald-700 font-bold" />
                <span className="text-slate-500">%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Syariah Ijarah & Admin Fee Settings */}
        <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Tarif Jasa Titip (Ijarah) & Biaya Administrasi</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Tarif Ujrah / Biaya Pemeliharaan Barang (% / 30 Hari)</label>
              <input type="number" step="0.1" defaultValue={1.5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" />
              <p className="mt-1 text-[10px] text-slate-400">Biaya riil sewa loker brankas & asuransi penyimpanan, bukan bunga.</p>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Biaya Administrasi Akad Riil (IDR)</label>
              <input type="number" defaultValue={25000} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" />
              <p className="mt-1 text-[10px] text-slate-400">Biaya pencetakan SBG Kertas Pink & registrasi data nasabah.</p>
            </div>
            <div>
              <label className="text-slate-600 font-medium block mb-1">Ganti Rugi Operasional Keterlambatan / Ta'widh (% / Hari)</label>
              <input type="number" step="0.1" defaultValue={0.2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500" />
              <p className="mt-1 text-[10px] text-slate-400">Pengganti biaya penagihan riil, bukan pendapatan ribawi.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer shadow-sm transition-colors">
          <Save className="w-4 h-4" />
          <span>Simpan Tarif Syariah</span>
        </button>
      </div>
    </div>
  );
};

