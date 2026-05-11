import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadBox    from './components/UploadBox';
import ResultCard   from './components/ResultCard';
import Loader       from './components/Loader';
import { predictImage } from './services/api';

/* ── Framer variants ───────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4,0,0.2,1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const heightReveal = {
  initial: { opacity: 0, height: 0, overflow: 'hidden' },
  animate: { opacity: 1, height: 'auto', overflow: 'hidden', transition: { duration: 0.3, ease: [0.4,0,0.2,1] } },
  exit:    { opacity: 0, height: 0,    overflow: 'hidden', transition: { duration: 0.22 } },
};

/* ── Icon helpers ──────────────────────────────────────────────── */
const SunIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
  </svg>
);

const ApiErrIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    style={{ color:'var(--err-hi)', flexShrink:0, marginTop:1 }}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

/* ── App ───────────────────────────────────────────────────────── */
export default function App() {
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [apiErr,  setApiErr]  = useState('');
  const [dark,    setDark]    = useState(true);

  /* Apply theme to <html> element */
  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark);
  }, [dark]);

  const handleFileSelect = useCallback((f) => {
    setFile(f);
    setResult(null);
    setApiErr('');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setApiErr('');
    try {
      const data = await predictImage(file);
      setResult(data);
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.detail ?? err.response.data?.message ?? 'Analiz başarısız oldu.';
        setApiErr(`Sunucu hatası (${err.response.status}): ${msg}`);
      } else if (err.request) {
        setApiErr('Sunucuya bağlanılamadı. Backend servisinin çalıştığını kontrol edin.');
      } else {
        setApiErr(`Beklenmeyen hata: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setApiErr('');
  }, []);

  /* Can the user analyze? */
  const canAnalyze = file && !loading && !result;

  return (
    <>
      {/* ── Animated background ── */}
      <div className="scene" aria-hidden="true">
        <div className="scene-blob scene-blob-1" />
        <div className="scene-blob scene-blob-2" />
        <div className="scene-blob scene-blob-3" />
        <div className="scene-grid" />
      </div>

      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="logo-mark" aria-hidden="true">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="logo-text">Deepfake Tespit</span>
        </div>

        <motion.button
          onClick={() => setDark((p) => !p)}
          className="icon-btn"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          title={dark ? 'Açık temaya geç' : 'Koyu temaya geç'}
          id="theme-toggle-btn"
          aria-label="Tema değiştir"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={dark ? 'sun' : 'moon'}
              initial={{ rotate: -25, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{ rotate: 25,     opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: 'flex' }}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </header>

      {/* ── Main ── */}
      <main className="main-wrap">
        <motion.div
          style={{ width: '100%', maxWidth: 488 }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4,0,0.2,1] }}
        >
          {/* ════ Card ════ */}
          <div className="card" style={{ position: 'relative' }}>
            <div className="card-body">

              {/* ── Header ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <span className="badge" style={{ alignSelf: 'flex-start' }}>
                  <span className="badge-dot" />
                  AI Destekli Analiz
                </span>
                <h1 className="heading">
                  Deepfake{' '}
                  <span>Tespit Sistemi</span>
                </h1>
                <p className="sub">
                  Bir görsel yükleyin ve gerçek mi yoksa yapay zekâ üretimi mi olduğunu anında öğrenin.
                </p>
              </div>

              <div className="sep" />

              {/* ── Upload ── */}
              <UploadBox
                onFileSelect={handleFileSelect}
                disabled={loading}
                currentFile={file}
              />

              {/* ── Analyze button ── */}
              <AnimatePresence>
                {canAnalyze && (
                  <motion.div key="cta" variants={fadeUp} initial="initial" animate="animate" exit="exit">
                    <button onClick={handleAnalyze} className="btn-primary" id="analyze-btn">
                      <SearchIcon /> Analiz Et
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Loader ── */}
              <AnimatePresence>
                {loading && (
                  <motion.div key="loader" variants={heightReveal} initial="initial" animate="animate" exit="exit">
                    <Loader />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── API Error ── */}
              <AnimatePresence>
                {apiErr && (
                  <motion.div key="apierr" variants={fadeUp} initial="initial" animate="animate" exit="exit"
                    className="error-box">
                    <ApiErrIcon />
                    <div>
                      <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--err-hi)', marginBottom: 2 }}>
                        Hata Oluştu
                      </p>
                      <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.55 }}>{apiErr}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Result ── */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    key="result"
                    variants={heightReveal}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <ResultCard
                        prediction={result.prediction}
                        confidence={result.confidence}
                      />

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                      >
                        <button onClick={handleReset} className="btn-ghost" id="reset-btn">
                          <RefreshIcon /> Yeni Analiz Başlat
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Card footer ── */}
            <div className="card-footer">
              <p style={{ fontSize: 14, color: 'var(--t3)', letterSpacing: '0.01em' }}>
                Deepfake Tespit Sistemi v1.0
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)' }} />
                <p style={{ fontSize: 14, color: 'var(--t3)' }}>Sistem aktif</p>
              </div>
            </div>
          </div>

          {/* ── Privacy note ── */}
          <motion.p
            className="foot-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            Yüklenen görüntüler yalnızca analiz amacıyla işlenir ve sunucuda saklanmaz.
          </motion.p>
        </motion.div>
      </main>
    </>
  );
}
