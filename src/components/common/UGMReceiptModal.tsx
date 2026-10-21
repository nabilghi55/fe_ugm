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
  const [printFormat, setPrintFormat] = useState<'THERMAL_80MM' | 'TWO_PLY'>('THERMAL_80MM');

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
• *Pencairan Bersih Diterima:* *${formatIDR(netDisbursement)}*

⚠️ *KETENTUAN PENEBUSAN & PERPANJANGAN:*
1. Pembayaran lewat 10 hari wajib diperpanjang dengan biaya administrasi 10% dari pinjaman pokok.
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
    const targetId = printFormat === 'THERMAL_80MM' ? 'printable-thermal-receipt' : 'printable-ugm-receipt';
    const element = document.getElementById(targetId);
    if (!element) {
      window.print();
      return;
    }

    // Create a clean, isolated hidden iframe to completely bypass modal overflow & backdrop
    const iframe = document.createElement('iframe');
    iframe.id = 'ugm-receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all loaded CSS links and style elements
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const isThermal = printFormat === 'THERMAL_80MM';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nota UGM - ${sbgNumber}</title>
          ${stylesHtml}
          <style>
            @page {
              size: ${isThermal ? '80mm auto' : 'auto'};
              margin: ${isThermal ? '0mm' : '6mm'};
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              margin: 0 !important;
              padding: ${isThermal ? '2mm 3mm' : '8px'} !important;
              background: #ffffff !important;
              color: #000000 !important;
              width: ${isThermal ? '76mm' : '100%'} !important;
              max-width: ${isThermal ? '76mm' : '100%'} !important;
              overflow: visible !important;
            }
            #${targetId} {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border-color: #000000 !important;
              display: block !important;
              visibility: visible !important;
            }
          </style>
        </head>
        <body>
          <div id="${targetId}">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📄 Nota Bukti Gadai UGM (Struk Thermal 80mm & Bukti 2 Lembar)" maxWidth="4xl">
      <div className="space-y-4 font-sans text-xs text-slate-800">
        {/* Top Control Bar: WA, Format Switcher & Print Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">Aksi Cepat:</span>
            <button
              type="button"
              onClick={handleSendWA}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Kirim Nota WA</span>
            </button>
            <button
              type="button"
              onClick={handleCopyWA}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedWA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedWA ? 'Tersalin!' : 'Salin Pesan'}</span>
            </button>
          </div>

          {/* Format Selector Pills & Print Button */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-slate-200 p-0.5 border border-slate-300">
              <button
                type="button"
                onClick={() => setPrintFormat('THERMAL_80MM')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  printFormat === 'THERMAL_80MM'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                🧾 Thermal 80mm (POS-80)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('TWO_PLY')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  printFormat === 'TWO_PLY'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                📑 2 Lembar Kantor (A4)
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>Cetak ke {printFormat === 'THERMAL_80MM' ? 'POS-80' : 'Printer'}</span>
            </button>
          </div>
        </div>

        {/* ================= MODE 1: FORMAT THERMAL 80MM (POS-80 PRINTER) ================= */}
        {printFormat === 'THERMAL_80MM' && (
          <div className="flex justify-center p-4 bg-slate-100 rounded-2xl overflow-x-auto">
            <div
              id="printable-thermal-receipt"
              className="w-full max-w-[340px] bg-white p-5 shadow-lg border-2 border-slate-300 font-mono text-[11px] text-black leading-snug space-y-2.5 rounded-xl"
            >
              {/* Kop UGM */}
              <div className="text-center space-y-0.5 border-b border-dashed border-black pb-2">
                <h3 className="text-sm font-black tracking-wider uppercase">UNIT GADAI MANDIRI</h3>
                <p className="text-[10px] font-bold text-emerald-800">SYARIAH PADANG (BEBAS RIBA)</p>
                <p className="text-[9px] text-slate-700">{branchName}</p>
                <p className="text-[9px] text-slate-700">{branchAddress}</p>
                <p className="text-[9px] text-slate-700">Telp/WA: {branchPhone}</p>
              </div>

              {/* Transaksi & Waktu */}
              <div className="space-y-0.5 border-b border-dashed border-black pb-2 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>NO. SBG:</span>
                  <span className="font-mono">{sbgNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Trans:</span>
                  <span>{pawn.pawn_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tgl Akad:</span>
                  <span>{loanDateStr}</span>
                </div>
                <div className="flex justify-between font-black text-rose-700">
                  <span>JATUH TEMPO:</span>
                  <span>{dueDateStr} (10 HARI)</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Kasir Cabang Padang</span>
                </div>
              </div>

              {/* Data Nasabah */}
              <div className="space-y-0.5 border-b border-dashed border-black pb-2 text-[10px]">
                <p className="font-bold underline uppercase">Data Nasabah (Rahin):</p>
                <div className="flex justify-between">
                  <span>Nama:</span>
                  <span className="font-bold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>NIK:</span>
                  <span>{customerNik}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. HP:</span>
                  <span>{customerPhone}</span>
                </div>
              </div>

              {/* Agunan */}
              <div className="space-y-0.5 border-b border-dashed border-black pb-2 text-[10px]">
                <p className="font-bold underline uppercase">Barang Agunan (Marhun):</p>
                <div className="font-bold text-[11px] text-slate-900">{assetBrand} {assetModel} {assetVariant}</div>
                {licensePlate && (
                  <div className="flex justify-between font-black text-xs text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300">
                    <span>NOMOR PLAT:</span>
                    <span>{licensePlate}</span>
                  </div>
                )}
                <div className="flex justify-between text-[9px]">
                  <span>No Seri/IMEI:</span>
                  <span>{serialNumber}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Kondisi:</span>
                  <span>{physicalCondition}</span>
                </div>
              </div>

              {/* Rincian Finansial */}
              <div className="space-y-1 border-b-2 border-black pb-2 text-[10px]">
                <p className="font-bold underline uppercase">Rincian Dana & Biaya:</p>
                <div className="flex justify-between">
                  <span>Pokok Pinjaman:</span>
                  <span className="font-bold font-mono">{formatIDR(principal)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Biaya Admin (10%):</span>
                  <span className="font-mono">{formatIDR(adminFee)}</span>
                </div>
                <div className="border-t border-dashed border-black pt-1 flex justify-between font-black text-xs">
                  <span>DITERIMA BERSIH:</span>
                  <span className="text-sm font-black text-emerald-800">{formatIDR(netDisbursement)}</span>
                </div>
              </div>

              {/* Ketentuan 10 Hari */}
              <div className="text-[8.5px] leading-tight text-slate-800 space-y-0.5 border-b border-dashed border-black pb-2">
                <p className="font-bold">KETENTUAN SIKLUS & PENGAMBILAN:</p>
                <p>1. Masa gadai berlaku 10 HARI sejak tanggal akad.</p>
                <p>2. Perpanjangan lewat 10 hari wajib membayar biaya admin 10% dari pinjaman pokok.</p>
                <p>3. Penebusan agunan wajib membawa struk asli ini & KTP asli nasabah.</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center py-1">
                <QRCodeView value={sbgNumber} size={75} label={sbgNumber} />
                <p className="text-[8px] text-slate-500 mt-0.5">Scan Verifikasi Keaslian SBG</p>
              </div>

              {/* Tanda Tangan Kasir & Nasabah */}
              <div className="pt-2 grid grid-cols-2 text-center text-[9px] gap-2">
                <div>
                  <p className="text-slate-600 mb-6">Nasabah (Rahin)</p>
                  <p className="font-bold border-t border-black pt-0.5">{customerName}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-6">Kasir Cabang UGM</p>
                  <p className="font-bold border-t border-black pt-0.5">Kasir Padang</p>
                </div>
              </div>

              <div className="text-center pt-2 text-[8px] text-slate-500 border-t border-dashed border-black">
                <p>*** SIMPAN NOTA INI DENGAN BAIK ***</p>
                <p>Unit Gadai Mandiri Syariah · Berkah Amanah</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 2: PRINTABLE AREA DUA RANGKAP (LEMBAR UGM & NASABAH) ================= */}
        {printFormat === 'TWO_PLY' && (
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
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Diterima Bersih</span>
                <span className="text-xs font-black font-mono text-emerald-900">{formatIDR(netDisbursement)}</span>
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
                <span className="text-slate-500 block text-[10px]">Biaya Admin (10%):</span>
                <span className="font-bold text-slate-800 font-mono">{formatIDR(adminFee)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Diterima Bersih:</span>
                <span className="font-extrabold text-emerald-800 font-mono">{formatIDR(netDisbursement)}</span>
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
        )}

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
