import React from 'react';
import { useOS } from '../context/OSContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationToasts() {
  const { notifications, removeToast } = useOS();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />;
      case 'danger':
        return <AlertCircle size={16} style={{ color: 'var(--color-danger)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />;
      default:
        return <Info size={16} style={{ color: 'var(--color-info)' }} />;
    }
  };

  return (
    <div className="toast-container">
      {notifications.map((toast) => (
        <div key={toast.id} className="toast">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {getIcon(toast.type)}
            <span style={{ fontSize: '13px', fontWeight: 500 }}>{toast.text}</span>
          </div>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="toast-close" 
            style={{ background: 'none', border: 'none', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
