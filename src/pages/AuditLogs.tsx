import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { auditLogApi } from '../services/endpoints';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditLogApi
      .list()
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Audit Logs & Security Trail</h1>
        <p className="text-xs text-slate-500">Pencatatan aktivitas sensitif pengguna (LOGIN, APPROVE, DISBURSE, PAYMENT, OCR_VERIFY)</p>
      </div>

      <Card className="overflow-hidden p-0 bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Pengguna</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Entitas</th>
                <th className="px-6 py-3.5">IP Address</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{log.user?.username || 'admin_pusat'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={log.action === 'LOGIN' ? 'info' : log.action === 'APPROVE' ? 'success' : 'purple'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-700">{log.entity}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{log.new_value || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    Belum ada catatan audit log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
