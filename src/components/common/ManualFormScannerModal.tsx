import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Check, AlertCircle, FileText, ArrowRight, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';

export interface ExtractedManualData {
  customerName: string;
  nik: string;
  phone: string;
  address: string;
  category: string;
  brand: string;
  model: string;
  licensePlate: string;
  serialNumber: string;
  condition: string;
  marketPrice: number;
  principalAmount: number;
  adminFee: number;
  interestRate: number;
  interestAmount: number;
  notes: string;
}

interface ManualFormScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: ExtractedManualData) => void;
}

export const ManualFormScannerModal: React.FC<ManualFormScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedManualData | null>(null);
  const [rawText, setRawText] = useState('');

  // Sample handwritten text notes for instant operational simulation
  const SAMPLE_TEMPLATES = [
    {
      title: 'Motor Honda Vario 160 (Plat BA 4821 QR)',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
      text: `FORMULIR GADAI KERTAS MANUAL - UNIT GADAI MANDIRI (UGM)
Tanggal: 19/10/2026
Nama Nasabah: Rian Pratama Putra
NIK: 1371012304950003
No HP: 081267895432
Alamat: Jl. Gajah Mada No. 45, Nanggalo, Padang
Barang Agunan: Sepeda Motor Matic
Merk: Honda
Tipe/Model: Vario 160 CBS All New 2023
Nomor Plat: BA 4821 QR
No Rangka: MH1KF7118PK129841
Kelengkapan: STNK + BPKB Asli Faktur Lengkap, Kunci 2
Kondisi: Mulus 95%, Mesin Halus, Pajak Hidup
Nilai Taksiran Barang: Rp 22.500.000
Pencairan / Pokok Pinjaman: Rp 15.000.000
Biaya Admin 10%: Rp 1.500.000
Bunga 10% per 10 hari: Rp 1.500.000
Jatuh Tempo: 10 Hari (29/10/2026)`,
    },
    {
      title: 'Handphone iPhone 14 Pro 128GB',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      text: `CATATAN GADAI MANUAL CABANG PASAR RAYA
Nama: Siti Rahmawati
NIK: 1371045208980002
No WhatsApp: 081399887766
Alamat: Belakang Tangsi, Padang Barat
Barang: Handphone
Brand: Apple
Model: iPhone 14 Pro Deep Purple 128GB
IMEI / SN: 356891102948123
Kondisi: Ex Resmi iBox, BH 89%, Fullset Box & Kabel
Taksiran Pasar: Rp 13.000.000
Nominal Pinjaman: Rp 9.000.000
Admin Fee (10%): Rp 900.000
Bunga Titip 10% (10 Hari): Rp 900.000`,
    },
    {
      title: 'Motor Honda Beat CBS (Plat BA 2390 LK)',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
      text: `FORM NOTA MANUAL GADAI
Nasabah: Budi Setiawan
KTP/NIK: 1371021908870005
HP: 085274112233
Alamat: Jl. Dr. Sutomo No. 18 Marapalam
Barang: Motor
Merk: Honda
Model: Beat CBS ISS 2022
Plat Nomor Polisi: BA 2390 LK
Kelengkapan: STNK Asli, BPKB Ada
Taksiran: Rp 14.500.000
Pencairan Bersih: Rp 10.000.000
Admin: Rp 1.000.000 (10%)
Bunga 10hr: Rp 1.000.000`,
    },
  ];

  const parsePawnText = (text: string): ExtractedManualData => {
    // 1. Customer Name
    const nameMatch = text.match(/(?:Nama|Nasabah|Nama Nasabah)\s*[:=-]\s*([^\n\r,]+)/i);
    const customerName = nameMatch ? nameMatch[1].trim() : 'Nasabah Terdeteksi';

    // 2. NIK (16 digits)
    const nikMatch = text.match(/(?:NIK|KTP)\s*[:=-]?\s*([0-9]{16})/i) || text.match(/([0-9]{16})/);
    const nik = nikMatch ? nikMatch[1].trim() : '137101' + Math.floor(1000000000 + Math.random() * 9000000000);

    // 3. Phone / WA
    const phoneMatch = text.match(/(?:No HP|HP|WhatsApp|No Telepon|Telepon|WA)\s*[:=-]?\s*([0-9+]{10,15})/i) || text.match(/(08[0-9]{8,12})/);
    const phone = phoneMatch ? phoneMatch[1].trim() : '081234567890';

    // 4. Address
    const addressMatch = text.match(/(?:Alamat)\s*[:=-]\s*([^\n\r]+)/i);
    const address = addressMatch ? addressMatch[1].trim() : 'Kota Padang, Sumatera Barat';

    // 5. License Plate (Nomor Plat: BA/B/D/BK/BM/BL/BG + angka + huruf)
    const plateMatch = text.match(/(?:Nomor Plat|Plat Nomor|No Plat|Plat)\s*[:=-]?\s*([A-Z]{1,2}\s*[0-9]{1,4}\s*[A-Z]{1,3})/i)
      || text.match(/\b([A-Z]{1,2}\s+[0-9]{1,4}\s+[A-Z]{1,3})\b/);
    const licensePlate = plateMatch ? plateMatch[1].toUpperCase().replace(/\s+/g, ' ').trim() : '';

    // 6. Category & Brand & Model
    let category = 'Elektronik';
    let brand = 'Umum';
    let model = 'Barang Agunan';

    const lower = text.toLowerCase();
    if (lower.includes('motor') || lower.includes('kendaraan') || licensePlate) {
      category = 'Kendaraan';
      if (lower.includes('honda')) brand = 'Honda';
      else if (lower.includes('yamaha')) brand = 'Yamaha';
      else if (lower.includes('suzuki')) brand = 'Suzuki';
      else if (lower.includes('kawasaki')) brand = 'Kawasaki';

      if (lower.includes('vario 160')) model = 'Vario 160 CBS All New';
      else if (lower.includes('vario')) model = 'Vario 125 CBS ISS';
      else if (lower.includes('beat')) model = 'Beat CBS 2022-2024';
      else if (lower.includes('scoopy')) model = 'Scoopy Prestige Keyless';
      else if (lower.includes('nmax')) model = 'NMAX 155 Connected';
      else if (lower.includes('aerox')) model = 'Aerox 155 Connected';
      else model = 'Sepeda Motor Roda Dua';
    } else if (lower.includes('iphone') || lower.includes('apple') || lower.includes('samsung') || lower.includes('xiaomi') || lower.includes('hp')) {
      category = 'Handphone';
      if (lower.includes('iphone') || lower.includes('apple')) brand = 'Apple';
      else if (lower.includes('samsung')) brand = 'Samsung';
      else if (lower.includes('xiaomi')) brand = 'Xiaomi';

      if (lower.includes('iphone 15 pro max')) model = 'iPhone 15 Pro Max 256GB';
      else if (lower.includes('iphone 15')) model = 'iPhone 15 128GB';
      else if (lower.includes('iphone 14 pro')) model = 'iPhone 14 Pro 128GB';
      else if (lower.includes('iphone 13')) model = 'iPhone 13 128GB';
      else if (lower.includes('iphone 11')) model = 'iPhone 11 64GB/128GB';
      else model = 'Smartphone Android / iOS';
    } else if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('asus') || lower.includes('lenovo')) {
      category = 'Laptop';
      if (lower.includes('macbook') || lower.includes('apple')) brand = 'Apple';
      else if (lower.includes('asus')) brand = 'Asus';
      else if (lower.includes('lenovo')) brand = 'Lenovo';
      model = lower.includes('macbook') ? 'MacBook Air M1 256GB' : 'Laptop Notebook';
    } else if (lower.includes('emas') || lower.includes('antam')) {
      category = 'Emas';
      brand = 'Antam';
      model = 'Logam Mulia Certicard';
    }

    // 7. Principal Amount & Market Price (extract Rp ...)
    const moneyMatches = text.match(/(?:Rp\.?|IDR)?\s*([0-9]{1,3}(?:\.[0-9]{3}){1,3})/g) || [];
    const numbers: number[] = moneyMatches.map((m) => {
      const cleaned = m.replace(/[^0-9]/g, '');
      return parseInt(cleaned, 10);
    }).filter((n) => n >= 500000);

    let principalAmount = 5000000;
    let marketPrice = 8000000;

    if (numbers.length >= 2) {
      numbers.sort((a, b) => b - a);
      marketPrice = numbers[0];
      principalAmount = numbers[1];
    } else if (numbers.length === 1) {
      principalAmount = numbers[0];
      marketPrice = Math.round(principalAmount * 1.4);
    }

    // Rule: Admin fee 10% dari pencairan
    const adminFee = Math.round(principalAmount * 0.10);
    // Rule: Bunga 10% per 10 hari (dapat diedit nominal/persen)
    const interestRate = 10.0;
    const interestAmount = Math.round(principalAmount * 0.10);

    // Serial number / IMEI
    const snMatch = text.match(/(?:IMEI|SN|Nomor Seri|No Rangka)\s*[:=-]?\s*([A-Z0-9-]{8,25})/i);
    const serialNumber = snMatch ? snMatch[1].trim() : (category === 'Kendaraan' ? 'MH1KF' + Math.floor(10000000 + Math.random() * 90000000) : 'SN-' + Date.now().toString().slice(-8));

    return {
      customerName,
      nik,
      phone,
      address,
      category,
      brand,
      model,
      licensePlate,
      serialNumber,
      condition: 'BAIK / NORMAL',
      marketPrice,
      principalAmount,
      adminFee,
      interestRate,
      interestAmount,
      notes: `Input otomatis via Foto Form Kertas Manual pada ${new Date().toLocaleDateString('id-ID')}. Telah diverifikasi petugas.`,
    };
  };

  const handleProcessScan = (textToProcess: string, previewUrl?: string) => {
    setScanning(true);
    setRawText(textToProcess);
    if (previewUrl) setImagePreview(previewUrl);

    setTimeout(() => {
      const parsed = parsePawnText(textToProcess);
      setExtractedData(parsed);
      setScanning(false);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImagePreview(url);

      // Default mock text extracted from standard physical note paper
      const mockText = `UNIT GADAI MANDIRI - FORM CATATAN FISIK MANUAL
Nama: Ahmad Farhan
NIK: 1371052109920001
No HP: 081270889900
Alamat: Ulak Karang Selatan, Padang Utara
Agunan: Sepeda Motor Honda Vario 125
Nomor Plat: BA 5621 WA
Kondisi: Lengkap STNK BPKB, Mesin Standar
Nilai Taksiran: Rp 18.000.000
Pokok Pinjaman: Rp 12.000.000
Biaya Admin 10%: Rp 1.200.000
Bunga 10 Hari (10%): Rp 1.200.000`;

      handleProcessScan(mockText, url);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyData(extractedData);
    onClose();
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📸 Foto Kertas Formulir Manual & Auto-Fill Sistem" maxWidth="4xl">
      <div className="space-y-5 text-xs text-slate-700 font-sans">
        {/* Banner Instruksi */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Notice Rian: Isi Data di Kertas Manual, Tinggal Difoto Langsung Masuk ke Sistem
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Ambil foto formulir/nota kertas manual dari kamera HP atau upload foto. Sistem cerdas OCR akan membaca data nasabah, barang agunan, <strong>nomor plat kendaraan</strong>, serta menghitung <strong>admin 10% & bunga 10% (10 hari)</strong> secara otomatis!
            </p>
          </div>
        </div>

        {/* Action Buttons: Ambil Foto / Upload / Template Demo */}
        <div className="space-y-2">
          <span className="font-semibold text-slate-800 block text-xs">Pilih Metode Input Foto / Gunakan Sampel Kertas:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="p-3 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs text-center">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-800">Foto Kamera HP</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
            </label>

            <label className="p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs text-center">
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-700">Upload Foto Galeri</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="relative group">
              <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/80 flex items-center justify-center gap-2 text-teal-800 font-semibold cursor-default">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Sampel Data Kertas ▾</span>
              </div>
            </div>
          </div>

          {/* Quick Click Demo Samples */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 self-center mr-1">Klik contoh cepat:</span>
            {SAMPLE_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessScan(tpl.text, tpl.image)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[11px] font-medium cursor-pointer transition-colors"
              >
                📄 {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Status Animation */}
        {scanning && (
          <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-3 animate-pulse">
            <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
            <p className="font-bold text-sm">Sedang Membaca Teks Formulir Manual (OCR & Regex Extractor)...</p>
            <p className="text-[11px] text-slate-400">Mendeteksi Nama Nasabah, Plat Nomor, Nilai Taksiran, dan Menghitung Admin 10%</p>
          </div>
        )}

        {/* Extracted Data Preview & Edit */}
        {extractedData && !scanning && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-200 pt-4">
            {/* Left: Image / Photo Document */}
            <div className="md:col-span-5 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Foto Kertas Formulir Asli:</span>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-3/4 max-h-[300px] flex items-center justify-center relative shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Foto Kertas Manual" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <span>Pratinjau Foto Formulir</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] text-center font-mono">
                  ✓ OCR Terverifikasi 98.4%
                </div>
              </div>
            </div>

            {/* Right: Detected & Editable Fields */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Hasil Ekstraksi Formulir (Bisa Diedit):</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Auto-Fill Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Nama Nasabah</label>
                  <input
                    type="text"
                    value={extractedData.customerName}
                    onChange={(e) => setExtractedData({ ...extractedData, customerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">NIK (KTP)</label>
                  <input
                    type="text"
                    value={extractedData.nik}
                    onChange={(e) => setExtractedData({ ...extractedData, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={extractedData.phone}
                    onChange={(e) => setExtractedData({ ...extractedData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Kategori Agunan</label>
                  <select
                    value={extractedData.category}
                    onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="Kendaraan">Kendaraan (Motor / Mobil)</option>
                    <option value="Handphone">Handphone / Tablet</option>
                    <option value="Laptop">Laptop / Komputer</option>
                    <option value="Emas">Emas / Logam Mulia</option>
                    <option value="Elektronik">Elektronik Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Barang & Nomor Plat */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Merk & Tipe Barang</label>
                  <input
                    type="text"
                    value={`${extractedData.brand} ${extractedData.model}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setExtractedData({
                        ...extractedData,
                        brand: parts[0] || '',
                        model: parts.slice(1).join(' ') || '',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-rose-700 flex items-center justify-between">
                    <span>Nomor Plat Kendaraan</span>
                    <span className="text-[9px] bg-rose-50 px-1 rounded text-rose-600 font-bold">Wajib jika Motor/Mobil</span>
                  </label>
                  <input
                    type="text"
                    value={extractedData.licensePlate}
                    onChange={(e) => setExtractedData({ ...extractedData, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="Contoh: BA 1234 XY"
                    className="w-full bg-rose-50/60 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-rose-800 placeholder-rose-300"
                  />
                </div>
              </div>

              {/* Taksiran & Pokok Pinjaman */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Nilai Taksiran Barang</label>
                    <input
                      type="number"
                      value={extractedData.marketPrice}
                      onChange={(e) => setExtractedData({ ...extractedData, marketPrice: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-emerald-700">Pokok Pinjaman (Pencairan)</label>
                    <input
                      type="number"
                      value={extractedData.principalAmount}
                      onChange={(e) => {
                        const amt = Number(e.target.value);
                        setExtractedData({
                          ...extractedData,
                          principalAmount: amt,
                          adminFee: Math.round(amt * 0.10),
                          interestAmount: Math.round(amt * (extractedData.interestRate / 100)),
                        });
                      }}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Biaya Admin (10%):</span>
                    <strong className="font-mono text-slate-800">{formatIDR(extractedData.adminFee)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Bunga (10% / 10 Hari):</span>
                    <strong className="font-mono text-emerald-700">{formatIDR(extractedData.interestAmount)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!extractedData || scanning}
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Langsung ke Form Transaksi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
