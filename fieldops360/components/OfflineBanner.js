'use client';
import { useEffect, useState } from 'react';
import { flushQueue, queueSize } from '../lib/offline';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    setOnline(navigator.onLine);
    setPending(queueSize());
    async function sync() {
      if (!navigator.onLine || !queueSize()) return;
      setNote('Syncing your changes...');
      const r = await flushQueue();
      setPending(queueSize());
      setNote(r.failed.length ? `Some changes could not sync: ${r.failed[0]}` : 'All changes synced.');
      window.dispatchEvent(new Event('queue-synced'));
      setTimeout(() => setNote(''), 5000);
    }
    const on = () => { setOnline(true); sync(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    const tick = setInterval(() => { setPending(queueSize()); sync(); }, 15000);
    sync();
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); clearInterval(tick); };
  }, []);

  if (online && !pending && !note) return null;
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 12, padding: '8px 16px', fontSize: 14, background: online ? '#e6f4f1' : '#fde8e8', color: online ? '#115e59' : '#b42318' }}>
      {!online
        ? `You are offline. Changes are saved on this device${pending ? ` (${pending} waiting)` : ''} and will sync when you are back online.`
        : note || `${pending} change(s) waiting to sync.`}
    </div>
  );
}
