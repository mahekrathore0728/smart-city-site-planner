import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export default function ToastStack() {
  const { toasts, removeToast } = useAppStore();
  if (!toasts.length) return null;
  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span style={{ flexShrink: 0, marginTop: 1 }}>
            {t.type === 'success' && <CheckCircle size={15} color="var(--green)" />}
            {t.type === 'error' && <AlertCircle size={15} color="var(--red)" />}
            {t.type === 'info' && <Info size={15} color="var(--blue)" />}
          </span>
          <span style={{ flex: 1, fontSize: 'var(--text-base)' }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0, display: 'flex' }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
