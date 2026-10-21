import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, ArrowRight, Printer, Camera, Settings, MessageCircle,
  Clock, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, ChevronDown,
  Filter, Calendar, DollarSign, Wallet, ShieldCheck, Car, HelpCircle, Eye, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { pawnApi, customerApi, assetApi } from '../services/endpoints';
import { PawnTransaction, Customer, PawnStatus, Asset } from '../types';
import { useAlert } from '../context/AlertContext';
import { useAuthStore } from '../store/authStore';
import { ManualFormScannerModal, ExtractedManualData } from '../components/common/ManualFormScannerModal';
import { PrinterSettingsModal } from '../components/common/PrinterSettingsModal';
import { UGMReceiptModal } from '../components/common/UGMReceiptModal';
import { lookupInstantEstimation, getFacebookMarketplaceUrl, CatalogItem } from '../utils/marketPriceCatalog';

export const PawnTransactions: React.FC = () => {
  const [pawns, setPawns] = useState<PawnTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyOverdueFilter, setOnlyOverdueFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  // User auth state
  const { user } = useAuthStore();
  const canApprove =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    user?.role === 'APPRAISER' ||
    user?.username?.toLowerCase() === 'alno';

  // Alert Hook
  const { showSuccess, showError, showWarning } = useAlert();
  const navigate = useNavigate();

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [appraisalId, setAppraisalId] = useState('');
  const [categoryName, setCategoryName] = useState('Kendaraan');
  const [brandInput, setBrandInput] = useState('Honda');
  const [modelInput, setModelInput] = useState('Vario 160');
  const [licensePlateInput, setLicensePlateInput] = useState('');
  const [principalAmount, setPrincipalAmount] = useState<number>(10000000);

  // Persen & Nominal Manual
  const [adminPercent, setAdminPercent] = useState<number>(10);
  const [adminFee, setAdminFee] = useState<number>(1000000); // 10% dari pencairan
  const [interestPercent, setInterestPercent] = useState<number>(10); // 10% per 10 hari
  const [interestAmount, setInterestAmount] = useState<number>(1000000); // Nominal bunga (bisa dikurangi)
  const [tenorDays, setTenorDays] = useState<number>(10); // Default 10 hari
  const [submitting, setSubmitting] = useState(false);

  // Instant Market Price Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPrinterSettingsOpen, setIsPrinterSettingsOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedPawnForReceipt, setSelectedPawnForReceipt] = useState<PawnTransaction | null>(null);

  // Approval Modal State
  const [selectedPawn, setSelectedPawn] = useState<PawnTransaction | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('Disetujui sesuai limit persetujuan');

  // Disbursement Modal State
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseMethod, setDisburseMethod] = useState('CASH');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('');

  // Perpanjangan Modal State
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [extendingPawn, setExtendingPawn] = useState<PawnTransaction | null>(null);

  // Panel Kolom Perpanjangan (Expandable / Draggable Drawer)
  const [showExtensionDrawer, setShowExtensionDrawer] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState<number>(440); // default width in px

  useEffect(() => {
    customerApi.list('', 1, 100).then((res) => setCustomers(res.data)).catch(console.error);
    assetApi.list('', 1, 100).then((res) => setAssets(res.data)).catch(console.error);
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

  // Helper sync admin fee saat principalAmount atau adminPercent berubah
  const handlePrincipalChange = (newVal: number) => {
    setPrincipalAmount(newVal);
    const newAdmin = Math.round(newVal * (adminPercent / 100));
    setAdminFee(newAdmin);
    const newInterest = Math.round(newVal * (interestPercent / 100));
    setInterestAmount(newInterest);
  };

  const handleAdminFeeChange = (val: number) => {
    setAdminFee(val);
    if (principalAmount > 0) {
      setAdminPercent(Number(((val / principalAmount) * 100).toFixed(1)));
    }
  };

  const handleAdminPercentChange = (pct: number) => {
    setAdminPercent(pct);
    setAdminFee(Math.round(principalAmount * (pct / 100)));
  };

  const handleInterestAmountChange = (val: number) => {
    setInterestAmount(val);
    if (principalAmount > 0) {
      setInterestPercent(Number(((val / principalAmount) * 100).toFixed(1)));
    }
  };

  const handleInterestPercentChange = (pct: number) => {
    setInterestPercent(pct);
    setInterestAmount(Math.round(principalAmount * (pct / 100)));
  };

  // Real-time lookup taksiran instan saat user mengetik merk & model
  const handleModelSearchChange = (text: string) => {
    setModelInput(text);
    const matches = lookupInstantEstimation(`${brandInput} ${text}`, categoryName);
    setSuggestions(matches);
  };

  const handleSelectSuggestion = (item: any, priceMode: 'min' | 'avg' | 'max' = 'avg') => {
    setBrandInput(item.brand);
    setModelInput(item.model);
    setCategoryName(item.category);

    let chosenMarketPrice = item.marketPrice;
    if (priceMode === 'min' && item.fbMarketplaceRange?.minPrice) {
      chosenMarketPrice = item.fbMarketplaceRange.minPrice;
    } else if (priceMode === 'max' && item.fbMarketplaceRange?.maxPrice) {
      chosenMarketPrice = item.fbMarketplaceRange.maxPrice;
    } else if (item.fbMarketplaceRange?.avgPrice) {
      chosenMarketPrice = item.fbMarketplaceRange.avgPrice;
    }

    const calculatedLoan = Math.round((chosenMarketPrice * 0.70) / 10000) * 10000;
    handlePrincipalChange(calculatedLoan);
    setSuggestions([]);
    showSuccess(
      `Taksiran ${item.brand} ${item.model} (${priceMode.toUpperCase()} FB: Rp ${chosenMarketPrice.toLocaleString('id-ID')}) diterapkan. Rekomendasi Pinjaman: Rp ${calculatedLoan.toLocaleString('id-ID')}`,
      'Taksiran FB Marketplace'
    );
  };

  // Menerima hasil Scan Foto Kertas Manual
  const handleApplyScannedData = async (data: ExtractedManualData) => {
    // Cari apakah nasabah sudah ada berdasarkan NIK atau nama
    let matchedCust = customers.find((c) => c.nik === data.nik || c.full_name.toLowerCase().includes(data.customerName.toLowerCase()));

    if (!matchedCust) {
      try {
        const newCust = await customerApi.create({
          customer_code: `CUST-${Date.now().toString().slice(-6)}`,
          nik: data.nik,
          full_name: data.customerName,
          phone: data.phone,
          whatsapp: data.phone,
          address: data.address,
        });
        matchedCust = newCust;
        setCustomers((prev) => [newCust, ...prev]);
        setCustomerId(newCust.id);
      } catch (e) {
        console.warn('Gagal buat nasabah otomatis:', e);
      }
    } else {
      setCustomerId(matchedCust.id);
    }

    setCategoryName(data.category);
    setBrandInput(data.brand);
    setModelInput(data.model);
    setLicensePlateInput(data.licensePlate || '');
    setPrincipalAmount(data.principalAmount);
    setAdminFee(data.adminFee);
    setAdminPercent(10);
    setInterestPercent(data.interestRate);
    setInterestAmount(data.interestAmount);
    setTenorDays(10);

    setIsModalOpen(true);
    showSuccess('Data formulir kertas berhasil dibaca dan diterapkan ke formulir transaksi!', 'Auto-Fill Berhasil');
  };

  const handleCreatePawn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      showWarning('Silakan pilih nasabah terlebih dahulu.', 'Nasabah Belum Dipilih');
      return;
    }
    setSubmitting(true);
    try {
      // Buat asset jika kendaraan atau barang baru
      let finalAppraisalId = appraisalId || undefined;
      if (!finalAppraisalId) {
        try {
          const newAsset = await assetApi.create({
            category_id: assets[0]?.category_id || '00000000-0000-0000-0000-000000000001',
            brand: brandInput,
            model: modelInput,
            license_plate: licensePlateInput.toUpperCase(),
            serial_number: `SN-${Date.now().toString().slice(-8)}`,
            physical_condition: 'BAIK',
            functional_condition: 'NORMAL',
            purchase_price: Math.round(principalAmount * 1.4),
          });
          finalAppraisalId = newAsset.id;
        } catch (errA) {
          console.warn('Fallback create asset:', errA);
        }
      }

      await pawnApi.create({
        customer_id: customerId,
        appraisal_id: finalAppraisalId,
        principal_amount: principalAmount,
        interest_rate: interestPercent,
        interest_amount: interestAmount,
        administration_fee: adminFee,
        tenor_days: tenorDays || 10,
      });

      setIsModalOpen(false);
      showSuccess(
        `Pengajuan gadai ${brandInput} ${modelInput} sebesar ${formatIDR(principalAmount)} (Admin 10%: ${formatIDR(adminFee)}) berhasil dibuat!`,
        'Transaksi Berhasil'
      );
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
      await pawnApi.approve(selectedPawn.id, action, approvalNotes);
      setIsApproveOpen(false);
      showSuccess(
        action === 'APPROVE' ? 'Transaksi gadai berhasil disetujui (Approved)!' : 'Transaksi gadai ditolak.',
        'Persetujuan Selesai'
      );
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Approval');
    }
  };

  const handleDisburseAction = async () => {
    if (!selectedPawn) return;
    try {
      await pawnApi.disburse(selectedPawn.id, disburseMethod, bankName, accountNumber);
      setIsDisburseOpen(false);
      showSuccess(`Pencairan kasir sebesar ${formatIDR(selectedPawn.principal_amount || 0)} berhasil!`, 'Pencairan Berhasil');
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Pencairan Kasir');
    }
  };

  // Proses Perpanjangan 10 Hari (Dikenakan Biaya Admin 10% + Bunga 10%)
  const handleProcessExtension = async () => {
    if (!extendingPawn) return;
    const principal = extendingPawn.principal_amount;
    const extAdmin = Math.round(principal * 0.10); // Biaya admin 10% dari pencairan
    const extInterest = extendingPawn.interest_amount || Math.round(principal * 0.10); // Bunga 10%
    const totalExtPay = extAdmin + extInterest;

    try {
      await pawnApi.processPayment(extendingPawn.id, 'EXTENSION_PAYMENT', totalExtPay, 'CASH');
      setIsExtensionModalOpen(false);
      showSuccess(
        `Perpanjangan 10 hari berhasil diproses! Admin 10% (${formatIDR(extAdmin)}) & Bunga (${formatIDR(extInterest)}) terbayar lunas.`,
        'Perpanjangan Sukses'
      );
      fetchPawns();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Proses Perpanjangan');
    }
  };

  const isOverdue = (pawn: PawnTransaction) => {
    if (pawn.status === 'PAID' || pawn.status === 'RELEASED') return false;
    const due = new Date(pawn.due_date);
    const now = new Date();
    return now.getTime() > due.getTime();
  };

  // Filtered pawns
  const filteredPawns = useMemo(() => {
    return pawns.filter((p) => {
      if (onlyOverdueFilter) {
        return isOverdue(p);
      }
      return true;
    });
  }, [pawns, onlyOverdueFilter]);

  // Ekstraksi seluruh riwayat perpanjangan untuk tabel kolom perpanjangan yang bisa ditarik
  const allExtensions = useMemo(() => {
    const list: Array<{
      pawn: PawnTransaction;
      extensionNumber: number;
      oldDueDate: string;
      newDueDate: string;
      principal: number;
      adminFee: number;
      interestFee: number;
      totalPaid: number;
      createdAt: string;
    }> = [];

    pawns.forEach((p) => {
      if (p.extensions && p.extensions.length > 0) {
        p.extensions.forEach((ext, idx) => {
          const adminF = ext.admin_fee_paid || Math.round(p.principal_amount * 0.10);
          const intF = ext.interest_paid || Math.round(p.principal_amount * 0.10);
          list.push({
            pawn: p,
            extensionNumber: ext.extension_number || idx + 1,
            oldDueDate: ext.old_due_date,
            newDueDate: ext.new_due_date,
            principal: p.principal_amount,
            adminFee: adminF,
            interestFee: intF,
            totalPaid: adminF + intF,
            createdAt: ext.created_at,
          });
        });
      } else if (p.status === 'EXTENDED' || isOverdue(p)) {
        // Mock / active perpanjangan pending
        const adminF = Math.round(p.principal_amount * 0.10);
        const intF = Math.round(p.principal_amount * 0.10);
        list.push({
          pawn: p,
          extensionNumber: 1,
          oldDueDate: p.loan_date,
          newDueDate: p.due_date,
          principal: p.principal_amount,
          adminFee: adminF,
          interestFee: intF,
          totalPaid: adminF + intF,
          createdAt: p.loan_date,
        });
      }
    });

    return list;
  }, [pawns]);

  // Perhitungan total di bawah kolom perpanjangan
  const extensionSummary = useMemo(() => {
    const totalCount = allExtensions.length;
    const totalPrincipal = allExtensions.reduce((acc, curr) => acc + curr.principal, 0);
    const totalAdminFee = allExtensions.reduce((acc, curr) => acc + curr.adminFee, 0);
    const totalInterestFee = allExtensions.reduce((acc, curr) => acc + curr.interestFee, 0);
    const grandTotal = allExtensions.reduce((acc, curr) => acc + curr.totalPaid, 0);

    return { totalCount, totalPrincipal, totalAdminFee, totalInterestFee, grandTotal };
  }, [allExtensions]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: PawnStatus, overdue: boolean) => {
    if (overdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse shadow-xs">
          🔴 TELAT (&gt; 10 HARI)
        </span>
      );
    }
    switch (status) {
      case 'WAITING_APPROVAL':
        return <Badge variant="warning">WAITING APPROVAL</Badge>;
      case 'APPROVED':
        return <Badge variant="info">APPROVED</Badge>;
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE (10 HARI)</Badge>;
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
      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaksi Gadai</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Unit Gadai Mandiri (UGM)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Siklus 10 hari · Biaya admin 10% · Bunga 10% editable · Taksiran instan · Bukti fisik 2 lembar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Notice Rian: Scan Foto Kertas Formulir Manual */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1.5 text-xs font-bold cursor-pointer shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4 text-amber-600" />
            <span>📸 Foto Kertas Manual (Auto-Fill)</span>
          </button>

          {/* Setting Printer dengan Kertas UGM */}
          <button
            type="button"
            onClick={() => setIsPrinterSettingsOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Setting Printer UGM</span>
          </button>

          {/* Buat Transaksi Gadai Baru */}
          <button
            type="button"
            onClick={() => {
              handlePrincipalChange(10000000);
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Toggle Blok Merah */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan No Pawning (PWN-...), Nasabah, atau No Plat..."
            className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Blok Merah Nasabah Telat */}
          <button
            type="button"
            onClick={() => setOnlyOverdueFilter(!onlyOverdueFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              onlyOverdueFilter
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>🔴 Hanya Nasabah Telat (Blok Merah)</span>
          </button>

          {/* Toggle Buka/Tarik Kolom Perpanjangan */}
          <button
            type="button"
            onClick={() => setShowExtensionDrawer(!showExtensionDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showExtensionDrawer
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>📊 {showExtensionDrawer ? 'Tutup Kolom Perpanjangan' : 'Tarik Kolom Perpanjangan & Total'}</span>
          </button>

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

      {/* Main Container with Resizable / Expandable Perpanjangan Column */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* Main Table Card */}
        <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm flex-1 w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">No SBG / Tgl</th>
                  <th className="px-5 py-3.5">Nasabah</th>
                  <th className="px-5 py-3.5">Barang Agunan & No Plat</th>
                  <th className="px-5 py-3.5">Pokok Pinjaman</th>
                  <th className="px-5 py-3.5">Admin (10%) & Bunga (10%)</th>
                  <th className="px-5 py-3.5">Jatuh Tempo (10 Hari)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPawns.map((p) => {
                  const overdue = isOverdue(p);
                  const plate = p.appraisal?.asset?.license_plate;
                  const adminF = p.administration_fee || Math.round(p.principal_amount * 0.10);
                  const interestF = p.interest_amount || Math.round(p.principal_amount * (p.interest_rate / 100));

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        overdue
                          ? 'bg-rose-50/90 hover:bg-rose-100 border-l-4 border-l-rose-600 font-medium'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* No SBG */}
                      <td className="px-5 py-3.5">
                        <span className={`font-mono font-bold block ${overdue ? 'text-rose-900' : 'text-emerald-800'}`}>
                          {p.pawn_number}
                        </span>
                        <span className="text-[11px] text-slate-500">{new Date(p.loan_date).toLocaleDateString('id-ID')}</span>
                      </td>

                      {/* Nasabah (DIBLOK MERAH jika telat lewat 10 hari) */}
                      <td className="px-5 py-3.5">
                        <div className={overdue ? 'p-1 rounded bg-rose-100 border border-rose-300 w-fit' : ''}>
                          <span className={`font-bold block ${overdue ? 'text-rose-950 font-black' : 'text-slate-900'}`}>
                            {p.customer?.full_name || 'Nasabah UGM'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{p.customer?.phone || p.customer?.nik}</span>
                        </div>
                      </td>

                      {/* Barang Agunan & NOMOR PLAT KENDARAAN */}
                      <td className="px-5 py-3.5">
                        <span className="text-slate-900 font-bold block">
                          {p.appraisal?.asset?.brand} {p.appraisal?.asset?.model}
                        </span>
                        {plate ? (
                          <div className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-black text-[11px] border border-slate-700 tracking-wider shadow-2xs">
                            <Car className="w-3 h-3 text-amber-400" />
                            <span>{plate}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">{p.appraisal?.asset?.asset_code}</span>
                        )}
                      </td>

                      {/* Pokok Pinjaman */}
                      <td className="px-5 py-3.5 font-mono font-black text-slate-900 text-xs">
                        {formatIDR(p.principal_amount)}
                      </td>

                      {/* Admin 10% & Bunga 10% */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] text-slate-700 block">
                            Admin (10%): <strong className="font-mono">{formatIDR(adminF)}</strong>
                          </span>
                          <span className="text-[11px] text-emerald-800 block">
                            Bunga ({p.interest_rate}%): <strong className="font-mono">{formatIDR(interestF)}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Jatuh Tempo (10 Hari) */}
                      <td className="px-5 py-3.5">
                        <span className={`font-bold text-xs ${overdue ? 'text-rose-700 font-black' : 'text-slate-800'}`}>
                          {new Date(p.due_date).toLocaleDateString('id-ID')}
                        </span>
                        <span className="block text-[10px] text-slate-400">Siklus 10 Hari</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">{getStatusBadge(p.status, overdue)}</td>

                      {/* Aksi Operasional */}
                      <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                        {/* Tombol Perpanjang jika telat lewat 10 hari atau aktif */}
                        {(overdue || p.status === 'ACTIVE') && (
                          <button
                            type="button"
                            title="Perpanjang Gadai (Admin 10% + Bunga 10%)"
                            onClick={() => {
                              setExtendingPawn(p);
                              setIsExtensionModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Perpanjang</span>
                          </button>
                        )}

                        {/* Approval untuk Alno / Manager / Admin */}
                        {p.status === 'WAITING_APPROVAL' && canApprove && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPawn(p);
                              setIsApproveOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Approval
                          </button>
                        )}

                        {/* Pencairan Kasir */}
                        {p.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPawn(p);
                              setIsDisburseOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Cairkan Kasir
                          </button>
                        )}

                        {/* Cetak Nota UGM 2 Lembar (Fisik) */}
                        <button
                          type="button"
                          title="Cetak Bukti Fisik 2 Lembar (Arsip UGM + Bukti Nasabah)"
                          onClick={() => {
                            setSelectedPawnForReceipt(p);
                            setIsReceiptOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-pink-600" />
                          <span>Nota UGM</span>
                        </button>

                        {/* Kirim Nota Langsung ke WA Nasabah */}
                        <button
                          type="button"
                          title="Kirim Nota langsung ke WA Nasabah"
                          onClick={() => {
                            setSelectedPawnForReceipt(p);
                            setIsReceiptOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WA</span>
                        </button>

                        {/* Detail */}
                        <button
                          type="button"
                          onClick={() => navigate(`/pawn-transactions/${p.id}`)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium cursor-pointer transition-colors border border-slate-200 inline-flex items-center"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3 ml-0.5 text-emerald-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Kolom Perpanjangan yang Bisa Ditarik / Expandable Drawer with Grand Total Footer (Item 11) */}
        {showExtensionDrawer && (
          <div
            style={{ width: `${drawerWidth}px` }}
            className="bg-white border-2 border-slate-300 rounded-2xl shadow-lg p-4 space-y-3 shrink-0 flex flex-col justify-between max-h-[780px] sticky top-4 font-sans"
          >
            {/* Header Drawer */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Kolom Perpanjangan Gadai (10 Hari)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtensionDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Setiap perpanjangan 10 hari dikenakan biaya admin 10% + bunga 10%.
              </p>

              {/* Slider Pengatur Lebar Kolom (Bisa Ditarik) */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <span>Tarik Lebar Kolom:</span>
                <input
                  type="range"
                  min="360"
                  max="620"
                  value={drawerWidth}
                  onChange={(e) => setDrawerWidth(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-ew-resize"
                />
                <span className="font-mono">{drawerWidth}px</span>
              </div>
            </div>

            {/* List Riwayat Perpanjangan */}
            <div className="overflow-y-auto max-h-[460px] space-y-2 pr-1 divide-y divide-slate-100">
              {allExtensions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">Belum ada data perpanjangan aktif</div>
              ) : (
                allExtensions.map((ext, idx) => (
                  <div key={idx} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-700">{ext.pawn.pawn_number}</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[10px]">
                        Perpanjangan Ke-{ext.extensionNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-900 font-semibold">
                      <span>{ext.pawn.customer?.full_name || 'Nasabah UGM'}</span>
                      <span className="font-mono text-emerald-800 font-bold">{formatIDR(ext.totalPaid)}</span>
                    </div>

                    {ext.pawn.appraisal?.asset?.license_plate && (
                      <span className="inline-block px-1.5 py-0.2 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                        {ext.pawn.appraisal?.asset?.license_plate}
                      </span>
                    )}

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-0.5">
                      <span>Admin (10%): {formatIDR(ext.adminFee)}</span>
                      <span>Bunga: {formatIDR(ext.interestFee)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sticky Grand Total Footer di Bawah Kolom Perpanjangan (Item 11) */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-1.5">
                <span className="text-slate-300 font-semibold">Total Frekuensi Perpanjang:</span>
                <span className="font-bold text-emerald-400 font-mono">{extensionSummary.totalCount} Transaksi</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="block text-[10px] text-slate-400">Total Admin (10%):</span>
                  <span className="font-mono font-bold">{formatIDR(extensionSummary.totalAdminFee)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Total Bunga (10%):</span>
                  <span className="font-mono font-bold text-emerald-300">{formatIDR(extensionSummary.totalInterestFee)}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">GRAND TOTAL PERPANJANGAN:</span>
                <span className="text-sm font-black font-mono text-emerald-400">{formatIDR(extensionSummary.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL BUAT TRANSAKSI BARU ================= */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Transaksi Gadai Baru (UGM)" maxWidth="2xl">
        <form onSubmit={handleCreatePawn} className="space-y-4 text-xs font-sans text-slate-800">
          {/* Pilih Nasabah */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Pilih Nasabah</label>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsScannerOpen(true);
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto Formulir Manual Kertas?</span>
              </button>
            </div>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="">-- Pilih Nasabah Terdaftar --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_code} - {c.full_name} ({c.nik})
                </option>
              ))}
            </select>
          </div>

          {/* Notice Rian: Taksiran Harga Barang Instan (Masukin Spek & Merk Langsung Keluar) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>⚡ Taksiran Harga Instan (Notice Rian: Ketik Merk & Spek Langsung Keluar):</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                Database Pasar Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600">Kategori</label>
                <select
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    const matches = lookupInstantEstimation(`${brandInput} ${modelInput}`, e.target.value);
                    setSuggestions(matches);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                >
                  <option value="Kendaraan">Kendaraan (Motor/Mobil)</option>
                  <option value="Handphone">Handphone</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Emas">Emas / Logam Mulia</option>
                  <option value="Elektronik">Elektronik</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600">Merk / Brand</label>
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => {
                    setBrandInput(e.target.value);
                    const matches = lookupInstantEstimation(`${e.target.value} ${modelInput}`, categoryName);
                    setSuggestions(matches);
                  }}
                  placeholder="Honda, Apple, Yamaha..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600">Model / Spek Barang</label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => handleModelSearchChange(e.target.value)}
                  placeholder="Vario 160, Beat, iPhone 13..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Tombol Cek Live Facebook Marketplace */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-medium">
                Taksiran otomatis berbasis benchmark pasar & Facebook Marketplace
              </span>
              <a
                href={getFacebookMarketplaceUrl(brandInput, modelInput)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-all shadow-2xs"
                title="Buka pencarian live Facebook Marketplace sesuai merk & model ini"
              >
                <ExternalLink className="w-3 h-3 text-blue-600" />
                <span>Cek Live di Facebook Marketplace {brandInput || modelInput ? `("${brandInput} ${modelInput}".trim())` : ''} ↗</span>
              </a>
            </div>

            {/* Quick Suggestion List dengan Range Facebook Marketplace */}
            {suggestions.length > 0 && (
              <div className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Range Harga Facebook Marketplace & Taksiran Disarankan:
                  </span>
                  <span className="text-[10px] text-slate-500">Klik salah satu opsi range untuk auto-fill pinjaman (LTV 70%)</span>
                </div>

                <div className="space-y-2">
                  {suggestions.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{item.brand} {item.model}</span>
                          {item.variant && <span className="text-[10px] text-slate-500 ml-1.5 font-medium">({item.variant})</span>}
                        </div>
                        <a
                          href={item.fbSearchUrl || getFacebookMarketplaceUrl(item.brand, item.model)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          Listing FB <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* 3 Opsi Range FB Marketplace */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item, 'min')}
                          className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors cursor-pointer"
                        >
                          <span className="text-[9px] font-bold text-amber-800 uppercase block">Batas Bawah (Min)</span>
                          <span className="text-[11px] font-extrabold text-amber-950 block">
                            {formatIDR(item.fbMarketplaceRange?.minPrice || item.marketPrice * 0.92)}
                          </span>
                          <span className="text-[9px] text-amber-700 block">
                            Pinjam: {formatIDR(Math.round(((item.fbMarketplaceRange?.minPrice || item.marketPrice * 0.92) * 0.70) / 10000) * 10000)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item, 'avg')}
                          className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-left transition-colors cursor-pointer shadow-2xs ring-1 ring-emerald-400"
                        >
                          <span className="text-[9px] font-bold text-emerald-800 uppercase block">Rata-Rata FB (Disarankan)</span>
                          <span className="text-[11px] font-extrabold text-emerald-950 block">
                            {formatIDR(item.fbMarketplaceRange?.avgPrice || item.marketPrice)}
                          </span>
                          <span className="text-[9px] text-emerald-700 block">
                            Pinjam: {formatIDR(item.recommendedLoan)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(item, 'max')}
                          className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-colors cursor-pointer"
                        >
                          <span className="text-[9px] font-bold text-indigo-800 uppercase block">Batas Atas (Max)</span>
                          <span className="text-[11px] font-extrabold text-indigo-950 block">
                            {formatIDR(item.fbMarketplaceRange?.maxPrice || item.marketPrice * 1.08)}
                          </span>
                          <span className="text-[9px] text-indigo-700 block">
                            Pinjam: {formatIDR(Math.round(((item.fbMarketplaceRange?.maxPrice || item.marketPrice * 1.08) * 0.70) / 10000) * 10000)}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* KENDARAAN: INPUT NOMOR PLAT (ITEM 8) */}
          {categoryName === 'Kendaraan' && (
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-rose-600" />
                  <span>Nomor Plat Kendaraan (Wajib Diinput):</span>
                </label>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                  Format Plat Polisi
                </span>
              </div>
              <input
                type="text"
                required={categoryName === 'Kendaraan'}
                value={licensePlateInput}
                onChange={(e) => setLicensePlateInput(e.target.value.toUpperCase())}
                placeholder="Contoh: BA 1234 XY atau B 4567 DEF"
                className="w-full bg-white border-2 border-rose-300 rounded-xl px-3 py-2 text-sm font-mono font-black text-rose-900 uppercase tracking-widest focus:outline-none focus:border-rose-500 shadow-2xs"
              />
              <p className="text-[10px] text-slate-500">
                Nomor plat akan dicetak pada Surat Bukti Gadai (SBG) 2 rangkap UGM dan dikirimkan ke WhatsApp nasabah.
              </p>
            </div>
          )}

          {/* Pokok Pinjaman, Admin 10%, dan Bunga 10% (Item 2, 3, 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pokok Pinjaman */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nominal Pokok Pinjaman (Pencairan IDR)</label>
              <input
                type="number"
                required
                value={principalAmount}
                onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Terbilang: {formatIDR(principalAmount)}</span>
            </div>

            {/* Siklus Tenor: 10 Hari */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Periode Jatuh Tempo</span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Siklus 10 Hari
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tenorDays}
                  onChange={(e) => setTenorDays(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center text-slate-900"
                />
                <div className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[11px] flex items-center">
                  Jatuh tempo: +{tenorDays} hari dari tanggal akad
                </div>
              </div>
            </div>
          </div>

          {/* Biaya Admin 10% dari Pencairan (Bisa Diedit Manual) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Biaya Admin (Default 10% dari Pencairan - Manual):</span>
              <span className="text-[11px] font-mono font-bold text-slate-900">{formatIDR(adminFee)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500">Persen Admin (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={adminPercent}
                  onChange={(e) => handleAdminPercentChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Nominal Admin (Rp)</label>
                <input
                  type="number"
                  value={adminFee}
                  onChange={(e) => handleAdminFeeChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Bunga 10% per 10 Hari (Bisa Diedit Manual / Nominal Dikurangin) */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="text-emerald-900 font-bold">Bunga / Jasa Titip (10% per 10 Hari - Bisa Diedit):</span>
              <span className="text-[11px] font-mono font-bold text-emerald-800">{formatIDR(interestAmount)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-600">Persen Bunga (% / 10 Hari)</label>
                <input
                  type="number"
                  step="0.5"
                  value={interestPercent}
                  onChange={(e) => handleInterestPercentChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600">Nominal Bunga (Rp - Bisa Dikurangi/Diskon)</label>
                <input
                  type="number"
                  value={interestAmount}
                  onChange={(e) => handleInterestAmountChange(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-900"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              * Nominal bunga dapat dikurangi secara manual sesuai kesepakatan/diskon untuk nasabah.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
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
              {submitting ? 'Memproses Transaksi...' : 'Submit Pengajuan Gadai'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL APPROVAL (UNTUK ALNO / ADMIN / MANAGER) ================= */}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Approval Transaksi Gadai (Alno / Approver)">
        <div className="space-y-4 text-xs font-sans text-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-slate-600">
              Konfirmasi persetujuan transaksi <strong className="text-emerald-700 font-mono">{selectedPawn?.pawn_number}</strong>:
            </p>
            <p>
              Nasabah: <strong>{selectedPawn?.customer?.full_name}</strong>
            </p>
            <p>
              Pokok Pinjaman: <strong className="text-emerald-800 font-mono">{formatIDR(selectedPawn?.principal_amount || 0)}</strong>
            </p>
            <p>
              Admin 10%: <strong className="font-mono">{formatIDR(selectedPawn?.administration_fee || 0)}</strong>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Catatan Persetujuan (Notes)</label>
            <input
              type="text"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => handleApproveAction('REJECT')}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 cursor-pointer transition-colors"
            >
              Tolak Transaksi
            </button>
            <button
              type="button"
              onClick={() => handleApproveAction('APPROVE')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              Setujui Transaksi (Approve)
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL PERPANJANGAN 10 HARI ================= */}
      <Modal isOpen={isExtensionModalOpen} onClose={() => setIsExtensionModalOpen(false)} title="Perpanjangan Gadai Siklus 10 Hari">
        <div className="space-y-4 text-xs font-sans text-slate-800">
          <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-orange-900 text-xs">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Ketentuan Perpanjangan: Dikenakan Admin 10% + Bunga 10%</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              Sesuai aturan operasional UGM: Pembayaran lewat 10 hari masuk ke perpanjangan dan dikenakan biaya admin 10% dari pokok pencairan.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Nomor SBG:</span>
              <strong className="font-mono">{extendingPawn?.pawn_number}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Nasabah:</span>
              <strong>{extendingPawn?.customer?.full_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pokok Pinjaman:</span>
              <strong className="font-mono">{formatIDR(extendingPawn?.principal_amount || 0)}</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-700">
              <span>Biaya Admin Perpanjangan (10%):</span>
              <strong className="font-mono">{formatIDR(Math.round((extendingPawn?.principal_amount || 0) * 0.10))}</strong>
            </div>
            <div className="flex justify-between text-emerald-800">
              <span>Bunga / Titip (10% / 10 Hari):</span>
              <strong className="font-mono">
                {formatIDR(extendingPawn?.interest_amount || Math.round((extendingPawn?.principal_amount || 0) * 0.10))}
              </strong>
            </div>
            <div className="flex justify-between border-t-2 border-slate-300 pt-1.5 text-sm font-bold text-slate-900">
              <span>Total Bayar Perpanjangan:</span>
              <span className="font-mono text-emerald-700">
                {formatIDR(
                  Math.round((extendingPawn?.principal_amount || 0) * 0.10) +
                    (extendingPawn?.interest_amount || Math.round((extendingPawn?.principal_amount || 0) * 0.10))
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsExtensionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleProcessExtension}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-colors"
            >
              Proses Perpanjangan (+10 Hari)
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL PENCAIRAN KASIR ================= */}
      <Modal isOpen={isDisburseOpen} onClose={() => setIsDisburseOpen(false)} title="Pencairan Pinjaman Kasir UGM">
        <div className="space-y-4 text-xs font-sans text-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Metode Pencairan</label>
            <select
              value={disburseMethod}
              onChange={(e) => setDisburseMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="CASH">CASH (Uang Tunai di Konter)</option>
              <option value="BANK_TRANSFER">BANK TRANSFER (Rekening Nasabah)</option>
              <option value="EWALLET">E-WALLET (GoPay / OVO / Dana)</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Nomor Rekening</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDisburseOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDisburseAction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              Proses Pencairan Rp {selectedPawn?.principal_amount.toLocaleString('id-ID')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Scanner Foto Formulir Manual Modal */}
      <ManualFormScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onApplyData={handleApplyScannedData}
      />

      {/* Setting Printer Kertas UGM Modal */}
      <PrinterSettingsModal
        isOpen={isPrinterSettingsOpen}
        onClose={() => setIsPrinterSettingsOpen(false)}
      />

      {/* Nota Fisik 2 Lembar & WA Modal */}
      <UGMReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        pawn={selectedPawnForReceipt}
      />
    </div>
  );
};
