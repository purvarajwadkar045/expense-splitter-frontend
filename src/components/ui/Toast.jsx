import React from 'react';
import { toast } from 'react-hot-toast';
import { MdCheckCircle, MdError, MdInfo } from 'react-icons/md';

const showToast = {
  success: (message) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-fade-in' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: 'var(--text-pure)',
          fontFamily: 'var(--font-main)',
          fontSize: '0.9rem',
          fontWeight: 600,
          pointerEvents: 'auto'
        }}
      >
        <MdCheckCircle size={22} color="var(--success)" />
        <span>{message}</span>
      </div>
    ), { position: 'top-right' });
  },

  error: (message) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-fade-in' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: 'var(--text-pure)',
          fontFamily: 'var(--font-main)',
          fontSize: '0.9rem',
          fontWeight: 600,
          pointerEvents: 'auto'
        }}
      >
        <MdError size={22} color="var(--error)" />
        <span>{message}</span>
      </div>
    ), { position: 'top-right' });
  },

  info: (message) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-fade-in' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: 'var(--text-pure)',
          fontFamily: 'var(--font-main)',
          fontSize: '0.9rem',
          fontWeight: 600,
          pointerEvents: 'auto'
        }}
      >
        <MdInfo size={22} color="var(--accent)" />
        <span>{message}</span>
      </div>
    ), { position: 'top-right' });
  }
};

export default showToast;
export { showToast as toastNotification };
