import React, { useEffect, useRef, useState } from 'react';
import { renderStats } from './store.js';

const SAMPLES = 30;
const HINT = {
  optimized: 'Hanya baris yang terlihat dan berubah yang dirender ulang.',
  naive: 'Setiap pembaruan merender ulang semua baris.',
};

function barHeight(v) {
  if (v == null) return 2;
  if (v === 0) return 3;
  return 6 + (Math.log10(1 + v) / 6) * 50; // skala logaritmik, 1 juta = tinggi penuh
}

/** Mengukur jumlah render baris per detik dan menampilkan riwayat 30 detik terakhir. */
export default function RenderMeter({ mode }) {
  const [history, setHistory] = useState(() => Array(SAMPLES).fill(null));
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    renderStats.row = 0;
    const timer = setInterval(() => {
      const v = renderStats.row;
      renderStats.row = 0;
      setHistory((h) => [...h.slice(1), { v, mode: modeRef.current }]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const latest = history[SAMPLES - 1]?.v ?? 0;

  return (
    <section className="meter" aria-label="Pengukur render">
      <div className="meter-main">
        <div className="meter-value" aria-live="polite">
          {latest.toLocaleString('id-ID')}
        </div>
        <div className="meter-caption">baris dirender per detik</div>
        <p className="meter-hint">{HINT[mode]}</p>
      </div>
      <div className="meter-chart">
        <div className="bars" aria-hidden="true">
          {history.map((s, i) => (
            <span
              key={i}
              className={`bar ${s ? s.mode : 'blank'}`}
              style={{ height: barHeight(s?.v) }}
            />
          ))}
        </div>
        <div className="meter-legend">
          30 detik terakhir, skala logaritmik
        </div>
      </div>
    </section>
  );
}
