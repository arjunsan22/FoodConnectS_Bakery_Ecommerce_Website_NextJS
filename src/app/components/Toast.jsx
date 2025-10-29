'use client';
import React, { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', isVisible = false, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [isVisible, onClose]);

  if (!show) return null;

  const styles = {
    success: 'from-pink-500 via-rose-500 to-orange-500 border-pink-300/50',
    error: 'from-orange-500 via-red-500 to-pink-600 border-orange-300/50',
    info: 'from-fuchsia-500 via-pink-500 to-orange-400 border-fuchsia-300/50'
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div 
      className="fixed top-6 right-6 z-50 animate-[slideIn_0.4s_ease-out]"
      style={{
        animation: show ? 'slideIn 0.4s ease-out' : 'slideOut 0.3s ease-in'
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.3);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOut {
          to {
            opacity: 0;
            transform: translateX(100px) scale(0.5);
          }
        }
        @keyframes shine {
          to { transform: translateX(200%); }
        }
        @keyframes progress {
          to { width: 0%; }
        }
      `}</style>

      <div className={`relative overflow-hidden px-5 py-4 rounded-2xl backdrop-blur-xl border-2 shadow-2xl bg-gradient-to-br ${styles[type]} text-white`}>
        {/* Shine effect */}
        <div 
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ animation: 'shine 2s infinite linear' }}
        />

        <div className="relative flex items-center gap-3">
          {/* Icon */}
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            {icons[type]}
          </div>

          {/* Message */}
          <p className="font-semibold text-sm pr-8">{message}</p>

          {/* Close button */}
          <button
            onClick={() => {
              setShow(false);
              onClose?.();
            }}
            className="absolute right-3 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/40"
          style={{ width: '100%', animation: 'progress 3s linear' }}
        />

        {/* Glow */}
        <div className={`absolute -inset-1 rounded-2xl blur-xl opacity-50 -z-10 bg-gradient-to-r ${styles[type]}`} />
      </div>
    </div>
  );
}