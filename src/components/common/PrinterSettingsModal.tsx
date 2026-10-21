import React, { useState, useEffect } from 'react';
import { Printer, Check, Star, Settings, FileText, ExternalLink, HelpCircle, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';

export type PaperFormat = 'UGM_NCR_2PLY' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'A5_STANDARD';

export interface PrinterConfig {
  printerName: string;
  paperFormat: PaperFormat;
  autoPrintReceipt: boolean;
  printTwoCopies: boolean; // 1 lembar UGM & 1 lembar Nasabah
  headerText: string;
  footerText: string;
}

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (cfg: PrinterConfig) => void;
}

export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [config, setConfig] = useState<PrinterConfig>({
    printerName: 'Epson LX-310 (Dot Matrix NCR UGM)',
    paperFormat: 'UGM_NCR_2PLY',
    autoPrintReceipt: true,
    printTwoCopies: true,
    headerText: 'UNIT GADAI MANDIRI (UGM) - PUSAT GADAI SYARIAH',
    footerText: 'Simpan nota ini sebagai tanda bukti hak milik & pengambilan agunan yang sah.',
  });

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'RECOMMENDATIONS'>('SETTINGS');
  const [savedAlert, setSavedAlert] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ugm_printer_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('ugm_printer_config', JSON.stringify(config));
    setSavedAlert(true);
    if (onSaved) onSaved(config);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 1000);
  };

  const handleTestPrint = () => {
    window.print();
  };

  const RECOMMENDED_PRINTERS = [
    {
      id: 'epson-lx310',
      name: 'Epson LX-310 (Dot Matrix 9-Pin Impact)',
      badge: 'Paling Direkomendasikan untuk Kertas UGM Rangkap',
      badgeColor: 'bg-emerald-600 text-white',
      price: 'Rp 2.450.000 - Rp 2.750.000',
      rating: 5.0,
      description:
        'Sangat direkomendasikan untuk format Kertas Continuous Form NCR UGM (2 Rangkap tembus karbon). Sekali cetak langsung keluar Lembar 1 Arsip UGM & Lembar 2 Bukti Nasabah tanpa perlu cetak dua kali.',
      features: [
        'Kapasitas kertas rangkap NCR hingga 5 ply (asli + 4 tembusan)',
        'Biaya operasional pita ribbon sangat murah (~Rp 30.000 tahan 4.000 struk)',
        'Daya tahan sangat tinggi untuk operasional konter gadai harian',
        'Koneksi USB 2.0 & Paralel, kompatibel dengan Windows & Mac',
      ],
      idealFor: 'Kertas Nota UGM NCR 2-Ply & Kertas Pink Resmi',
    },
    {
      id: 'epson-tmt82x',
      name: 'Epson TM-T82X / TM-T88 (Thermal 80mm POS)',
      badge: 'Standar Industri Kasir Cepat',
      badgeColor: 'bg-blue-600 text-white',
      price: 'Rp 1.850.000 - Rp 2.150.000',
      rating: 4.8,
      description:
        'Printer kasir thermal 80mm berkecepatan tinggi dengan pisau pemotong otomatis (auto-cutter). Sangat cocok untuk kasir dengan antrian padat.',
      features: [
        'Kecepatan cetak tinggi 200 mm/detik, hening tanpa suara',
        'Auto-Cutter otomatis memotong nota rapi',
        'Daya tahan head cetak thermal hingga 150 km kertas',
        'Port USB / Ethernet LAN',
      ],
      idealFor: 'Struk Kasir 80mm & Pelayanan Cepat',
    },
    {
      id: 'panda-pos80',
      name: 'Panda POS-80 / Iware 80mm (Bluetooth + USB)',
      badge: 'Pilihan Ekonomis & Fleksibel',
      badgeColor: 'bg-amber-600 text-white',
      price: 'Rp 480.000 - Rp 650.000',
      rating: 4.6,
      description:
        'Printer thermal 80mm terjangkau yang mendukung koneksi kabel USB ke komputer kasir dan Bluetooth ke smartphone/tablet staf lapangan.',
      features: [
        'Koneksi dual: USB ke PC kasir + Bluetooth ke HP Android',
        'Harga sangat ekonomis untuk cabang baru',
        'Lebar cetak struk 80mm jelas terbaca nasabah',
        'Support cetak QR Code dan logo nota UGM',
      ],
      idealFor: 'Cabang Baru & Budget Ekonomis',
    },
    {
      id: 'mobile-pos58',
      name: 'Mini Mobile Bluetooth POS 58mm (Iware MP-58 / RPP02N)',
      badge: 'Portabel / Lapangan',
      badgeColor: 'bg-purple-600 text-white',
      price: 'Rp 250.000 - Rp 350.000',
      rating: 4.5,
      description:
        'Printer mini berdaya baterai charger lithium. Sangat praktis dibawa staf penaksir keliling atau konter kasir mobile.',
      features: [
        'Baterai tahan cetak hingga 200 nota dalam 1 kali charge',
        'Ukuran kecil muat di saku atau tas selempang',
        'Cetak via Bluetooth langsung dari HP petugas',
      ],
      idealFor: 'Penaksir Lapangan & Kasir Mobile',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Pengaturan Printer & Format Kertas Nota UGM" maxWidth="4xl">
      <div className="space-y-4 text-xs font-sans text-slate-700">
        {/* Tab Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 cursor-pointer transition-colors ${
              activeTab === 'SETTINGS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Konfigurasi Kertas & Printer Nota
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`pb-2.5 px-3 font-semibold text-xs border-b-2 cursor-pointer transition-colors ${
              activeTab === 'RECOMMENDATIONS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ★ Rekomendasi Printer Nota Terbaik (Carikan Printer)
          </button>
        </div>

        {activeTab === 'SETTINGS' && (
          <div className="space-y-4">
            {/* Setting Format Kertas UGM */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 text-xs block">
                Format Kertas Cetak Nota UGM (Pilih sesuai kertas fisik yang digunakan):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setConfig({ ...config, paperFormat: 'UGM_NCR_2PLY' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    config.paperFormat === 'UGM_NCR_2PLY'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Kertas UGM NCR 2-Rangkap (Continuous Form)</span>
                    </span>
                    {config.paperFormat === 'UGM_NCR_2PLY' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Format resmi UGM (210 x 140 mm / 9.5" x 5.5"). Lembar 1 Arsip UGM & Lembar 2 Bukti Nasabah dicetak tembus karbon.
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Format Standar UGM
                  </span>
                </div>

                <div
                  onClick={() => setConfig({ ...config, paperFormat: 'THERMAL_80MM' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    config.paperFormat === 'THERMAL_80MM'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>Kertas Kasir Thermal 80mm</span>
                    </span>
                    {config.paperFormat === 'THERMAL_80MM' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Struk kasir POS lebar 80mm dengan logo UGM, QR Code, dan rincian transaksi lengkap.
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    Standar POS Kasir Toko
                  </span>
                </div>

                <div
                  onClick={() => setConfig({ ...config, paperFormat: 'A5_STANDARD' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    config.paperFormat === 'A5_STANDARD'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-pink-600" />
                      <span>Kertas A5 / Kertas Pink Syariah UGM</span>
                    </span>
                    {config.paperFormat === 'A5_STANDARD' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Cetak pada kertas warna pink ukuran A5 (Surat Bukti Gadai Rahn Syariah berkekuatan hukum penuh).
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded">
                    Kertas Pink Asli
                  </span>
                </div>

                <div
                  onClick={() => setConfig({ ...config, paperFormat: 'THERMAL_58MM' })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    config.paperFormat === 'THERMAL_58MM'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Kertas Thermal Mobile 58mm</span>
                    </span>
                    {config.paperFormat === 'THERMAL_58MM' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Struk ringkas lebar 58mm untuk printer Bluetooth portabel penaksir lapangan.
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    Portabel / Mobile
                  </span>
                </div>
              </div>
            </div>

            {/* Opsi Tambahan */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-xs block">Opsi Pencetakan Bukti Fisik:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.printTwoCopies}
                  onChange={(e) => setConfig({ ...config, printTwoCopies: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-800">
                  Cetak 2 Rangkap Otomatis (<strong>Lembar 1: Arsip UGM</strong> & <strong>Lembar 2: Bukti Fisik Nasabah</strong>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoPrintReceipt}
                  onChange={(e) => setConfig({ ...config, autoPrintReceipt: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-800">
                  Munculkan dialog cetak nota otomatis saat transaksi baru berhasil dibuat / dicairkan
                </span>
              </label>
            </div>

            {/* Nama Printer / Teks Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Perangkat Printer Terpilih</label>
                <input
                  type="text"
                  value={config.printerName}
                  onChange={(e) => setConfig({ ...config, printerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Nama Usaha di Header Nota</label>
                <input
                  type="text"
                  value={config.headerText}
                  onChange={(e) => setConfig({ ...config, headerText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rekomendasi Printer Nota Terbaik */}
        {activeTab === 'RECOMMENDATIONS' && (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              💡 <strong>Panduan Pemilihan Printer dari Tim IT:</strong> Untuk operasional Pusat Gadai (UGM) yang membutuhkan bukti fisik arsip kantor dan bukti fisik nasabah, <strong>Epson LX-310 (Dot Matrix)</strong> adalah pilihan terbaik karena mampu mencetak kertas NCR rangkap 2 tembus karbon dalam satu kali jalan. Sedangkan untuk kasir cepat harian, pilih <strong>Epson TM-T82X</strong> atau <strong>Panda POS-80</strong>.
            </div>

            <div className="grid grid-cols-1 gap-3">
              {RECOMMENDED_PRINTERS.map((printer) => (
                <div key={printer.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${printer.badgeColor}`}>
                          {printer.badge}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                          <span className="font-bold text-slate-700">{printer.rating}</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{printer.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700 font-mono block">{printer.price}</span>
                      <span className="text-[10px] text-slate-400">Kisaran Harga Pasar</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{printer.description}</p>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px]">Keunggulan Operasional:</span>
                    {printer.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5 text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Format Ideal: <strong>{printer.idealFor}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({
                          ...config,
                          printerName: printer.name,
                          paperFormat: printer.id === 'epson-lx310' ? 'UGM_NCR_2PLY' : (printer.id === 'mobile-pos58' ? 'THERMAL_58MM' : 'THERMAL_80MM'),
                        });
                        setActiveTab('SETTINGS');
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Pilih Printer Ini
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleTestPrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Test Print Nota</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{savedAlert ? 'Tersimpan!' : 'Simpan Pengaturan Printer'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
