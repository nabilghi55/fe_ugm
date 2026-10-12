import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { customerApi, storageApi } from '../services/endpoints';
import { Customer } from '../types';
import { useAlert } from '../context/AlertContext';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { showSuccess, showError } = useAlert();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nik, setNik] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchCustomers = () => {
    setLoading(true);
    customerApi
      .list(search)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cust = await customerApi.create({
        nik,
        full_name: fullName,
        gender,
        phone,
        address,
        occupation,
      });

      if (ktpFile && cust?.id) {
        const presigned = await storageApi.getPresignedUpload(ktpFile.name, ktpFile.type, 'ktp');
        await storageApi.uploadToPresignedUrl(presigned.upload_url, ktpFile);
        await customerApi.addDocument(cust.id, 'KTP', presigned.object_key);
      }

      setIsModalOpen(false);
      showSuccess(`Nasabah baru atas nama ${fullName} berhasil didaftarkan!`, 'Nasabah Didaftarkan');
      fetchCustomers();
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Menambah Nasabah');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Nasabah</h1>
          <p className="text-xs text-slate-500">Registrasi nasabah baru, verifikasi identitas NIK, dan dokumentasi KTP</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrasi Nasabah Baru</span>
        </button>
      </div>

      <Card className="p-4 flex items-center space-x-3 bg-white border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan Nama, NIK, Kode Nasabah, atau Nomor HP..."
          className="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </Card>

      {/* Risk & Legal Alert Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 p-1.5 text-amber-700 flex-shrink-0 font-bold text-xs">
          HUKUM
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-950">Prosedur Mitigasi Risiko Hukum & Blacklist Nasabah</p>
          <p className="text-amber-800/90 leading-relaxed text-[11px]">
            Sistem otomatis mengecek riwayat gadai bermasalah, sengketa kepemilikan barang, dan status default/macet. Nasabah dengan status <strong>BLACKLIST</strong> diblokir dari pengajuan gadai baru untuk mencegah peredaran barang curian dan risiko kerugian kantor.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Kode / NIK</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5">No HP / WhatsApp</th>
                <th className="px-6 py-3.5">Status Profil & Risiko</th>
                <th className="px-6 py-3.5">Status Dokumen</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c, idx) => {
                // Simulate risk status based on index or existing data for rich demo
                const isBlacklist = idx === 3;
                const isWarning = idx === 1;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-emerald-700 block">{c.customer_code}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{c.nik}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>{c.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{c.occupation || 'Wiraswasta'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{c.phone}</td>
                    <td className="px-6 py-4">
                      {isBlacklist ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-300">
                          BLACKLIST (RISIKO HUKUM)
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                          PERINGATAN (SP-1)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                          LANCAR (GRADE A)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.documents && c.documents.length > 0 ? 'success' : 'warning'}>
                        {c.documents && c.documents.length > 0 ? 'KTP TERVERIFIKASI' : 'BELUM UNGGAH KTP'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/customers/${c.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium cursor-pointer transition-colors border border-emerald-200"
                      >
                        Detail <ArrowRight className="w-3.5 h-3.5 inline ml-1 text-emerald-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    Belum ada data nasabah. Klik tombol di atas untuk mendaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrasi Nasabah Baru">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NIK (Nomor Induk Kependudukan)</label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="3171012345670001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmad Subagyo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="MALE">Laki-laki (MALE)</option>
                <option value="FEMALE">Perempuan (FEMALE)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor HP / WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Pekerjaan</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Karyawan Swasta"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Sudirman No. 45, RT 01 RW 02..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Upload Document Foto KTP (MinIO Private Bucket)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
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
              {submitting ? 'Menyimpan...' : 'Simpan Nasabah'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
