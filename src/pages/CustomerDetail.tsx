import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { customerApi } from '../services/endpoints';
import { Customer } from '../types';
import { useAlert } from '../context/AlertContext';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      customerApi
        .get(id)
        .then((res) => setCustomer(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleVerifyOCR = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    if (!docId) return;
    try {
      await customerApi.verifyOCR(docId, { status });
      showSuccess(`Status dokumen OCR KTP berhasil diubah menjadi ${status}`, 'Verifikasi OCR Selesai');
      if (id) {
        const updated = await customerApi.get(id);
        setCustomer(updated);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || err.message, 'Gagal Update Status OCR');
    }
  };

  if (loading || !customer) {
    return <div className="p-8 text-center text-slate-500">Loading detail nasabah...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Back Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{customer.full_name}</h1>
          <p className="text-xs text-emerald-700 font-mono font-bold">Kode Nasabah: {customer.customer_code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Bio Card */}
        <Card className="lg:col-span-1 space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Pribadi Nasabah</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">NIK</span>
              <span className="font-mono font-bold text-slate-800">{customer.nik}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nomor HP / WA</span>
              <span className="text-slate-800 font-medium">{customer.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Email</span>
              <span className="text-slate-800">{customer.email || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pekerjaan</span>
              <span className="text-slate-800">{customer.occupation || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Alamat Lengkap</span>
              <span className="text-slate-800">{customer.address || '-'}</span>
            </div>
          </div>
        </Card>

        {/* Customer Document & OCR Card */}
        <Card className="lg:col-span-2 space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Dokumentasi KTP & Verification OCR</span>
            <Badge variant="info">MinIO Signed Temporary URL</Badge>
          </h3>

          <div className="space-y-4">
            {customer.documents && customer.documents.length > 0 ? (
              customer.documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 mb-2 block">Foto {doc.document_type}</span>
                    {doc.view_url ? (
                      <img src={doc.view_url} alt="KTP Document" className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm" />
                    ) : (
                      <div className="w-full h-48 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs border border-slate-200">
                        Gambar Privat MinIO
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Hasil OCR Extraction</span>
                      <Badge variant={doc.verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                        {doc.verification_status} ({doc.ocr_confidence || 90}%)
                      </Badge>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1">
                      <p>NIK: 3171012345670001</p>
                      <p>Nama: NASABAH VERIFIED OCR</p>
                      <p>Tgl Lahir: 1990-05-15</p>
                      <p>Status: UNVERIFIED REVIEW NEEDED</p>
                    </div>

                    <div className="pt-2 flex space-x-2">
                      <button
                        onClick={() => handleVerifyOCR(doc.id, 'VERIFIED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verifikasi & Konfirmasi</span>
                      </button>
                      <button
                        onClick={() => handleVerifyOCR(doc.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-rose-100 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tolak KTP</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada dokumen KTP ter-upload.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
