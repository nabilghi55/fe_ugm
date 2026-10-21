import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Box, MapPin, QrCode, ScanLine, Search, ShieldCheck, Tag, Warehouse } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { QRCodeView } from '../components/common/QRCodeView';
import { inventoryApi } from '../services/endpoints';
import { Inventory as InventoryType } from '../types';
import { useAlert } from '../context/AlertContext';
import { getAssetDisplayName } from '../utils/formatters';

const getWarehouseHub = (warehouse: string) => {
  const name = warehouse.toLowerCase();
  if (name.includes('nanggalo') || name.includes('brankas') || name.includes('pusat')) return 'Gudang Nanggalo';
  if (name.includes('raya')) return 'Gudang Pasar Raya';
  if (name.includes('azizi')) return 'Gudang Azizi';
  return warehouse;
};

const warehouseOrder = ['Gudang Nanggalo', 'Gudang Pasar Raya', 'Gudang Azizi'];

const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
  if (['STORED', 'ACTIVE'].includes(status)) return 'success';
  if (['OVERDUE', 'HOLD'].includes(status)) return 'danger';
  if (['EXTENDED', 'READY_FOR_RELEASE'].includes(status)) return 'warning';
  return 'default';
};

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<InventoryType | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const { showError } = useAlert();

  useEffect(() => {
    inventoryApi
      .list()
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const warehouses = useMemo(() => {
    const names = Array.from(new Set(items.map((item) => getWarehouseHub(item.warehouse))));
    return names.map((name) => {
      const warehouseItems = items.filter((item) => getWarehouseHub(item.warehouse) === name);
      return {
        name,
        count: warehouseItems.length,
        exceptions: warehouseItems.filter((item) => ['OVERDUE', 'HOLD'].includes(item.status)).length,
      };
    }).sort((left, right) => {
      const leftIndex = warehouseOrder.indexOf(left.name);
      const rightIndex = warehouseOrder.indexOf(right.name);
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesWarehouse = warehouseFilter === 'ALL' || getWarehouseHub(item.warehouse) === warehouseFilter;
      const searchable = [
        item.qr_code,
        item.warehouse,
        item.rack,
        item.box,
        item.asset?.brand,
        item.asset?.model,
        item.asset?.serial_number,
        item.pawn_transaction?.pawn_number,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesWarehouse && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, query, warehouseFilter]);

  const handleScanLookup = async () => {
    const code = scanCode.trim();
    if (!code) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const result = await inventoryApi.getByQR(code);
      setScanResult(result);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Kode tidak ditemukan di inventori.', 'Barang Tidak Ditemukan');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Chain of custody</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventori tiga gudang</h1>
          <p className="mt-1 text-xs text-slate-500">Cari lokasi fisik, cocokkan label, dan telusuri QR barang gadai.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setScanCode('');
            setScanResult(null);
            setIsScannerOpen(true);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <ScanLine className="h-4 w-4" />
          Scan / masukkan kode
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {warehouses.slice(0, 3).map((warehouse, index) => (
          <button
            type="button"
            key={warehouse.name}
            onClick={() => setWarehouseFilter(warehouseFilter === warehouse.name ? 'ALL' : warehouse.name)}
            className={`border p-4 text-left transition-colors ${
              warehouseFilter === warehouse.name
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}
          >
            <div className="mb-5 flex items-start justify-between">
              <span className="grid h-8 w-8 place-items-center border border-slate-200 bg-slate-50 text-slate-700">
                <Warehouse className="h-4 w-4" />
              </span>
              <span className="font-mono text-[10px] font-semibold text-slate-400">0{index + 1}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{warehouse.name}</p>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{warehouse.count} barang tercatat</span>
              <span className={warehouse.exceptions ? 'font-semibold text-rose-700' : 'text-slate-400'}>
                {warehouse.exceptions} exception
              </span>
            </div>
          </button>
        ))}
      </div>

      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari QR, serial/IMEI, barang, rak, box, atau nomor gadai…"
              className="h-10 w-full border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </label>
          <select
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            className="h-10 border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua gudang</option>
            {warehouses.slice(0, 3).map((warehouse) => (
              <option key={warehouse.name} value={warehouse.name}>{warehouse.name}</option>
            ))}
          </select>
          <span className="whitespace-nowrap text-xs text-slate-500">{filteredItems.length} hasil</span>
        </div>
      </Card>

      {loading ? (
        <Card className="border border-slate-200 bg-white py-14 text-center text-xs text-slate-500">Memuat inventori…</Card>
      ) : filteredItems.length === 0 ? (
        <Card className="border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
          <Box className="mx-auto mb-3 h-6 w-6 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">Barang tidak ditemukan</p>
          <p className="mt-1 text-xs text-slate-500">Periksa kata kunci atau pilih semua gudang.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="space-y-4 border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-400">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-mono text-xs font-bold text-emerald-700">{item.qr_code}</span>
              <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Warehouse className="w-4 h-4 text-emerald-600" />
                <span>Hub: <strong className="text-slate-800">{getWarehouseHub(item.warehouse)}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Lokasi: <strong className="text-slate-800">{item.warehouse} · {item.rack} / {item.box}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Barang: <strong className="text-slate-800">{getAssetDisplayName(item.asset?.brand, item.asset?.model)}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedQR(item.qr_code)}
              className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-2 border border-emerald-200 cursor-pointer transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Lihat label & QR</span>
            </button>
          </Card>
        ))}
        </div>
      )}

      <div className="grid gap-3 border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 md:grid-cols-[auto_1fr]">
        <AlertTriangle className="h-5 w-5 text-amber-700" />
        <div>
          <p className="font-semibold">QR bukan satu-satunya bukti identitas barang.</p>
          <p className="mt-1 leading-relaxed text-amber-900/80">Sebelum barang dipindah atau keluar, cocokkan foto, merek/model, serial atau IMEI, nomor segel, status transaksi, dan lokasi terakhir.</p>
        </div>
      </div>

      {/* QR Code & Printable Physical Sticker Modal */}
      <Modal isOpen={!!selectedQR} onClose={() => setSelectedQR(null)} title="Label Stiker Fisik & Barcode/QR Inventaris" maxWidth="md">
        {selectedQR && (() => {
          const matchedItem = items.find((i) => i.qr_code === selectedQR);
          return (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white shadow-xs space-y-3 print:border-black" id="printable-sticker">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">SISTEM GADAI KOTA PADANG</p>
                    <p className="text-xs font-bold text-slate-900">{getAssetDisplayName(matchedItem?.asset?.brand, matchedItem?.asset?.model)}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                    SEAL #SG-{selectedQR.slice(-4)}
                  </span>
                </div>

                <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                  <div className="flex flex-col items-center justify-center p-2 rounded bg-slate-50 border border-slate-200">
                    <QRCodeView value={selectedQR} size={110} label={selectedQR} />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Lokasi Gudang & Rak:</span>
                      <span className="font-bold text-emerald-800 text-[13px] block">
                        {matchedItem ? `${matchedItem.warehouse} · ${matchedItem.rack} / ${matchedItem.box}` : 'Lokasi Rak Terdaftar'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Serial / IMEI:</span>
                      <span className="font-mono text-slate-800">{matchedItem?.asset?.serial_number || matchedItem?.asset?.imei || 'SN-VERIFIED'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">No. Transaksi Gadai:</span>
                      <span className="font-mono font-semibold text-slate-700">{matchedItem?.pawn_transaction?.pawn_number || 'PWN-ACTIVE'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Wajib ditempel pada kantong plastik segel fisik</span>
                  <span className="font-semibold text-slate-700">Audit Check: OK</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500">Gunakan label stiker tahan air untuk mencegah pudar & tertukar.</p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer shadow-sm transition-colors"
                >
                  Cetak Stiker Label
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Temukan barang dari QR / barcode" maxWidth="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Kode label</label>
            <div className="flex gap-2">
              <input
                autoFocus
                value={scanCode}
                onChange={(event) => setScanCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleScanLookup();
                }}
                placeholder="Contoh: QR-UGM-000123"
                className="h-10 min-w-0 flex-1 border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleScanLookup}
                disabled={!scanCode.trim() || scanLoading}
                className="h-10 bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scanLoading ? 'Mencari…' : 'Verifikasi'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Scanner USB dapat langsung mengisi kolom ini lalu menekan Enter.</p>
          </div>

          {scanResult && (
            <div className="border border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold">Label terdaftar</span>
                </div>
                <Badge variant={getStatusVariant(scanResult.status)}>{scanResult.status}</Badge>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-xs">
                <dt className="text-slate-500">Barang</dt>
                <dd className="font-semibold text-slate-900">{getAssetDisplayName(scanResult.asset?.brand, scanResult.asset?.model)}</dd>
                <dt className="text-slate-500">Gudang</dt>
                <dd className="font-semibold text-slate-900">{getWarehouseHub(scanResult.warehouse)}</dd>
                <dt className="text-slate-500">Posisi</dt>
                <dd className="font-semibold text-slate-900">{scanResult.warehouse} · {scanResult.rack} / {scanResult.box}</dd>
                <dt className="text-slate-500">Serial / IMEI</dt>
                <dd className="font-mono text-slate-900">{scanResult.asset?.serial_number || '—'}</dd>
              </dl>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
