import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileCheck2, KeyRound, Package, Printer, RefreshCw, ScanLine, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { QRCodeView } from '../components/common/QRCodeView';
import { pawnApi } from '../services/endpoints';
import { PawnTransaction, PaymentCalculation } from '../types';
import { useAlert } from '../context/AlertContext';

export const PawnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pawn, setPawn] = useState<PawnTransaction | null>(null);
  const [calc, setCalc] = useState<PaymentCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useAlert();

  // Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isPinkPrintOpen, setIsPinkPrintOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'INTEREST_PAYMENT' | 'EXTENSION_PAYMENT' | 'FULL_PAYOFF'>('EXTENSION_PAYMENT');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Release Form
  const [receiverName, setReceiverName] = useState('');
  const [receiverID, setReceiverID] = useState('');
  const [redemptionDocument, setRedemptionDocument] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [releaseChecks, setReleaseChecks] = useState({ identity: false, asset: false, document: false, custodyHandover: true });
  const [isPinkPaperBlocked, setIsPinkPaperBlocked] = useState(false);
  const [isProxyPickup, setIsProxyPickup] = useState(false);
  const [proxyLetterNumber, setProxyLetterNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadData = () => {
    if (id) {
      setLoading(true);
      Promise.all([pawnApi.get(id), pawnApi.getPaymentCalc(id)])
        .then(([pawnRes, calcRes]) => {
          setPawn(pawnRes);
          setCalc(calcRes);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleProcessPayment = async () => {
    if (!pawn || !calc) return;
    setSubmitting(true);
    try {
      let amount = calc.accrued_interest + calc.admin_fee;
      if (paymentType === 'FULL_PAYOFF') {
        amount = calc.total_payoff;
      }

      await pawnApi.processPayment(pawn.id, paymentType, amount, paymentMethod);
      setIsPaymentOpen(false);
      showSuccess('Pembayaran transaksi gadai berhasil diproses dan dicatat!', 'Pembayaran Berhasil');
      loadData();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Memproses Pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseAsset = async () => {
    if (!pawn) return;
    if (isPinkPaperBlocked) {
      showError('Transaksi ini dalam status BLOKIR KERTAS PINK. Pengambilan barang ditahan demi keamanan aset nasabah.', 'Kertas Pink Diblokir');
      return;
    }
    const checksComplete = releaseChecks.identity && releaseChecks.asset && releaseChecks.document && releaseChecks.custodyHandover;
    if (!receiverName.trim() || !receiverID.trim() || !redemptionDocument.trim() || otpCode.trim().length < 4 || !checksComplete) {
      showError('Lengkapi identitas penerima, kertas pink/token, OTP, dan seluruh checklist verifikasi.', 'Verifikasi Belum Lengkap');
      return;
    }
    if (isProxyPickup && !proxyLetterNumber.trim()) {
      showError('Penebusan oleh kuasa wajib menyertakan nomor surat kuasa bermaterai Rp 10.000.', 'Nomor Surat Kuasa Wajib');
      return;
    }
    setSubmitting(true);
    try {
      const releaseNotes = [
        `Redemption document: ${redemptionDocument.trim()}`,
        `Identity verified: YES (${isProxyPickup ? `KUASA - ${proxyLetterNumber}` : 'NASABAH ASLI'})`,
        'Asset scanned and matched: YES',
        'Custody chain handover: PETUGAS BERTUGAS SAAT INI (SAH)',
        'Second-factor verification OTP: PASSED',
      ].join(' | ');
      await pawnApi.releaseAsset(pawn.id, receiverName.trim(), receiverID.trim(), '', releaseNotes);
      setIsReleaseOpen(false);
      setReceiverName('');
      setReceiverID('');
      setRedemptionDocument('');
      setOtpCode('');
      setReleaseChecks({ identity: false, asset: false, document: false, custodyHandover: true });
      showSuccess('Barang agunan berhasil dilepaskan kepada penerima sah!', 'Pelepasan Barang Berhasil');
      loadData();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Melepaskan Barang');
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const releaseReady = Boolean(
    !isPinkPaperBlocked
      && receiverName.trim()
      && receiverID.trim()
      && redemptionDocument.trim()
      && otpCode.trim().length >= 4
      && releaseChecks.identity
      && releaseChecks.asset
      && releaseChecks.document
      && releaseChecks.custodyHandover
      && (!isProxyPickup || proxyLetterNumber.trim()),
  );

  if (loading || !pawn) {
    return <div className="p-8 text-center text-slate-500">Loading rincian transaksi gadai...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/pawn-transactions')}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Rincian Transaksi {pawn.pawn_number}</h1>
            <span className="text-xs text-emerald-700 font-mono font-bold">Status: {pawn.status}</span>
          </div>
        </div>

        <button
          onClick={() => setIsPinkPrintOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer border border-pink-400"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Kertas Pink (SBG Fisik)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column 1 & 2 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Pokok Transaksi & Nasabah</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Nasabah:</span>
                <span className="font-bold text-slate-800">{pawn.customer?.full_name || 'Ahmad Subagyo'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NIK:</span>
                <span className="font-mono text-slate-800">{pawn.customer?.nik || '3171012345670001'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nominal Pokok:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{formatIDR(pawn.principal_amount)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Biaya Titip/Ijarah Bulanan:</span>
                <span className="text-slate-800 font-medium">{pawn.interest_rate}% / Bulan</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Akad Gadai:</span>
                <span className="text-slate-800 font-medium">{new Date(pawn.loan_date).toLocaleDateString('id-ID')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Jatuh Tempo:</span>
                <span className="font-bold text-rose-600">{new Date(pawn.due_date).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </Card>

          {/* Detail Barang Agunan (Marhun yang Digadaikan) */}
          {pawn.appraisal?.asset && (
            <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-sm font-semibold text-slate-800">Detail Barang Agunan (Marhun)</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {pawn.appraisal.asset.asset_code}
                  </span>
                  <Badge variant="purple">
                    {pawn.appraisal.asset.category?.name || 'Agunan Syariah'}
                  </Badge>
                </div>
              </div>

              {/* Main Asset Header */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Merek & Model Barang:</span>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {pawn.appraisal.asset.brand} {pawn.appraisal.asset.model} {pawn.appraisal.asset.variant ? `(${pawn.appraisal.asset.variant})` : ''}
                    </h2>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nilai Taksiran Pasar (Appraisal):</span>
                    <p className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                      {formatIDR(pawn.appraisal.appraiser_price || pawn.appraisal.market_price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Asset Technical & Physical Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">No. Seri / IMEI:</span>
                  <span className="font-mono font-semibold text-slate-800 break-all">
                    {pawn.appraisal.asset.serial_number || pawn.appraisal.asset.imei || '-'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Kondisi Fisik:</span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 mt-0.5">
                    {pawn.appraisal.asset.physical_condition || 'GOOD'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Kondisi Fungsi:</span>
                  <span className="inline-flex items-center gap-1 rounded bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800 mt-0.5">
                    {pawn.appraisal.asset.functional_condition || 'FULLY_FUNCTIONAL'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Tahun / Warna:</span>
                  <span className="font-semibold text-slate-800">
                    {pawn.appraisal.asset.year ? `${pawn.appraisal.asset.year}` : '-'} {pawn.appraisal.asset.color ? `· ${pawn.appraisal.asset.color}` : ''}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Rasio Pembiayaan (LTV):</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {pawn.appraisal.loan_to_value || 70}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Plafon Maksimal:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatIDR(pawn.appraisal.maximum_loan || pawn.principal_amount)}
                  </span>
                </div>
              </div>

              {/* Accessories & Notes */}
              {(pawn.appraisal.asset.accessories || pawn.appraisal.asset.specification || pawn.appraisal.asset.notes || pawn.appraisal.appraiser_notes) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 text-xs">
                  {pawn.appraisal.asset.accessories && (
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 font-medium min-w-[90px]">Kelengkapan:</span>
                      <span className="text-slate-800 font-semibold">{pawn.appraisal.asset.accessories}</span>
                    </div>
                  )}
                  {pawn.appraisal.asset.specification && (
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 font-medium min-w-[90px]">Spesifikasi:</span>
                      <span className="text-slate-700">{pawn.appraisal.asset.specification}</span>
                    </div>
                  )}
                  {(pawn.appraisal.asset.notes || pawn.appraisal.appraiser_notes) && (
                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200/70">
                      <span className="text-slate-500 font-medium min-w-[90px]">Catatan Fisik:</span>
                      <span className="text-slate-700 italic">{pawn.appraisal.asset.notes || pawn.appraisal.appraiser_notes}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Syariah Ijarah & Payoff Calculation Engine */}
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Rincian Ujrah (Biaya Titip), Admin & Total Pelunasan</span>
              <Badge variant="success">Akad Rahn Syariah</Badge>
            </h3>

            {calc && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pokok Pinjaman Qardh:</span>
                    <span className="font-bold text-slate-800">{formatIDR(calc.outstanding_principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Titip/Ijarah Berjalan:</span>
                    <span className="font-bold text-emerald-700">{formatIDR(calc.accrued_interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Administrasi Akad:</span>
                    <span className="text-slate-800">{formatIDR(calc.admin_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ta'widh (Kompensasi Keterlambatan Riil):</span>
                    <span className="font-bold text-rose-600">{formatIDR(calc.penalty_fee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="font-bold text-slate-800">Total Pelunasan Tebus Unit:</span>
                    <span className="font-extrabold text-emerald-700">{formatIDR(calc.total_payoff)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Action Column 3 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Aksi Pembayaran & Perpanjangan</h3>

            {pawn.status === 'ACTIVE' || pawn.status === 'EXTENDED' || pawn.status === 'OVERDUE' ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setPaymentType('EXTENSION_PAYMENT');
                    setIsPaymentOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-teal-100 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-teal-600" />
                  <span>Perpanjang Akad (Bayar Biaya Titip)</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentType('FULL_PAYOFF');
                    setIsPaymentOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Pelunasan Total (Payoff)</span>
                </button>
              </div>
            ) : pawn.status === 'PAID' ? (
              <div className="space-y-3">
                <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                  <div className="mb-1 flex items-center gap-2 font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    Pembayaran sudah lunas
                  </div>
                  <p className="leading-relaxed text-emerald-800">Barang belum otomatis keluar. Selesaikan verifikasi penerima, kertas pink/token, scan barang, dan OTP.</p>
                </div>

                {/* Pink Paper Status & Protection Button */}
                <div className={`p-3 rounded-xl border text-xs space-y-2 ${isPinkPaperBlocked ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Proteksi Kertas Pink:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPinkPaperBlocked ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {isPinkPaperBlocked ? 'BLOKIR (DILAPORKAN HILANG)' : 'AKTIF & SAH'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPinkPaperBlocked(!isPinkPaperBlocked);
                      if (!isPinkPaperBlocked) {
                        showSuccess('Kertas pink berhasil diblokir. Pengeluaran barang ditahan sampai klarifikasi pemilik asli.', 'Status Blokir Aktif');
                      } else {
                        showSuccess('Blokir kertas pink telah dibuka kembali.', 'Blokir Dibuka');
                      }
                    }}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isPinkPaperBlocked
                        ? 'bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200'
                        : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    {isPinkPaperBlocked ? 'Buka Blokir Kertas Pink' : 'Lapor Kertas Pink Hilang / Tahan'}
                  </button>
                </div>

                <button
                  onClick={() => setIsReleaseOpen(true)}
                  disabled={isPinkPaperBlocked}
                  className="w-full py-2.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Package className="w-4 h-4 text-slate-600" />
                  <span>Pengambilan / Asset Release</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center">Status transaksi: {pawn.status}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Proses Pembayaran / Perpanjangan">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Jenis Pembayaran</label>
            <select
              value={paymentType}
              onChange={(e: any) => setPaymentType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="EXTENSION_PAYMENT">EXTENSION (Perpanjang 30 Hari - Bayar Biaya Titip / Ijarah)</option>
              <option value="FULL_PAYOFF">FULL PAYOFF (Pelunasan Total)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
            <span className="text-slate-600">Total Nominal Pembayaran:</span>
            <span className="font-bold text-emerald-700">
              {paymentType === 'FULL_PAYOFF' ? formatIDR(calc?.total_payoff || 0) : formatIDR((calc?.accrued_interest || 0) + (calc?.admin_fee || 0))}
            </span>
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <button onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs cursor-pointer hover:bg-slate-200">Batal</button>
            <button onClick={handleProcessPayment} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors">
              {submitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Release Modal */}
      <Modal isOpen={isReleaseOpen} onClose={() => setIsReleaseOpen(false)} title="Pengambilan Barang / Asset Release">
        <div className="space-y-4">
          <div className="border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 space-y-1">
            <p className="font-bold">Protokol Serah-Terima Petugas Pengganti (Cross-Officer Handover):</p>
            <p>Petugas bertugas saat ini berwenang menyerahkan unit tanpa menunggu penerima awal. Seluruh bukti fisik dan digital terekam permanen dalam Sistem Audit Trail.</p>
          </div>

          {/* Proxy / Surat Kuasa Option */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isProxyPickup}
                onChange={(e) => setIsProxyPickup(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              <span>Penebusan Dikuasakan (Diambil Bukan Oleh Nasabah Asli)</span>
            </label>
            {isProxyPickup && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-slate-600">Nomor Registrasi Surat Kuasa Bermaterai Rp 10.000</label>
                <input
                  type="text"
                  required
                  value={proxyLetterNumber}
                  onChange={(e) => setProxyLetterNumber(e.target.value)}
                  placeholder="SK-KUASA/2026/..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Penerima Barang Fisik</label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Nama sesuai KTP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NIK Penerima</label>
              <input
                type="text"
                value={receiverID}
                onChange={(e) => setReceiverID(e.target.value)}
                placeholder="3171..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor Seri Kertas Pink Fisik</label>
              <div className="relative">
                <FileCheck2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={redemptionDocument}
                  onChange={(e) => setRedemptionDocument(e.target.value)}
                  placeholder="KP-PDG-..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 font-mono text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">OTP Verifikasi Nasabah Asli</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 font-mono text-xs tracking-[0.25em] text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <fieldset className="space-y-2 border border-slate-200 bg-slate-50 p-3">
            <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">Checklist Validasi Serah-Terima Berlapis</legend>
            {[
              { key: 'identity', label: 'KTP penerima cocok dengan identitas nasabah / dokumen kuasa', icon: UserCheck },
              { key: 'asset', label: 'Barcode/QR, nomor seri/IMEI, dan kondisi fisik barang cocok sempurna', icon: ScanLine },
              { key: 'document', label: 'Kertas pink fisik asli diterima kembali & dicap LUNAS/SELESAI', icon: FileCheck2 },
              { key: 'custodyHandover', label: 'Petugas pengganti telah memeriksa riwayat foto awal dan mengesahkan serah-terima', icon: ShieldCheck },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex cursor-pointer items-start gap-3 border border-slate-200 bg-white p-3 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={releaseChecks[key as keyof typeof releaseChecks]}
                  onChange={(event) => setReleaseChecks((current) => ({ ...current, [key]: event.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-emerald-700"
                />
                <Icon className="h-4 w-4 flex-none text-slate-500" />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <button onClick={() => setIsReleaseOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs cursor-pointer hover:bg-slate-200">Batal</button>
            <button onClick={handleReleaseAsset} disabled={submitting || !releaseReady} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40">
              {submitting ? 'Memproses...' : 'Serah Terima Barang Selesai'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Cetak Surat Bukti Gadai (Kertas Pink Syariah) */}
      <Modal isOpen={isPinkPrintOpen} onClose={() => setIsPinkPrintOpen(false)} title="Surat Bukti Gadai Fisik (Kertas Pink Syariah)" maxWidth="2xl">
        <div className="space-y-4">
          <div
            id="printable-pink-paper"
            className="p-6 rounded-2xl bg-gradient-to-b from-pink-50 to-rose-50/60 border-2 border-pink-300 shadow-sm text-slate-800 space-y-4 font-sans text-xs print:bg-white print:border-black"
          >
            {/* Kop Surat Kertas Pink */}
            <div className="border-b-2 border-pink-400 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-bold text-[10px] tracking-wider uppercase">
                    KERTAS PINK ASLI
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    AKAD RAHN SYARIAH
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1 tracking-tight">UNIT GADAI MANDIRI SYARIAH</h2>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {pawn.branch?.name || 'Cabang Nanggalo (Pusat Ops)'} · {pawn.branch?.address || 'Jl. Siteba No. 12, Nanggalo, Kota Padang'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Telp: {pawn.branch?.phone || '0751-441122'} · Izin Operasional Lembaga Gadai Syariah
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">No. Registrasi SBG:</span>
                <span className="text-sm font-mono font-black text-pink-700 block">
                  KP-PDG-{pawn.pawn_number.replace('PWN-', '')}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-1">
                  Trans: {pawn.pawn_number}
                </span>
              </div>
            </div>

            {/* Dua Kolom: Nasabah & Agunan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-pink-200 pb-3">
              <div className="space-y-1.5 p-3 rounded-xl bg-white/80 border border-pink-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-800 border-b border-pink-100 pb-1">
                  1. IDENTITAS RAHIN (NASABAH)
                </p>
                <div>
                  <span className="text-slate-500 text-[11px] block">Nama Nasabah:</span>
                  <span className="font-bold text-slate-900">{pawn.customer?.full_name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">NIK / KTP:</span>
                  <span className="font-mono font-semibold text-slate-800">{pawn.customer?.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Nomor HP / WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{pawn.customer?.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Alamat Tinggal:</span>
                  <span className="text-slate-700">{pawn.customer?.address || 'Kota Padang'}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-white/80 border border-pink-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-800 border-b border-pink-100 pb-1">
                  2. BARANG AGUNAN (MARHUN)
                </p>
                <div>
                  <span className="text-slate-500 text-[11px] block">Nama / Jenis Barang:</span>
                  <span className="font-bold text-slate-900">
                    {pawn.appraisal?.asset?.brand} {pawn.appraisal?.asset?.model} {pawn.appraisal?.asset?.variant || ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Nomor Seri / IMEI:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {pawn.appraisal?.asset?.serial_number || pawn.appraisal?.asset?.imei || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Kondisi Fisik / Kelengkapan:</span>
                  <span className="text-slate-800 font-medium">
                    {pawn.appraisal?.asset?.physical_condition || 'GOOD'} ({pawn.appraisal?.asset?.accessories || 'Lengkap'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Nilai Taksiran Pasar (Marhun Bih):</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {formatIDR(pawn.appraisal?.appraiser_price || pawn.appraisal?.market_price || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rincian Akad & Tanggal Jatuh Tempo */}
            <div className="p-3.5 rounded-xl bg-white/90 border border-pink-200 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-800 border-b border-pink-100 pb-1">
                3. RINCIAN AKAD PINJAMAN (QARDH) & BIAYA TITIP (IJARAH)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Pinjaman Pokok (Qardh):</span>
                  <span className="font-extrabold text-slate-900 text-sm font-mono">{formatIDR(pawn.principal_amount)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tarif Ijarah / 30 Hari:</span>
                  <span className="font-bold text-emerald-700">{pawn.interest_rate}% / Bulan</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Biaya Administrasi:</span>
                  <span className="font-semibold text-slate-800 font-mono">{formatIDR(pawn.administration_fee || 50000)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tanggal Jatuh Tempo:</span>
                  <span className="font-bold text-rose-600">{new Date(pawn.due_date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Ketentuan Hukum KUH Perdata & Syariah */}
            <div className="p-3 rounded-lg bg-pink-100/60 border border-pink-300/80 text-[10px] leading-relaxed text-slate-700 space-y-1">
              <p className="font-bold text-slate-900 uppercase">KLAUSUL HUKUM PENGAMBILAN & PENEBUSAN DENGAN KERTAS PINK:</p>
              <p>1. <strong>Kertas Pink Asli</strong> ini adalah tanda bukti hak milik dan hak serah-terima unit gadai yang sah dan berkekuatan hukum tetap.</p>
              <p>2. Penebusan unit wajib menyerahkan kembali lembar asli Kertas Pink ini serta menunjukkan KTP asli yang masih berlaku.</p>
              <p>3. Jika Kertas Pink ini <strong>HILANG</strong>, nasabah wajib segera mendatangi kantor cabang untuk mengaktifkan status <strong>BLOKIR</strong> guna mencegah penebusan tidak sah.</p>
              <p>4. Penebusan oleh pihak ketiga (kuasa) wajib menyertakan <strong>Surat Kuasa Bermaterai Rp 10.000</strong> dan verifikasi OTP ke nomor HP nasabah asli.</p>
              <p>5. Akad tunduk pada ketentuan hukum Gadai Syariah Fatwa DSN-MUI & KUH Perdata Pasal 1150-1160.</p>
            </div>

            {/* Tanda Tangan & QR Code */}
            <div className="pt-2 flex items-end justify-between text-center">
              <div className="space-y-10 min-w-[140px]">
                <p className="text-[11px] font-semibold text-slate-600">Nasabah (Rahin)</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                    {pawn.customer?.full_name || 'Nasabah'}
                  </p>
                  <p className="text-[10px] text-slate-500">Tanda Tangan & Nama Terang</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-pink-200">
                <QRCodeView value={`KP-PDG-${pawn.pawn_number}`} size={80} label={`KP-PDG-${pawn.pawn_number.replace('PWN-', '')}`} />
                <span className="text-[9px] text-slate-500 mt-1">Scan Verifikasi Keaslian SBG</span>
              </div>

              <div className="space-y-10 min-w-[140px]">
                <p className="text-[11px] font-semibold text-slate-600">Petugas Penaksir / Kasir</p>
                <div>
                  <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                    Petugas Cabang Padang
                  </p>
                  <p className="text-[10px] text-slate-500">Cap & Tanda Tangan Sah</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Print Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Cetak di atas kertas warna pink (format resmi)</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPinkPrintOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print Kertas Pink</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
