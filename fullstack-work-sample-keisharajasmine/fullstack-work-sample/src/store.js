import { useCallback, useSyncExternalStore } from 'react';

/**
 * Normalized store dengan subscription PER-ITEM.
 *
 * Ide utama: komponen baris hanya subscribe ke produk miliknya sendiri.
 * Saat produk #42 berubah, hanya listener milik #42 yang dipanggil,
 * sehingga hanya Row #42 yang re-render. Parent/tabel tidak ikut.
 */

const TOTAL = 5000;
const STATUSES = ['in_stock', 'low_stock', 'out_of_stock'];

export const renderStats = { row: 0 }; // hanya untuk demo/ukur jumlah render

let ids = [];
let byId = {};
const listeners = new Map(); // id -> Set<fn>

export function seedProducts(count = TOTAL) {
  ids = [];
  byId = {};
  for (let i = 1; i <= count; i++) {
    const id = `P-${i}`;
    ids.push(id);
    byId[id] = {
      id,
      name: `Produk ${i}`,
      stock: Math.floor(Math.random() * 200),
      status: STATUSES[i % 3],
    };
  }
}

export const getIds = () => ids;
export const getProduct = (id) => byId[id];

function subscribeToId(id, fn) {
  let set = listeners.get(id);
  if (!set) listeners.set(id, (set = new Set()));
  set.add(fn);
  return () => set.delete(fn);
}

/** Update satu/lebih item (dibatch). Hanya id yang berubah yang di-notify. */
export function applyUpdates(updates) {
  const touched = new Set();
  for (const { id, patch } of updates) {
    const prev = byId[id];
    if (!prev) continue;
    byId[id] = { ...prev, ...patch }; // referensi baru HANYA untuk item ini
    touched.add(id);
  }
  touched.forEach((id) => listeners.get(id)?.forEach((fn) => fn()));
}

export function cycleStatus(id) {
  const cur = byId[id];
  const next = STATUSES[(STATUSES.indexOf(cur.status) + 1) % STATUSES.length];
  applyUpdates([{ id, patch: { status: next } }]);
}

/** Hook: subscribe ke satu produk saja. */
export function useProduct(id) {
  const subscribe = useCallback((fn) => subscribeToId(id, fn), [id]);
  return useSyncExternalStore(subscribe, () => byId[id]);
}

/** Filter id berdasarkan kata kunci (nama atau ID). Nama tidak berubah, jadi aman dibaca langsung. */
export function filterIds(query) {
  const q = query.trim().toLowerCase();
  if (!q) return ids;
  return ids.filter((id) => id.toLowerCase().includes(q) || byId[id].name.toLowerCase().includes(q));
}

/** Simulasi event real-time (WebSocket/SSE): 5 item berubah tiap 250ms. */
export function startSimulator(onBatch) {
  const timer = setInterval(() => {
    const updates = [];
    for (let i = 0; i < 5; i++) {
      const id = `P-${1 + Math.floor(Math.random() * ids.length)}`;
      updates.push({
        id,
        patch: {
          stock: Math.floor(Math.random() * 200),
          status: STATUSES[Math.floor(Math.random() * 3)],
        },
      });
    }
    onBatch(updates);
  }, 250);
  return () => clearInterval(timer);
}
