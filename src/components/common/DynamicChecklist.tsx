import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, MinusCircle, Plus, Trash2, RotateCcw } from 'lucide-react';

export interface ChecklistItem {
  item_name: string;
  status: 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN';
  notes: string;
}

export const getCategoryPreset = (categoryName: string = ''): ChecklistItem[] => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('emas') || lower.includes('gold') || lower.includes('perhiasan')) {
    return [
      { item_name: 'Uji Kadar Karat (XRF / Batu Uji)', status: 'GOOD', notes: '' },
      { item_name: 'Berat Timbangan Digital (Gram)', status: 'GOOD', notes: '' },
      { item_name: 'Cap / Stamp Produsen (Antam/UBPE)', status: 'GOOD', notes: '' },
      { item_name: 'Kejernihan / Fisik Bebas Cacat', status: 'GOOD', notes: '' },
      { item_name: 'Kuitansi & Sertifikat Original', status: 'GOOD', notes: '' },
    ];
  }
  if (lower.includes('phone') || lower.includes('hp') || lower.includes('smartphone')) {
    return [
      { item_name: 'Layar & LCD (Bebas Shadow/Dead Pixel)', status: 'GOOD', notes: '' },
      { item_name: 'Sensitivitas Touchscreen', status: 'GOOD', notes: '' },
      { item_name: 'Kamera Depan & Belakang', status: 'GOOD', notes: '' },
      { item_name: 'Kesehatan Baterai & Charging', status: 'GOOD', notes: '' },
      { item_name: 'Speaker & Microphone', status: 'GOOD', notes: '' },
      { item_name: 'WiFi, Bluetooth & Sinyal SIM', status: 'GOOD', notes: '' },
      { item_name: 'Keamanan (Fingerprint / Face ID)', status: 'GOOD', notes: '' },
      { item_name: 'Kondisi Casing & Bezel Fisik', status: 'GOOD', notes: '' },
      { item_name: 'Kesesuaian IMEI & Segel', status: 'GOOD', notes: '' },
    ];
  }
  if (lower.includes('laptop') || lower.includes('komputer') || lower.includes('pc')) {
    return [
      { item_name: 'Display & Layar Monitor', status: 'GOOD', notes: '' },
      { item_name: 'Keyboard & Trackpad / Mouse', status: 'GOOD', notes: '' },
      { item_name: 'Charger & Power Adapter Original', status: 'GOOD', notes: '' },
      { item_name: 'Daya Tahan Baterai', status: 'GOOD', notes: '' },
      { item_name: 'Port Output (USB / Type-C / HDMI)', status: 'GOOD', notes: '' },
      { item_name: 'Kekuatan Engsel / Hinge', status: 'GOOD', notes: '' },
      { item_name: 'WiFi, Audio & Webcam', status: 'GOOD', notes: '' },
      { item_name: 'Body Casing & Kemulusan', status: 'GOOD', notes: '' },
    ];
  }
  if (lower.includes('kamera') || lower.includes('camera')) {
    return [
      { item_name: 'Kondisi Sensor & Lensa Optik', status: 'GOOD', notes: '' },
      { item_name: 'Flash & Autofocus System', status: 'GOOD', notes: '' },
      { item_name: 'Tombol Shutter & Dial Controller', status: 'GOOD', notes: '' },
      { item_name: 'Layar LCD Flip / Viewfinder', status: 'GOOD', notes: '' },
      { item_name: 'Slot Memory Card Reader', status: 'GOOD', notes: '' },
      { item_name: 'Baterai & Charger Original', status: 'GOOD', notes: '' },
      { item_name: 'Body Casing & Rubber Grip', status: 'GOOD', notes: '' },
    ];
  }
  if (lower.includes('motor') || lower.includes('kendaraan') || lower.includes('mobil')) {
    return [
      { item_name: 'Kelengkapan Surat (STNK & BPKB)', status: 'GOOD', notes: '' },
      { item_name: 'Kesesuaian Nomor Rangka & Mesin', status: 'GOOD', notes: '' },
      { item_name: 'Kondisi Fisik Cat & Body', status: 'GOOD', notes: '' },
      { item_name: 'Kelistrikan, Starter & Lampu', status: 'GOOD', notes: '' },
      { item_name: 'Performa Mesin & Oli', status: 'GOOD', notes: '' },
      { item_name: 'Kondisi Rem & Ketebalan Ban', status: 'GOOD', notes: '' },
    ];
  }
  return [
    { item_name: 'Kondisi Fisik Utama', status: 'GOOD', notes: '' },
    { item_name: 'Kelengkapan Aksesoris / Bawaan', status: 'GOOD', notes: '' },
    { item_name: 'Segel Garansi / Pabrik', status: 'GOOD', notes: '' },
    { item_name: 'Fungsi Operasional Utama', status: 'GOOD', notes: '' },
  ];
};

interface Props {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  categoryName?: string;
}

export const DynamicChecklist: React.FC<Props> = ({ items, onChange, categoryName = '' }) => {
  const [newItemName, setNewItemName] = useState('');

  const handleStatusChange = (index: number, status: 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN') => {
    const updated = [...items];
    updated[index].status = status;
    onChange(updated);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updated = [...items];
    updated[index].notes = notes;
    onChange(updated);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const updated: ChecklistItem[] = [...items, { item_name: newItemName.trim(), status: 'GOOD' as const, notes: '' }];
    onChange(updated);
    setNewItemName('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleLoadDefaultPreset = () => {
    const defaultItems = getCategoryPreset(categoryName);
    onChange(defaultItems);
  };

  const statusOptions: { value: 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN'; label: string; color: string; icon: any }[] = [
    { value: 'GOOD', label: 'GOOD', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', icon: CheckCircle2 },
    { value: 'FAIR', label: 'FAIR', color: 'text-teal-700 bg-teal-50 border-teal-300', icon: MinusCircle },
    { value: 'POOR', label: 'POOR', color: 'text-amber-700 bg-amber-50 border-amber-300', icon: AlertCircle },
    { value: 'BROKEN', label: 'BROKEN', color: 'text-rose-700 bg-rose-50 border-rose-300', icon: XCircle },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Checklist Pemeriksaan Fisik & Fungsi {categoryName ? `(${categoryName})` : ''}
          </h4>
          <p className="text-[11px] text-slate-500">Evaluasi kelayakan item gadai sebelum penafsiran nilai LTV</p>
        </div>
        <button
          type="button"
          onClick={handleLoadDefaultPreset}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Muat Preset {categoryName || 'Kategori'}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
          <p className="text-xs font-medium text-amber-800">
            Belum ada poin pemeriksaan untuk kategori {categoryName || 'barang'} ini.
          </p>
          <button
            type="button"
            onClick={handleLoadDefaultPreset}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
          >
            + Muat Standard Checklist {categoryName}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={`${item.item_name}-${idx}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative group hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 truncate" title={item.item_name}>
                  {item.item_name}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-0.5">
                    {statusOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = item.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleStatusChange(idx, opt.value)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-0.5 cursor-pointer transition-colors ${
                            isSelected ? opt.color : 'text-slate-500 border-slate-200 bg-white hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Hapus poin checklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Catatan kondisi spesifik..."
                value={item.notes}
                onChange={(e) => handleNotesChange(idx, e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Item */}
      <div className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Tambah poin pemeriksaan custom (cth: Nota Garansi, Adapter, Dus Box)..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddItem();
            }
          }}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleAddItem}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>
    </div>
  );
};
