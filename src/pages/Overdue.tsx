import React, { useState } from 'react';
import { PhoneCall, MessageCircle, AlertTriangle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAlert } from '../context/AlertContext';

export const Overdue: React.FC = () => {
  const { showSuccess } = useAlert();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);

  const [overdueItems, setOverdueItems] = useState([
    {
      pawn_number: 'PWN-260917-004',
      customer_name: 'Budi Santoso',
      phone: '081298765432',
      asset_name: 'Honda Vario 160 CBS (BA 4821 QR)',
      principal: 12000000,
      days_overdue: 4,
      bracket: '1-7 Hari (Masa Perpanjangan)',
      admin_extension_fee: 1200000, // 10%
      interest_fee: 1200000, // 10%
    },
    {
      pawn_number: 'PWN-260917-009',
      customer_name: 'Dewi Lestari',
      phone: '081311223344',
      asset_name: 'Samsung Galaxy S24 Ultra 256GB',
      principal: 9500000,
      days_overdue: 12,
      bracket: '8-14 Hari (Peringatan II)',
      admin_extension_fee: 950000, // 10%
      interest_fee: 950000, // 10%
    },
    {
      pawn_number: 'PWN-260917-015',
      customer_name: 'Eko Prasetyo',
      phone: '081555667788',
      asset_name: 'Honda Beat Street (BA 2390 LK)',
      principal: 15000000,
      days_overdue: 24,
      bracket: '15-30 Hari (Peringatan III)',
      admin_extension_fee: 1500000, // 10%
      interest_fee: 1500000, // 10%
    },
  ]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSendWA = (item: any) => {
    const totalBayar = item.admin_extension_fee + item.interest_fee;
    const msg = `*PEMBERITAHUAN JATUH TEMPO & PERPANJANGAN GADAI - UNIT GADAI MANDIRI (UGM)*
---------------------------------------------------
Yth. Bpk/Ibu *${item.customer_name}*,
Kami menginformasikan bahwa pinjaman gadai Anda *${item.pawn_number}* untuk agunan *${item.asset_name}* telah melewati jatuh tempo *${item.days_overdue} Hari*.

📌 *RINCIAN BIAYA PERPANJANGAN (10 HARI):*
• Pokok Pinjaman: ${formatIDR(item.principal)}
• Biaya Admin Perpanjangan (10%): *${formatIDR(item.admin_extension_fee)}*
• Bunga / Titip (10% / 10 Hari): *${formatIDR(item.interest_fee)}*
• *Total Wajib Bayar Perpanjangan:* *${formatIDR(totalBayar)}*

Mohon segera melakukan perpanjangan atau pelunasan ke kantor cabang UGM. Terima kasih.
_Unit Gadai Mandiri - Aman & Terpercaya_`;

    let cleanPhone = item.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleConfirmExtension = () => {
    if (!selectedItem) return;
    showSuccess(`Perpanjangan gadai ${selectedItem.pawn_number} berhasil diproses dengan Admin 10%!`, 'Perpanjangan Berhasil');
    setOverdueItems((prev) => prev.filter((i) => i.pawn_number !== selectedItem.pawn_number));
    setIsExtModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monitoring Overdue & Perpanjangan</h1>
          <p className="text-xs text-slate-500">
            Aturan UGM: Pembayaran lewat 10 hari masuk ke perpanjangan dan dikenakan biaya admin 10% (Nasabah diblok merah)
          </p>
        </div>
      </div>

      {/* Banner Peraturan Notul */}
      <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-rose-950 text-sm">
            Aturan Jatuh Tempo: Pembayaran Lewat 10 Hari Wajib Perpanjang & Dikenakan Admin 10%
          </h4>
          <p className="text-rose-800 leading-relaxed text-xs">
            Nasabah yang telah lewat 10 hari <strong>DIBLOK MERAH</strong> di sistem. Kasir wajib menagihkan <strong>Biaya Admin Perpanjangan 10%</strong> dari pokok pinjaman ditambah bunga 10% untuk memperpanjang siklus akad selama 10 hari ke depan.
          </p>
        </div>
      </div>

      {/* Overdue Accounts Table - DIBLOK MERAH SEMUA */}
      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-rose-100/70 text-rose-900 font-bold uppercase tracking-wider border-b border-rose-200">
              <tr>
                <th className="px-6 py-3.5">No Transaksi</th>
                <th className="px-6 py-3.5">Nasabah (Blok Merah)</th>
                <th className="px-6 py-3.5">Barang Agunan & Plat</th>
                <th className="px-6 py-3.5">Pokok Pinjaman</th>
                <th className="px-6 py-3.5">Biaya Admin (10%)</th>
                <th className="px-6 py-3.5">Keterlambatan</th>
                <th className="px-6 py-3.5 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {overdueItems.map((item) => (
                <tr
                  key={item.pawn_number}
                  className="bg-rose-50/80 hover:bg-rose-100/90 border-l-4 border-l-rose-600 transition-colors text-rose-950 font-medium"
                >
                  <td className="px-6 py-4 font-mono font-bold text-rose-900">{item.pawn_number}</td>
                  <td className="px-6 py-4">
                    <div className="p-1.5 rounded-lg bg-rose-200/80 border border-rose-300 w-fit">
                      <span className="font-black text-rose-950 block">{item.customer_name}</span>
                      <span className="text-[11px] text-rose-800 font-mono">{item.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.asset_name}</td>
                  <td className="px-6 py-4 font-mono font-black text-slate-900">{formatIDR(item.principal)}</td>
                  <td className="px-6 py-4 font-mono font-bold text-rose-800">
                    {formatIDR(item.admin_extension_fee)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse inline-block shadow-2xs">
                      🔴 Telat {item.days_overdue} Hari
                    </span>
                    <span className="block text-[10px] text-rose-700 mt-0.5">{item.bracket}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSendWA(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WA Nasabah</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsExtModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Perpanjang (Admin 10%)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Proses Perpanjangan */}
      <Modal isOpen={isExtModalOpen} onClose={() => setIsExtModalOpen(false)} title="Konfirmasi Perpanjangan Gadai (Admin 10%)">
        <div className="space-y-4 text-xs font-sans text-slate-800">
          <p className="text-slate-600">
            Nasabah <strong className="text-rose-700 font-bold">{selectedItem?.customer_name}</strong> akan diperpanjang masa gadainya selama <strong>+10 Hari</strong> ke depan.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span>Pokok Pinjaman:</span>
              <strong className="font-mono">{formatIDR(selectedItem?.principal || 0)}</strong>
            </div>
            <div className="flex justify-between text-rose-700 font-bold">
              <span>Biaya Admin Perpanjangan (10%):</span>
              <strong className="font-mono">{formatIDR(selectedItem?.admin_extension_fee || 0)}</strong>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold">
              <span>Bunga / Titip (10% / 10 Hari):</span>
              <strong className="font-mono">{formatIDR(selectedItem?.interest_fee || 0)}</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-black text-slate-900">
              <span>Total Dibayar Nasabah:</span>
              <span className="font-mono text-emerald-700">
                {formatIDR((selectedItem?.admin_extension_fee || 0) + (selectedItem?.interest_fee || 0))}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsExtModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmExtension}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-colors"
            >
              Bayar & Perpanjang (+10 Hari)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
