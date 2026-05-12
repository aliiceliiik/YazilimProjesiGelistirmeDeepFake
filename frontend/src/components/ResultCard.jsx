import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CheckIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarnIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

/**
 * ResultCard
 * @param {{ prediction: "Real"|"Fake", confidence: number }} props
 */
const ResultCard = ({ prediction, confidence }) => {
  const [counter, setCounter] = useState(0);

  const isReal = prediction === 'Real';
  const pct = Math.round(confidence * 100);
  const label = isReal ? 'Gerçek Görüntü' : 'Deepfake Tespit Edildi';
  const sublabel = isReal
    ? 'Bu görsel gerçek bir fotoğrafa ait görünüyor.'
    : 'Bu görsel yapay zeka tarafından üretilmiş olabilir.';

  const gradFrom = isReal ? '#10b981' : '#f43f5e';
  const gradTo = isReal ? '#34d399' : '#fb7185';
  const hiColor = isReal ? 'var(--ok-hi)' : 'var(--err-hi)';

  /* Animated confidence counter (ease-out cubic) */
  useEffect(() => {
    let raf; let start = null;
    const dur = 1100;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounter(Math.round(e * pct));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const confidenceLabel =
    pct >= 90 ? 'Yüksek güven' :
      pct >= 70 ? 'Orta güven' :
        'Düşük güven';

  return (
    <motion.div
      className={`result-card ${isReal ? 'ok' : 'err'}`}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      id="result-card"
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div
          className="result-icon-box"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.12 }}
        >
          {isReal ? <CheckIcon /> : <WarnIcon />}
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Tahmin Sonucu
          </p>
          <motion.h3
            style={{ fontSize: 20, fontWeight: 720, color: hiColor, letterSpacing: '-0.025em' }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
          >
            {label}
          </motion.h3>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="sep" />

      {/* ── Confidence ── */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', gap: 9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--t2)' }}>Model Güveni</span>
          <span style={{
            fontSize: 24, fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: hiColor,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            %{counter}
          </span>
        </div>

        {/* Progress bar */}
        <div className="prog-track">
          <motion.div
            className="prog-fill"
            style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.28 }}
          />
        </div>

        <p style={{ fontSize: 14, color: 'var(--t3)', textAlign: 'right' }}>
          {pct >= 90 ? '●' : pct >= 70 ? '◑' : '○'} {confidenceLabel}
        </p>
      </motion.div>

      {/* ── Note ── */}
      <motion.p
        style={{
          fontSize: 14.5, color: 'var(--t2)',
          lineHeight: 1.6,
          padding: '10px 12px',
          borderRadius: 10,
          background: isReal ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.05)',
          border: isReal ? '1px solid var(--ok-border)' : '1px solid var(--err-border)',
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        {sublabel}
        <br />
        <span style={{ color: 'var(--t3)', display: 'inline-block', marginTop: '6px' }}>
          Bu sonuç bir yapay zeka modeli tarafından üretilmiştir ve kesin kanıt niteliği taşımaz.
        </span>

      </motion.p>
    </motion.div>
  );
};

export default ResultCard;
