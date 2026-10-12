import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, ShieldAlert } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState extends AlertOptions {
  isOpen: boolean;
  type: AlertType;
  title: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showConfirm: (options: { title: string; message: string; onConfirm: () => void; confirmText?: string; cancelText?: string }) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = ({
    type = 'info',
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }: AlertOptions) => {
    const defaultTitles: Record<AlertType, string> = {
      success: 'Transaksi / Proses Berhasil',
      error: 'Terjadi Kendala Sistem',
      warning: 'Perhatian & Konfirmasi',
      info: 'Informasi Penting',
    };

    setAlert({
      isOpen: true,
      type,
      title: title || defaultTitles[type],
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
    });
  };

  const showSuccess = (message: string, title?: string) => showAlert({ type: 'success', title, message });
  const showError = (message: string, title?: string) => showAlert({ type: 'error', title, message });
  const showWarning = (message: string, title?: string) => showAlert({ type: 'warning', title, message });
  const showConfirm = ({
    title,
    message,
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
  }: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }) =>
    showAlert({
      type: 'warning',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
    });

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Intercept default browser window.alert calls globally to present rich modals!
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      showError(msg, 'Notifikasi Sistem');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const alertConfig = {
    success: {
      icon: CheckCircle2,
      badgeText: 'BERHASIL',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconContainer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    error: {
      icon: XCircle,
      badgeText: 'KENDALA',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      iconContainer: 'bg-red-50 text-red-700 border-red-200',
      btnPrimary: 'bg-red-700 hover:bg-red-800 text-white',
    },
    warning: {
      icon: AlertTriangle,
      badgeText: 'PERHATIAN',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconContainer: 'bg-amber-50 text-amber-700 border-amber-200',
      btnPrimary: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
    info: {
      icon: Info,
      badgeText: 'INFORMASI',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      iconContainer: 'bg-sky-50 text-sky-700 border-sky-200',
      btnPrimary: 'bg-sky-700 hover:bg-sky-800 text-white',
    },
  };

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showConfirm, hideAlert }}>
      {children}

      {alert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 animate-fade-in">
          <div className="relative w-full max-w-md space-y-5 overflow-hidden rounded-[10px] border border-slate-200 bg-white p-6 text-center shadow-xl animate-scale-in">

            {/* Top Bar with Badge & Close */}
            <div className="flex items-center justify-between relative z-10">
              <span className={`inline-flex items-center px-2 py-1 rounded border text-[10px] font-semibold uppercase tracking-[0.08em] ${config.badgeBg}`}>
                <span>{config.badgeText}</span>
              </span>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => {
                  if (alert.onCancel) alert.onCancel();
                  hideAlert();
                }}
                className="grid h-8 w-8 place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center relative z-10 pt-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-md border ${config.iconContainer}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>

            {/* Title and Message */}
            <div className="space-y-2 relative z-10">
              <h3 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-slate-950 sm:text-xl">
                {alert.title}
              </h3>
              <div className="max-h-48 overflow-y-auto border-y border-slate-200 py-3">
                <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line sm:text-sm">
                  {alert.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 relative z-10">
              {alert.cancelText && (
                <button
                  type="button"
                  onClick={() => {
                    if (alert.onCancel) alert.onCancel();
                    hideAlert();
                  }}
                  className="w-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 sm:w-1/2"
                >
                  {alert.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (alert.onConfirm) alert.onConfirm();
                  hideAlert();
                }}
                className={`${alert.cancelText ? 'w-full sm:w-1/2' : 'w-full'} px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors ${config.btnPrimary}`}
              >
                {alert.confirmText || 'Mengerti & Lanjutkan'}
              </button>
            </div>

            {/* Footer Brand Note */}
            <div className="pt-1 text-[10px] text-slate-400 font-medium flex items-center justify-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-emerald-600" />
              <span>Sistem Informasi Gadai Terpadu Padang</span>
            </div>

          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
