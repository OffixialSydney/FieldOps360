import { useEffect } from 'react';
import { supabase } from './supabase';

/* Runs onChange the moment a table changes, and again when the person comes back to this tab */
export function useLive(table, onChange) {
  useEffect(() => {
    const channel = supabase
      .channel(`live-${table}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
      .subscribe();
    const wake = () => { if (document.visibilityState === 'visible') onChange(); };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('focus', wake);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('focus', wake);
    };
  }, [table, onChange]);
}
