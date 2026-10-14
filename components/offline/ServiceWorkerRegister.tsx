'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('SafeSphere PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('SafeSphere PWA Service Worker registration notice:', err);
          });
      });
    }
  }, []);

  return null;
}
