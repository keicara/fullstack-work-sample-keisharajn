import React, { useDeferredValue, useMemo, useState } from 'react';
import NaiveTable from './NaiveTable.jsx';
import OptimizedTable from './OptimizedTable.jsx';
import RenderMeter from './RenderMeter.jsx';
import { filterIds, seedProducts } from './store.js';

seedProducts(5000);

export default function App() {
  const [mode, setMode] = useState('optimized');
  const [query, setQuery] = useState('');

  // useDeferredValue: ketikan di kolom pencarian tetap responsif walau memfilter 5.000 item
  const deferredQuery = useDeferredValue(query);
  const ids = useMemo(() => filterIds(deferredQuery), [deferredQuery]);

  return (
    <main className="page">
      <header className="page-head">
        <h1>Stok produk</h1>
        <p>5.000 produk dengan pembaruan real-time. Bandingkan versi sebelum dan sesudah optimasi.</p>
      </header>

      <RenderMeter mode={mode} />

      <div className="toolbar">
        <div className="segmented" role="group" aria-label="Pilih versi tabel">
          <button aria-pressed={mode === 'naive'} onClick={() => setMode('naive')}>
            <i className="dot naive" /> Sebelum (naive)
          </button>
          <button aria-pressed={mode === 'optimized'} onClick={() => setMode('optimized')}>
            <i className="dot optimized" /> Sesudah (optimized)
          </button>
        </div>
        <label className="search">
          <span className="sr-only">Cari produk</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau ID produk"
          />
        </label>
        <span className="count">
          {ids.length.toLocaleString('id-ID')} produk
        </span>
      </div>

      {/* key mereset state tabel saat berganti versi */}
      {mode === 'naive' ? (
        <NaiveTable key="naive" ids={ids} query={deferredQuery} />
      ) : (
        <OptimizedTable key="optimized" ids={ids} query={deferredQuery} />
      )}
    </main>
  );
}
