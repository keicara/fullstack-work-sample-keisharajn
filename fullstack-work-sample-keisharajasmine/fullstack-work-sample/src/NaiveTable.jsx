import React, { useEffect, useMemo, useState } from 'react';
import { getIds, getProduct, renderStats, startSimulator } from './store.js';
import { EmptyState, RowView, TableHead } from './RowView.jsx';

/**
 * VERSI "SEBELUM" (anti-pattern) sebagai pembanding:
 *  - seluruh array disimpan di satu state di parent
 *  - setiap update membuat array baru -> parent re-render
 *  - Row tidak di-memo + handler inline -> semua Row ikut re-render
 *  - semua baris masuk DOM (tanpa virtualization)
 */
const STATUSES = ['in_stock', 'low_stock', 'out_of_stock'];

function Row({ product, onChange }) {
  renderStats.row++;
  return <RowView product={product} onChange={onChange} />;
}

export default function NaiveTable({ ids, query }) {
  const [products, setProducts] = useState(() => getIds().map(getProduct));

  useEffect(
    () =>
      startSimulator((updates) =>
        setProducts((prev) => {
          const map = new Map(updates.map((u) => [u.id, u.patch]));
          return prev.map((p) => (map.has(p.id) ? { ...p, ...map.get(p.id) } : p));
        }),
      ),
    [],
  );

  const visible = useMemo(() => {
    const allowed = new Set(ids);
    return products.filter((p) => allowed.has(p.id));
  }, [products, ids]);

  return (
    <div className="table" role="table" aria-label="Daftar stok produk (versi naive)">
      <TableHead />
      {visible.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="naive-scroll">
          {visible.map((p) => (
            <Row
              key={p.id}
              product={p}
              onChange={(id) =>
                setProducts((prev) =>
                  prev.map((x) =>
                    x.id === id
                      ? { ...x, status: STATUSES[(STATUSES.indexOf(x.status) + 1) % 3] }
                      : x,
                  ),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
