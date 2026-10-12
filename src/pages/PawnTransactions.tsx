import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, CheckCircle, ArrowRight, DollarSign, Wallet, Percent, Calculator, Printer } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { QRCodeView } from '../components/common/QRCodeView';
import { pawnApi, customerApi, assetApi } from '../services/endpoints';
import { PawnTransaction, Customer, PawnStatus, Asset } from '../types';
import { useAlert } from '../context/AlertContext';

export const PawnTransactions: React.FC = () => {
  const [pawns, setPawns] = useState<PawnTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Alert Hook
  const { showSuccess, showError, showWarning } = useAlert();

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [appraisalId, setAppraisalId] = useState('');
  const [selectedLtvPercent, setSelectedLtvPercent] = useState<number>(70);
  const [principalAmount, setPrincipalAmount] = useState<number>(7000000);
  const [interestRate, setInterestRate] = useState<number>(0.0);
  const [adminFee, setAdminFee] = useState<number>(50000);
  const [submitting, setSubmitting] = useState(false);

  // Approval & Disbursement Modal State
  const [selectedPawn, setSelectedPawn] = useState<PawnTransaction | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseMethod, setDisburseMethod] = useState('CASH');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');

  // Kertas Pink Print Modal State
  const [isPinkPrintOpen, setIsPinkPrintOpen] = useState(false);
  const [pinkPawn, setPinkPawn] = useState<PawnTransaction | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    customerApi.list().then((res) => setCustomers(res.data));
    assetApi.list().then((res) => setAssets(res.data));
    fetchPawns();
  }, [search, statusFilter]);

  const fetchPawns = () => {
    setLoading(true);
    pawnApi
      .list(statusFilter, search)
      .then((res) => setPawns(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSelectLtvPercent = (pct: number, assetId = appraisalId) => {
    setSelectedLtvPercent(pct);
    const targetAsset = assets.find((a) => a.id === assetId);
    const baseValuation = targetAsset?.purchase_price && targetAsset.purchase_price > 0 ? targetAsset.purchase_price : 10000000;
    const calculatedLoan = Math.round((baseValuation * (pct / 100)) / 10000) * 10000;
    setPrincipalAmount(calculatedLoan > 0 ? calculatedLoan : 7000000);
  };

  const handleAssetSelectChange = (assetId: string) => {
    setAppraisalId(assetId);
    handleSelectLtvPercent(selectedLtvPercent, assetId);
  };

  const handleCreatePawn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      showWarning('Silakan pilih nasabah terlebih dahulu.', 'Nasabah Belum Dipilih');
      return;
    }
    setSubmitting(true);
    try {
      await pawnApi.create({
        customer_id: customerId,
        appraisal_id: appraisalId || undefined,
        principal_amount: principalAmount,
        interest_rate: interestRate,
        administration_fee: adminFee,
        tenor_days: 30,
      });

      setIsModalOpen(false);
      showSuccess('Pengajuan transaksi gadai baru berhasil dibuat dan diteruskan!', 'Transaksi Berhasil');
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Membuat Transaksi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedPawn) return;
    try {
      await pawnApi.approve(selectedPawn.id, action, 'Disetujui sesuai limit persetujuan');
      setIsApproveOpen(false);
      showSuccess(
        action === 'APPROVE' ? 'Transaksi gadai berhasil disetujui (Approved)!' : 'Transaksi gadai berhasil ditolak.',
        'Proses Persetujuan Selesai'
      );
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Proses Approval');
    }
  };

  const handleDisburseAction = async () => {
    if (!selectedPawn) return;
    try {
      await pawnApi.disburse(selectedPawn.id, disburseMethod, bankName, accountNumber);
      setIsDisburseOpen(false);
      showSuccess(`Pencairan kasir sebesar ${formatIDR(selectedPawn.principal_amount || 0)} berhasil dilakukan!`, 'Pencairan Berhasil');
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Pencairan Kasir');
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: PawnStatus) => {
    switch (status) {
      case 'WAITING_APPROVAL':
        return <Badge variant="warning">WAITING APPROVAL</Badge>;
      case 'APPROVED':
        return <Badge variant="info">APPROVED</Badge>;
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'PAID':
        return <Badge variant="purple">PAID (LUNAS)</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">OVERDUE</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi Gadai</h1>
          <p className="text-xs text-slate-500">Pengajuan transaksi, approval berjenjang, dan pencairan kasir</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Transaksi Gadai Baru</span>
        </button>
      </div>

      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan No Pawning (PWN-...)..."
            className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-600 font-medium">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
          >
            <option value="">Semua Status</option>
            <option value="WAITING_APPROVAL">WAITING APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No Pawning / Tgl</th>
                <th className="px-6 py-3.5">Nasabah</th>
                <th className="px-6 py-3.5">Barang Agunan</th>
                <th className="px-6 py-3.5">Pokok Pinjaman</th>
                <th className="px-6 py-3.5">Biaya Titip / Jatuh Tempo</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pawns.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-700 block">{p.pawn_number}</span>
                    <span className="text-[11px] text-slate-500">{new Date(p.loan_date).toLocaleDateString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.customer?.full_name || 'Ahmad Subagyo'}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-800 font-medium block">
                      {p.appraisal?.asset?.brand} {p.appraisal?.asset?.model}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{p.appraisal?.asset?.asset_code}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{formatIDR(p.principal_amount)}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 font-medium block">{p.interest_rate}% / Bulan</span>
                    <span className="text-[11px] text-rose-600 font-semibold">Jth Tempo: {new Date(p.due_date).toLocaleDateString('id-ID')}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {p.status === 'WAITING_APPROVAL' && (
                      <button
                        onClick={() => {
                          setSelectedPawn(p);
                          setIsApproveOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-300 text-xs font-semibold hover:bg-amber-100 cursor-pointer transition-colors"
                      >
                        Approval
                      </button>
                    )}

                    {p.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          setSelectedPawn(p);
                          setIsDisburseOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100 cursor-pointer transition-colors"
                      >
                        Cairkan Kasir
                      </button>
                    )}

                    <button
                      title="Cetak Kertas Pink (SBG Fisik Syariah)"
                      onClick={() => {
                        setPinkPawn(p);
                        setIsPinkPrintOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-pink-600" />
                      <span>Kertas Pink</span>
                    </button>

                    <button
                      onClick={() => navigate(`/pawn-transactions/${p.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium cursor-pointer transition-colors border border-slate-200"
                    >
                      Detail <ArrowRight className="w-3.5 h-3.5 inline ml-1 text-emerald-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Pawn Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Transaksi Gadai Baru">
        <form onSubmit={handleCreatePawn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Pilih Nasabah</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Pilih Nasabah --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.customer_code} - {c.full_name} ({c.nik})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Pilih Barang Agunan (Hasil Appraisal)</label>
            <select
              value={appraisalId}
              onChange={(e) => handleAssetSelectChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="">-- Gunakan Appraisal Otomatis Sistem --</option>
              {assets.map((ast) => (
                <option key={ast.id} value={ast.id}>
                  {ast.asset_code} - {ast.brand} {ast.model} ({ast.variant || 'Standard'}) [{ast.category?.name || 'Agunan'}]
                </option>
              ))}
            </select>
          </div>

          {/* Smart LTV % Selector */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pencairan dari % Valuation (LTV):</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                Valuasi: {formatIDR(assets.find((a) => a.id === appraisalId)?.purchase_price || 10000000)}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[50, 60, 70, 80, 85].map((pct) => {
                const isSelected = selectedLtvPercent === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSelectLtvPercent(pct)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{pct}%</span>
                    {pct === 70 && <span className="block text-[9px] font-normal leading-none opacity-90 mt-0.5">Standar</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nominal Pokok Pinjaman (IDR)</label>
              <input
                type="number"
                required
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Tarif Titip / Ijarah (% / 30 Hari)</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">BEBAS RIBA (AKAD IJARAH)</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Biaya Administrasi (IDR)</label>
            <input
              type="number"
              value={adminFee}
              onChange={(e) => setAdminFee(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              {submitting ? 'Memproses...' : 'Submit Pengajuan Gadai'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Approval Transaksi Gadai">
        <div className="space-y-4">
          <p className="text-xs text-slate-700">
            Konfirmasi approval transaksi <strong className="text-emerald-700">{selectedPawn?.pawn_number}</strong> sebesar{' '}
            <strong className="text-emerald-700">{formatIDR(selectedPawn?.principal_amount || 0)}</strong>.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleApproveAction('REJECT')}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 cursor-pointer transition-colors"
            >
              Tolak Transaksi
            </button>
            <button
              onClick={() => handleApproveAction('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              Setujui Transaksi (Approve)
            </button>
          </div>
        </div>
      </Modal>

      {/* Disbursement Modal */}
      <Modal isOpen={isDisburseOpen} onClose={() => setIsDisburseOpen(false)} title="Pencairan Pinjaman Kasir">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Metode Pencairan</label>
            <select
              value={disburseMethod}
              onChange={(e) => setDisburseMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="CASH">CASH (Tunai)</option>
              <option value="BANK_TRANSFER">BANK TRANSFER</option>
              <option value="EWALLET">E-WALLET</option>
            </select>
          </div>

          {disburseMethod === 'BANK_TRANSFER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Nama Bank</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Nomor Rekening</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <button
              onClick={() => setIsDisburseOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDisburseAction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              Proses Pencairan Rp {selectedPawn?.principal_amount.toLocaleString('id-ID')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
