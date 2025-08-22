'use client';
import { ReactNode, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children }: { children: ReactNode }) {
  const el = useMemo(() => {
    const d = document.createElement('div');
    d.style.position = 'relative';
    d.style.zIndex = '2147483647'; // en üst
    d.style.pointerEvents = 'auto';
    return d;
  }, []);

  useEffect(() => {
    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, [el]);

  return createPortal(children, el);
}
