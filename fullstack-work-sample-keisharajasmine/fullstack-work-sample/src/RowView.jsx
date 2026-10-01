import React from 'react';

export const STATUS_LABEL = {
  in_stock: 'Tersedia',
  low_stock: 'Menipis',
  out_of_stock: 'Habis',
};

export function TableHead() {
  return (
    <div className="head" role="row">
      <span className="cell-id">ID</span>
      <span>Nama produk</span>
      <span className="cell-stock">Stok</span>
      <span>Status</span>
      <span />
    </div>
  );
}

/** Tampilan satu baris (murni presentasi, dipakai oleh versi naive dan optimized). */
export function RowView({ product, style, flash, onChange }) {
  return (
    <div className={`row${flash ? ' flash' : ''}`} style={style} role="row">
      <span className="cell-id">{product.id}</span>
      <span className="cell-name">{product.name}</span>
      <span className="cell-stock">{product.stock}</span>
      <span>
        <span className={`badge ${product.status}`}>{STATUS_LABEL[product.status]}</span>
      </span>
      <button className="btn-row" onClick={() => onChange(product.id)}>
        Ganti status
      </button>
    </div>
  );
}

export function EmptyState({ query }) {
  return (
    <div className="empty">
      Tidak ada produk yang cocok dengan “{query}”. Coba nama lain atau ID, misalnya “Produk 120”.
    </div>
  );
}
