import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

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
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const newToast: ToastItem = { id, message, type, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const IconComponent = {
              success: CheckCircle2,
              info: Info,
              warning: AlertTriangle,
              error: AlertCircle,
            }[toast.type];

            const accentVars = {
              success: { bg: 'var(--pastel-sage-bg)', fg: 'var(--pastel-sage-fg)' },
              info: { bg: 'var(--pastel-blue-bg)', fg: 'var(--pastel-blue-fg)' },
              warning: { bg: 'var(--pastel-sand-bg)', fg: 'var(--pastel-sand-fg)' },
              error: { bg: 'var(--pastel-rose-bg)', fg: 'var(--pastel-rose-fg)' },
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
                role="status"
                className="pointer-events-auto neu-card rounded-[20px] p-3.5 flex items-start gap-3"
              >
                <span
                  className="w-8 h-8 rounded-full grid place-items-center shrink-0"
                  style={{ background: accentVars.bg, color: accentVars.fg }}
                >
                  <IconComponent className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
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
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
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
