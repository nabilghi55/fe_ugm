import React, { useState } from 'react';
import { Printer, MessageCircle, Share2, Check, Copy, ArrowRight, ShieldCheck, Scissors } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { QRCodeView } from './QRCodeView';
import { PawnTransaction } from '../../types';

interface UGMReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  pawn: PawnTransaction | null;
}

export const UGMReceiptModal: React.FC<UGMReceiptModalProps> = ({
  isOpen,
  onClose,
  pawn,
}) => {
  const [copiedWA, setCopiedWA] = useState(false);

  if (!pawn) return null;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const branchName = pawn.branch?.name || 'Cabang Nanggalo (Pusat Padang)';
  const branchAddress = pawn.branch?.address || 'Jl. Siteba No. 12, Nanggalo, Kota Padang';
  const branchPhone = pawn.branch?.phone || '0751-441122';
  const customerName = pawn.customer?.full_name || 'Nasabah UGM';
  const customerPhone = pawn.customer?.phone || pawn.customer?.whatsapp || '';
  const customerNik = pawn.customer?.nik || '-';
  const customerAddress = pawn.customer?.address || 'Kota Padang';

  const assetBrand = pawn.appraisal?.asset?.brand || 'Barang';
  const assetModel = pawn.appraisal?.asset?.model || 'Agunan';
  const assetVariant = pawn.appraisal?.asset?.variant || '';
  const licensePlate = pawn.appraisal?.asset?.license_plate || '';
  const serialNumber = pawn.appraisal?.asset?.serial_number || pawn.appraisal?.asset?.imei || '-';
  const physicalCondition = pawn.appraisal?.asset?.physical_condition || 'BAIK / NORMAL';

  const principal = pawn.principal_amount || 0;
  // Admin fee default 10%
  const adminFee = pawn.administration_fee || Math.round(principal * 0.10);
  // Bunga 10% per 10 hari (dapat disesuaikan)
  const interestRate = pawn.interest_rate || 10.0;
  const interestAmount = pawn.interest_amount || Math.round(principal * (interestRate / 100.0));
  const netDisbursement = principal - adminFee;

  const sbgNumber = `SBG-UGM-${pawn.pawn_number.replace('PWN-', '')}`;
  const loanDateStr = new Date(pawn.loan_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const dueDateStr = new Date(pawn.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  // Template Pesan WhatsApp Resmi UGM
  const generateWAMessage = () => {
    return `*SURAT BUKTI GADAI ELEKTRONIK (SBG) - UNIT GADAI MANDIRI (UGM)*
------------------------------------------------
Yth. Bpk/Ibu *${customerName}*,
Terima kasih telah bertransaksi di *Unit Gadai Mandiri (UGM)*. Berikut kami sampaikan tanda bukti nota transaksi gadai Anda:

📌 *DATA TRANSAKSI:*
• No. Registrasi SBG: *${sbgNumber}*
• No. Transaksi: ${pawn.pawn_number}
• Tanggal Akad: ${loanDateStr}
• Tanggal Jatuh Tempo: *${dueDateStr}* (Siklus 10 Hari)
• Unit Cabang: ${branchName}

📦 *DATA BARANG AGUNAN:*
• Barang: *${assetBrand} ${assetModel} ${assetVariant}*
${licensePlate ? `• *NOMOR PLAT KENDARAAN:* *${licensePlate}*\n` : ''}• No. Seri / IMEI: ${serialNumber}
• Kondisi: ${physicalCondition}

💰 *RINCIAN POKOK & BIAYA:*
• Pokok Pinjaman: *${formatIDR(principal)}*
• Biaya Administrasi (10%): ${formatIDR(adminFee)}
• Bunga / Jasa Titip (10% / 10 Hari): ${formatIDR(interestAmount)} (Bisa disesuaikan)
• *Pencairan Bersih Diterima:* *${formatIDR(netDisbursement)}*

⚠️ *KETENTUAN PENEBUSAN & PERPANJANGAN:*
1. Pembayaran lewat 10 hari wajib diperpanjang dengan biaya admin 10% dari pinjaman pokok.
2. Pengambilan agunan wajib menunjukkan KTP asli dan bukti fisik nota ini.
3. Hubungi CS Cabang: ${branchPhone}

Simpan pesan ini sebagai bukti sah Anda.
_Unit Gadai Mandiri - Solusi Aman, Terpercaya, & Berkah._`;
  };

  const handleSendWA = () => {
    let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const textEncoded = encodeURIComponent(generateWAMessage());
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${textEncoded}`
      : `https://wa.me/?text=${textEncoded}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyWA = () => {
    navigator.clipboard.writeText(generateWAMessage());
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📄 Nota Bukti Gadai UGM (Cetak Fisik 2 Lembar & WA)" maxWidth="4xl">
      <div className="space-y-4 font-sans text-xs text-slate-800">
        {/* Top Control Bar: WA & Print Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">Aksi Cepat:</span>
            <button
              type="button"
              onClick={handleSendWA}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Kirim Nota ke WA Nasabah</span>
            </button>
            <button
              type="button"
              onClick={handleCopyWA}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedWA ? 'Tersalin!' : 'Salin Pesan WA'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">2 Lembar: Arsip UGM + Bukti Nasabah</span>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Bukti Fisik Sekarang</span>
            </button>
          </div>
        </div>

        {/* Printable Area: Dua Rangkap (Lembar UGM & Lembar Nasabah) */}
        <div id="printable-ugm-receipt" className="space-y-6 print:m-0 print:p-0">
          {/* ================= LEMBAR 1: BUKTI FISIK UGM (ARSIP KANTOR) ================= */}
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-300 shadow-sm space-y-3.5 print:border-black print:p-2 print:shadow-none">
            {/* Header / Kop Nota */}
            <div className="border-b-2 border-slate-800 pb-2.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-black text-[10px] tracking-wider uppercase">
                    LEMBAR 1: BUKTI FISIK UGM (ARSIP KANTOR)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">AKAD RAHN SYARIAH (10 HARI)</span>
                </div>
                <h2 className="text-base font-black text-slate-900 mt-1 tracking-tight">UNIT GADAI MANDIRI (UGM)</h2>
                <p className="text-[11px] text-slate-600">
                  {branchName} · {branchAddress} · Telp: {branchPhone}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">No. SBG UGM:</span>
                <span className="text-sm font-mono font-black text-emerald-800 block">{sbgNumber}</span>
                <span className="text-[10px] text-slate-500 font-mono block">Trans: {pawn.pawn_number}</span>
              </div>
            </div>

            {/* Grid 2 Kolom: Identitas Nasabah & Agunan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3">
              {/* Kolom 1: Nasabah */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                  1. IDENTITAS NASABAH (RAHIN)
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 text-[11px]">Nama:</span>
                  <span className="col-span-2 font-bold text-slate-900">{customerName}</span>
                  <span className="text-slate-500 text-[11px]">NIK / KTP:</span>
                  <span className="col-span-2 font-mono font-semibold">{customerNik}</span>
                  <span className="text-slate-500 text-[11px]">No. HP / WA:</span>
                  <span className="col-span-2 font-semibold text-emerald-800">{customerPhone}</span>
                  <span className="text-slate-500 text-[11px]">Alamat:</span>
                  <span className="col-span-2 text-slate-700 text-[11px]">{customerAddress}</span>
                </div>
              </div>

              {/* Kolom 2: Agunan & Plat Nomor */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                  2. BARANG AGUNAN (MARHUN)
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 text-[11px]">Barang:</span>
                  <span className="col-span-2 font-bold text-slate-900">{assetBrand} {assetModel} {assetVariant}</span>

                  {licensePlate && (
                    <>
                      <span className="text-rose-700 font-bold text-[11px]">NOMOR PLAT:</span>
                      <span className="col-span-2 font-mono font-black text-rose-700 text-xs bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 w-fit">
                        {licensePlate}
                      </span>
                    </>
                  )}

                  <span className="text-slate-500 text-[11px]">No Seri / IMEI:</span>
                  <span className="col-span-2 font-mono text-slate-700">{serialNumber}</span>
                  <span className="text-slate-500 text-[11px]">Kondisi Fisik:</span>
                  <span className="col-span-2 text-slate-800">{physicalCondition}</span>
                </div>
              </div>
            </div>

            {/* Rincian Finansial & Jatuh Tempo (10 Hari) */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Pokok Pinjaman</span>
                <span className="text-sm font-black font-mono text-slate-900">{formatIDR(principal)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Admin (10% Pencairan)</span>
                <span className="text-xs font-bold font-mono text-slate-800">{formatIDR(adminFee)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bunga (10% / 10 Hari)</span>
                <span className="text-xs font-bold font-mono text-emerald-800">{formatIDR(interestAmount)}</span>
              </div>
              <div>
                <span className="text-rose-600 block text-[10px] uppercase font-bold">Jatuh Tempo (10 Hari)</span>
                <span className="text-xs font-black text-rose-700">{dueDateStr}</span>
              </div>
            </div>

            {/* Tanda Tangan & QR Code Lembar 1 */}
            <div className="pt-2 flex items-end justify-between text-center px-4">
              <div className="min-w-[130px] space-y-8">
                <p className="text-[10px] font-semibold text-slate-600">Nasabah (Peminjam)</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 text-[11px]">{customerName}</p>
                  <p className="text-[9px] text-slate-400">Tanda Tangan Asli</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white border border-slate-200">
                <QRCodeView value={sbgNumber} size={65} label={sbgNumber} />
                <span className="text-[8px] text-slate-400 mt-0.5">Arsip Resmi UGM</span>
              </div>

              <div className="min-w-[130px] space-y-8">
                <p className="text-[10px] font-semibold text-slate-600">Kasir / Petugas UGM</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 text-[11px]">Petugas Konter UGM</p>
                  <p className="text-[9px] text-slate-400">Cap & Paraf Sah</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= GARIS POTONG / PERFORASI ================= */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-slate-400"></div>
            <span className="absolute bg-white px-3 text-[10px] text-slate-500 font-mono flex items-center gap-1.5 border border-slate-300 rounded-full py-0.5">
              <Scissors className="w-3.5 h-3.5 text-slate-600" />
              <span>Gunting / Sobek di sini untuk Lembar Nasabah</span>
            </span>
          </div>

          {/* ================= LEMBAR 2: BUKTI FISIK NASABAH (TANDA BUKTI SAH GADAI) ================= */}
          <div className="p-5 rounded-2xl bg-white border-2 border-emerald-300 shadow-sm space-y-3.5 print:border-black print:p-2 print:shadow-none">
            {/* Header Lembar Nasabah */}
            <div className="border-b-2 border-emerald-600 pb-2.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-black text-[10px] tracking-wider uppercase">
                    LEMBAR 2: BUKTI FISIK NASABAH (DISIMPAN NASABAH)
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">TANDA BUKTI HAK AMBIL AGUNAN</span>
                </div>
                <h2 className="text-base font-black text-slate-900 mt-1 tracking-tight">UNIT GADAI MANDIRI (UGM)</h2>
                <p className="text-[11px] text-slate-600">
                  {branchName} · {branchAddress} · CS: {branchPhone}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">No. SBG:</span>
                <span className="text-sm font-mono font-black text-emerald-800 block">{sbgNumber}</span>
                <span className="text-[10px] text-rose-600 font-bold block">Jatuh Tempo: {dueDateStr}</span>
              </div>
            </div>

            {/* Grid Ringkas Nasabah & Agunan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Nasabah:</span>
                <p className="font-bold text-slate-900">{customerName} ({customerNik})</p>
                <p className="text-[11px] text-slate-600">No HP: {customerPhone}</p>
                <p className="text-[11px] text-slate-600">Alamat: {customerAddress}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Barang Jaminan:</span>
                <p className="font-bold text-slate-900">{assetBrand} {assetModel} {assetVariant}</p>
                {licensePlate && (
                  <p className="text-xs font-bold text-rose-700 font-mono">
                    NOMOR PLAT: <span className="bg-rose-100 px-1.5 py-0.5 rounded">{licensePlate}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-600">No Seri / IMEI: {serialNumber}</p>
              </div>
            </div>

            {/* Ringkasan Biaya Lembar Nasabah */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Pokok Pinjaman:</span>
                <span className="font-extrabold text-slate-900 font-mono">{formatIDR(principal)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Admin 10%:</span>
                <span className="font-bold text-slate-800 font-mono">{formatIDR(adminFee)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Bunga 10% (10 Hari):</span>
                <span className="font-bold text-emerald-800 font-mono">{formatIDR(interestAmount)}</span>
              </div>
            </div>

            {/* Klausul Pengambilan Resmi */}
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 leading-relaxed space-y-0.5">
              <p className="font-bold text-slate-900">PERHATIAN PENGAMBILAN & PERPANJANGAN:</p>
              <p>1. Lembar bukti fisik ini adalah tanda bukti hak milik & hak pengambilan agunan yang sah.</p>
              <p>2. Pembayaran lewat 10 hari wajib masuk ke perpanjangan dan dikenakan biaya admin 10%.</p>
              <p>3. Penebusan agunan wajib membawa lembar bukti ini beserta KTP asli yang masih berlaku.</p>
            </div>

            {/* Tanda Tangan & QR Code Lembar Nasabah */}
            <div className="pt-2 flex items-end justify-between text-center px-4">
              <div className="min-w-[130px] space-y-8">
                <p className="text-[10px] font-semibold text-slate-600">Nasabah (Pemilik)</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 text-[11px]">{customerName}</p>
                  <p className="text-[9px] text-slate-400">Tanda Tangan</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white border border-slate-200">
                <QRCodeView value={sbgNumber} size={65} label={sbgNumber} />
                <span className="text-[8px] text-slate-400 mt-0.5">Bukti Asli Nasabah</span>
              </div>

              <div className="min-w-[130px] space-y-8">
                <p className="text-[10px] font-semibold text-slate-600">Petugas Kasir UGM</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 text-[11px]">Kasir Cabang Padang</p>
                  <p className="text-[9px] text-slate-400">Cap & Paraf</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </Modal>
  );
};
