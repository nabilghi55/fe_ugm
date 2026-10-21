import React, { useEffect, useState } from 'react';
import { Package, Plus, Image as ImageIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { DynamicChecklist, ChecklistItem, getCategoryPreset } from '../components/common/DynamicChecklist';
import { assetApi, storageApi } from '../services/endpoints';
import { Asset, AssetCategory } from '../types';
import { useAlert } from '../context/AlertContext';

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro');
  const [variant, setVariant] = useState('256GB');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei, setImei] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [year, setYear] = useState(2024);
  const [physicalCondition, setPhysicalCondition] = useState('GOOD');
  const [functionalCondition, setFunctionalCondition] = useState('GOOD');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [inspections, setInspections] = useState<ChecklistItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    assetApi.getCategories().then((res) => {
      setCategories(res);
      if (res.length > 0) {
        setCategoryId(res[0].id);
        setupChecklistForCategory(res[0]);
      }
    });

    fetchAssets();
  }, []);

  const fetchAssets = () => {
    setLoading(true);
    assetApi
      .list()
      .then((res) => setAssets(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const setupChecklistForCategory = (cat: AssetCategory) => {
    if (cat.checklists && cat.checklists.length > 0) {
      const items: ChecklistItem[] = cat.checklists.map((c) => ({
        item_name: c.item_name,
        status: 'GOOD',
        notes: '',
      }));
      setInspections(items);
    } else {
      setInspections(getCategoryPreset(cat.name));
    }
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setupChecklistForCategory(cat);
      const isVeh = cat.name.toLowerCase().includes('motor') || cat.name.toLowerCase().includes('mobil') || cat.name.toLowerCase().includes('kendaraan');
      if (!isVeh) {
        setLicensePlate('');
        setChassisNumber('');
        setEngineNumber('');
      }
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const photoPayload: { object_key: string; image_type: string; is_primary: boolean }[] = [];

      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const presigned = await storageApi.getPresignedUpload(file.name, file.type, 'asset-photos');
        await storageApi.uploadToPresignedUrl(presigned.upload_url, file);
        photoPayload.push({
          object_key: presigned.object_key,
          image_type: i === 0 ? 'FRONT' : i === 1 ? 'BACK' : 'OTHER',
          is_primary: i === 0,
        });
      }

      const selectedCat = categories.find((c) => c.id === categoryId);
      const isVeh = (selectedCat?.name || '').toLowerCase().includes('motor') || (selectedCat?.name || '').toLowerCase().includes('mobil') || (selectedCat?.name || '').toLowerCase().includes('kendaraan');

      await assetApi.create({
        category_id: categoryId,
        brand,
        model,
        variant,
        serial_number: isVeh ? undefined : serialNumber,
        imei: isVeh ? undefined : imei,
        license_plate: isVeh ? licensePlate.toUpperCase().trim() : undefined,
        chassis_number: isVeh ? chassisNumber.trim() : undefined,
        engine_number: isVeh ? engineNumber.trim() : undefined,
        year: Number(year),
        physical_condition: physicalCondition,
        functional_condition: functionalCondition,
        inspections,
        photos: photoPayload,
      });

      setIsModalOpen(false);
      showSuccess('Barang gadai baru & checklist pemeriksaan berhasil disimpan!', 'Barang Gadai Disimpan');
      fetchAssets();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Menambah Barang');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCat = categories.find((c) => c.id === categoryId);
  const catName = (selectedCat?.name || '').toLowerCase();
  const isVehicle = catName.includes('motor') || catName.includes('mobil') || catName.includes('kendaraan');
  const isGold = catName.includes('emas') || catName.includes('gold') || catName.includes('perhiasan');

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Katalog Barang Gadai</h1>
          <p className="text-xs text-slate-500">Pendaftaran barang, checklist pemeriksaan dinamis, dan foto dokumentasi multi-sudut</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Input Barang Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {assets.map((asset) => (
          <Card key={asset.id} className="space-y-3 relative group bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="h-40 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
              {asset.photos && asset.photos.length > 0 && asset.photos[0].view_url ? (
                <img src={asset.photos[0].view_url} alt={asset.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-[11px]">Foto Object Storage</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-mono text-emerald-800 font-bold border border-emerald-200">
                {asset.asset_code}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">{asset.category?.name || 'Elektronik'}</span>
              <h3 className="text-base font-bold text-slate-800">{asset.brand} {asset.model}</h3>
              <p className="text-xs text-slate-500">{asset.variant || ''} {asset.color ? `• ${asset.color}` : ''}</p>
              {asset.license_plate && (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px] tracking-wider">
                  <span>{asset.license_plate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">Kondisi:</span>
              <div className="flex space-x-1">
                <Badge variant={asset.physical_condition === 'EXCELLENT' || asset.physical_condition === 'GOOD' ? 'success' : 'warning'}>
                  Fisik: {asset.physical_condition}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Input Asset Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Input Barang Gadai & Inspection Checklist" maxWidth="4xl">
        <form onSubmit={handleCreateAsset} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kategori Barang</label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (LTV: {c.ltv_percent}%)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Brand / Merek</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Model Barang</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {isGold ? 'Kadar Karat / Berat (Gram)' : isVehicle ? 'Kapasitas Mesin (CC) / Tipe' : 'Varian / Kapasitas Storage'}
              </label>
              <input
                type="text"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder={isGold ? 'Contoh: 24 Karat / 10 Gram' : isVehicle ? 'Contoh: 150cc / CBS' : '256GB / 8GB RAM'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {!isVehicle ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {isGold ? 'Nomor Seri Sertifikat' : 'Serial Number / IMEI'}
                </label>
                <input
                  type="text"
                  value={imei || serialNumber}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder={isGold ? 'Sertifikat Antam / UBS' : '354812345678901'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tahun Pembuatan (STNK)</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
            {!isVehicle && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tahun Pembelian</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Input Spesifik Kendaraan (Hanya muncul jika kategori Kendaraan / Motor / Mobil) */}
          {isVehicle && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-amber-900">Nomor Plat Polisi (Kendaraan)</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="Contoh: BA 1234 XY"
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Rangka</label>
                <input
                  type="text"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
                  placeholder="MH1KF..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor Mesin</label>
                <input
                  type="text"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value.toUpperCase())}
                  placeholder="KF11E..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Dynamic Inspection Checklist */}
          <DynamicChecklist
            items={inspections}
            onChange={setInspections}
            categoryName={categories.find((c) => c.id === categoryId)?.name}
          />

          {/* Presigned Upload Multiple Photos */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Upload Foto Barang Multi-Sudut (Tampak Depan, Belakang, IMEI, Kerusakan)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-800 file:font-semibold cursor-pointer"
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
              {submitting ? 'Menyimpan...' : 'Simpan Barang Gadai'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
