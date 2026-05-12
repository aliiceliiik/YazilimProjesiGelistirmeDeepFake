import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Accepted MIME types & labels ─────────────────────────────── */
const ACCEPTED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
]);

const ACCEPTED_EXT = '.jpg,.jpeg,.png,.webp,.heic,.heif,.bmp,.tiff,.tif';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_BYTES = 20 * 1024; // 20 KB

/* ── Validation ───────────────────────────────────────────────── */
function validate(file) {
  if (!file) return null;
  // HEIC/HEIF often arrive as 'application/octet-stream' on Windows
  const isImage = ACCEPTED_MIME.has(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (!isImage) {
    return 'Desteklenmeyen dosya formatı. JPG, PNG, WebP, HEIC, BMP veya TIFF yükleyin.';
  }
  if (file.size > MAX_BYTES) {
    return `Dosya boyutu çok büyük. Maksimum 10 MB kabul edilir (${(file.size / 1024 / 1024).toFixed(1)} MB yüklendi).`;
  }
  if (file.size < MIN_BYTES) {
    return 'Dosya boyutu çok küçük (Min 20 KB). Lütfen yapay zekanın analiz edebileceği netlikte bir fotoğraf yükleyin.';
  }

  return null;
}

/* ── Icons ────────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const WarnIcon = () => (
  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    style={{ color: 'var(--err-hi)', flexShrink: 0, marginTop: 1 }}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

/* ──────────────────────────────────────────────────────────────
   UploadBox
   KEY FEATURE: drag counter-based state — zero flickering
   ────────────────────────────────────────────────────────────── */
const UploadBox = ({ onFileSelect, disabled = false, currentFile }) => {
  const [isDrag, setIsDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  // Counter prevents flicker from child-element dragenter/dragleave pairs
  const dragCounter = useRef(0);
  // Ana sayfadan currentFile null yapıldığında önizlemeyi de sil
  useEffect(() => {
    if (!currentFile) {
      setPreview(null);
    }
  }, [currentFile]);


  /* ── Process a file ─ */
  const handleFile = useCallback((file) => {
    setError('');
    const err = validate(file);
    if (err) { setError(err); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 250 || img.height < 250) {
          setError('Çözünürlük çok düşük. Detaylı analiz için fotoğraf en az 250x250 piksel boyutunda olmalıdır.');
          return;
        }
        setPreview(e.target.result);
        onFileSelect(file);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  /* ── Drag events (counter-based — NO flicker) ─ */
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDrag(true);  // first enter only
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDrag(false); // last leave only
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDrag(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* ── Click / input ─ */
  const handleClick = () => {
    if (disabled) return;
    if (preview) return; // EĞER EKRANDA RESİM VARSA DOSYA SEÇİCİYİ AÇMA
    inputRef.current?.click();
  };
  const handleChange = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; };

  /* ── Clear ─ */
  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError('');
    dragCounter.current = 0;
    setIsDrag(false);
    onFileSelect(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* ── Drop zone ── */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Görsel yükleme alanı"
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={handleClick}
        className={[
          'drop-zone',
          isDrag ? 'is-drag' : '',
          disabled ? 'is-disabled' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          onChange={handleChange}
          disabled={disabled}
          id="file-upload-input"
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {/* Clear button on top-right when preview exists */}
        {preview && !disabled && (
          <button
            onClick={handleClear}
            className="dz-remove"
            aria-label="Görseli kaldır"
            id="clear-image-btn"
          >
            ✕
          </button>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {preview ? (
            /* ── Preview ── */
            <motion.div
              key="preview"
              className="dz-inner"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
            >
              <img src={preview} alt="Önizleme" className="dz-preview-img" />
              <p className="dz-preview-name">
                {currentFile?.name} &middot; {(currentFile?.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </motion.div>
          ) : (
            /* ── Empty ── */
            <motion.div
              key="empty"
              className="dz-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="dz-icon"
                animate={isDrag ? { scale: 1.14, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              >
                <UploadIcon />
              </motion.div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <p className="dz-label">
                  {isDrag ? 'Görseli bırakın…' : 'Sürükleyin veya seçin'}
                </p>
                <p className="dz-sub">
                  JPG, PNG, WebP, HEIC, BMP, TIFF &bull; Maks 10 MB
                </p>
                <p style={{ fontSize: 13, color: 'var(--brand-hi)', marginTop: 8, fontWeight: 500 }}>
                  * En iyi sonuç için yalnızca tek ve net bir yüz içeren fotoğraflar yükleyin.
                </p>
              </div>

              {!isDrag && (
                <span className="dz-browse">
                  <ImageIcon /> Dosya seç
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Validation error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="err"
            className="error-box"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WarnIcon />
            <p style={{ fontSize: 14, color: 'var(--err-hi)', lineHeight: 1.55 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadBox;
