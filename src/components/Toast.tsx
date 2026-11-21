import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'urgent';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const resolvedDuration = duration ?? (type === 'urgent' ? 7500 : 4000);
      const newToast: ToastItem = { id, message, type, title, duration: resolvedDuration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (resolvedDuration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, resolvedDuration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const isUrgent = toast.type === 'urgent';

            const IconComponent = {
              success: CheckCircle2,
              info: Info,
              warning: AlertTriangle,
              error: AlertCircle,
              urgent: ShieldAlert,
            }[toast.type];

            const accentVars = {
              success: { bg: 'var(--pastel-sage-bg)', fg: 'var(--pastel-sage-fg)' },
              info: { bg: 'var(--pastel-blue-bg)', fg: 'var(--pastel-blue-fg)' },
              warning: { bg: 'var(--pastel-sand-bg)', fg: 'var(--pastel-sand-fg)' },
              error: { bg: 'var(--pastel-rose-bg)', fg: 'var(--pastel-rose-fg)' },
              urgent: { bg: '#e11d48', fg: '#ffffff' },
            }[toast.type];

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                id={`toast-${toast.id}`}
                role={isUrgent ? 'alert' : 'status'}
                aria-live={isUrgent ? 'assertive' : 'polite'}
                style={
                  isUrgent
                    ? {
                        background: 'var(--pastel-rose-bg)',
                        borderColor: '#e11d48',
                        boxShadow: '0 12px 28px rgba(225, 29, 72, 0.18)',
                      }
                    : undefined
                }
                className={`pointer-events-auto rounded-[20px] p-3.5 flex items-start gap-3 ${
                  isUrgent
                    ? 'border-2 relative overflow-hidden'
                    : 'neu-card'
                }`}
              >
                {isUrgent && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ background: '#e11d48' }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${
                    isUrgent ? 'ml-1 shadow-sm' : ''
                  }`}
                  style={{ background: accentVars.bg, color: accentVars.fg }}
                >
                  <IconComponent className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  {isUrgent && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: '#e11d48' }}
                      />
                      <span
                        className="text-[9.5px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: '#e11d48' }}
                      >
                        Urgent Clinical Threshold Alert
                      </span>
                    </div>
                  )}
                  {toast.title && (
                    <h4 className="text-xs font-bold text-[var(--text-primary)] mb-0.5">
                      {toast.title}
                    </h4>
                  )}
                  <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed break-words">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]/80 transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
