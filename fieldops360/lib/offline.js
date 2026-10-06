import { supabase } from './supabase';

const KEY = 'fo:queue';
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
};
const write = (q) => { try { localStorage.setItem(KEY, JSON.stringify(q)); } catch (e) { /* storage full or blocked */ } };
const isNetworkError = (err) => /fetch|network|failed to load/i.test(err?.message || '');

export const queueSize = () => (typeof window === 'undefined' ? 0 : read().length);

/* Saves a change now when online, or keeps it on this device until the connection returns */
export async function updateOrQueue(table, id, patch) {
  if (navigator.onLine) {
    const { error } = await supabase.from(table).update(patch).eq('id', id);
    if (!error) return { ok: true };
    if (!isNetworkError(error)) return { ok: false, error };
  }
  write([...read(), { table, id, patch, at: Date.now() }]);
  return { ok: true, queued: true };
}

/* Sends queued changes in the order they were made */
export async function flushQueue() {
  const failed = [];
  let queue = read();
  while (queue.length) {
    const item = queue[0];
    const { error } = await supabase.from(item.table).update(item.patch).eq('id', item.id);
    if (error && isNetworkError(error)) break;
    if (error) failed.push(error.message);
    queue = queue.slice(1);
    write(queue);
  }
  return { failed };
}

export function clearCache() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('fo:cache:')).forEach((k) => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }
}
