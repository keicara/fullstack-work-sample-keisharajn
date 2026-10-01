import React, { memo, useEffect, useMemo, useRef } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { applyUpdates, cycleStatus, renderStats, startSimulator, useProduct } from './store.js';
import { EmptyState, RowView, TableHead } from './RowView.jsx';

/**
 * Row hanya subscribe ke produknya sendiri (useProduct) dan dibungkus
 * React.memo + areEqual dari react-window, jadi tidak ikut re-render
 * saat item lain berubah atau saat parent re-render.
 */
const ProductRow = memo(function ProductRow({ index, style, data }) {
  const id = data.ids[index];
  const product = useProduct(id);
  renderStats.row++;

  // Hitung berapa kali produk ini berubah, dipakai untuk menyorot baris yang baru diperbarui
  const tracker = useRef({ product, n: 0 });
  if (tracker.current.product !== product) {
    tracker.current = { product, n: tracker.current.n + 1 };
  }
  const { n } = tracker.current;

  return <RowView key={n} product={product} style={style} flash={n > 0} onChange={data.onChange} />;
}, areEqual);

// key per id (bukan per index) supaya instance baris tidak "tertukar" saat hasil pencarian berubah
const itemKey = (index, data) => data.ids[index];
const LIST_STYLE = { scrollbarGutter: 'stable' };

function OptimizedTable({ ids, query }) {
  // itemData stabil selama daftar id tidak berubah; onChange adalah fungsi modul (referensi permanen)
  const itemData = useMemo(() => ({ ids, onChange: cycleStatus }), [ids]);

  useEffect(() => startSimulator(applyUpdates), []);

  return (
    <div className="table" role="table" aria-label="Daftar stok produk">
      <TableHead />
      {ids.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <List
          height={480}
          width="100%"
          itemCount={ids.length}
          itemSize={44}
          itemData={itemData}
          itemKey={itemKey}
          overscanCount={8}
          style={LIST_STYLE}
        >
          {ProductRow}
        </List>
      )}
    </div>
  );
}

export default memo(OptimizedTable);
