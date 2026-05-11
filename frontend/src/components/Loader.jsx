import { motion } from 'framer-motion';

const Loader = () => (
  <motion.div
    className="loader-wrap"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="spinner">
      <div className="spin-ring spin-outer" />
      <div className="spin-ring spin-inner" />
    </div>

    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <motion.p
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        Analiz ediliyor…
      </motion.p>
      <p style={{ fontSize: 12, color: 'var(--t3)' }}>
        Yapay zeka modeli görüntüyü inceliyor
      </p>
    </div>

    <div className="loader-dots">
      {[0, 1, 2].map((i) => (
        <span key={i} className="loader-dot" style={{ animationDelay: `${i * 0.13}s` }} />
      ))}
    </div>
  </motion.div>
);

export default Loader;
