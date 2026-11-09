import { useEffect, useState } from 'preact/hooks';
import { getFirestoreDb, getFirebaseStorage } from '../lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getLocale, type Locale } from '../lib/i18n';
import es from '../data/locales/es.json';
import en from '../data/locales/en.json';
import ja from '../data/locales/ja.json';

const translations = { es, en, ja };

interface TuristaFoto {
  id: string;
  imagePath: string;
  format: string;
  description: string;
  approved: boolean;
  createdAt: number;
}

export default function PhotoGallery() {
  const [open, setOpen] = useState(false);
  const [fotos, setFotos] = useState<TuristaFoto[]>([]);
  const [tab, setTab] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [locale, setLocale] = useState<Locale>(getLocale());
  const copy = translations[locale];

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      setTab(0);
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('open-photo-gallery', handleOpen);
    return () => window.removeEventListener('open-photo-gallery', handleOpen);
  }, []);

  useEffect(() => {
    function handleLanguageChange() {
      setLocale(getLocale());
    }
    window.addEventListener('langchange', handleLanguageChange);
    return () => window.removeEventListener('langchange', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLoadError('');
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      const q = collection(db, 'fotos_turistas');
      unsub = onSnapshot(q, (snap) => {
        const list: TuristaFoto[] = [];
        snap.forEach((doc) => {
          const data = doc.data();
          if (!data.approved) return;
          list.push({
            id: doc.id,
            imagePath: data.imagePath || '',
            format: data.format || 'vertical',
            description: data.description || '',
            approved: true,
            createdAt: data.createdAt?.toMillis?.() || 0,
          });
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
        setFotos(list);
        setLoading(false);
      }, (err: any) => {
        console.error('PhotoGallery error:', err);
        setLoadError(err.message || 'No se pudieron cargar las fotos');
        setLoading(false);
      });
    } catch (e: any) {
      console.error('PhotoGallery init error:', e);
      setLoadError('Error al conectar con la galería');
      setLoading(false);
    }
    return () => { if (unsub) unsub(); };
  }, [open]);

  function close() {
    setOpen(false);
    setPreviewUrl(null);
    setPreviewFile(null);
    setDescription('');
    setError('');
    setUploadSuccess(false);
    setLightbox(null);
    document.body.style.overflow = '';
  }

  function handleFilePick(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }

  async function handleUpload() {
    if (!previewFile) return;
    setUploading(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = previewUrl!;
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Failed to load image')); });
      const maxDim = 800;
      const size = Math.min(img.width, img.height);
      const outDim = Math.min(size, maxDim);
      canvas.width = outDim;
      canvas.height = outDim;
      const ctx = canvas.getContext('2d')!;
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, outDim, outDim);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.85));
      if (!blob) throw new Error('Canvas conversion failed');
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `landing/fotos-turistas/${Date.now()}.webp`);
      await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
      const url = await getDownloadURL(storageRef);
      const db = getFirestoreDb();
      await addDoc(collection(db, 'fotos_turistas'), {
        imagePath: url,
        format: 'vertical',
        description: description.trim(),
        approved: false,
        createdAt: serverTimestamp(),
      });
      setPreviewUrl(null);
      setPreviewFile(null);
      setDescription('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
      setTab(0);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div class="fixed inset-0 z-[100] flex items-end justify-center" onClick={close}>
      <div class="absolute inset-0 bg-black/50" />
      <div class="relative bg-card-white rounded-t-[24px] w-full max-w-[600px] max-h-[85vh] flex flex-col animate-fade-in-up" onClick={(e: any) => e.stopPropagation()}>
        <div class="flex items-center border-b border-divider px-lg py-md flex-shrink-0">
          <div class="w-10 h-10 rounded-sm bg-header-blue/10 flex items-center justify-center mr-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B7DD8" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
           <span class="text-lg font-bold text-text-primary flex-1">{copy.galeria_visitantes}</span>
           <button type="button" onClick={close} aria-label={copy.cerrar} class="w-9 h-9 rounded-sm bg-divider flex items-center justify-center border-none cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="flex border-b border-divider flex-shrink-0">
          <button type="button" class={`flex-1 py-md text-sm font-semibold border-none bg-transparent cursor-pointer ${tab === 0 ? 'text-header-blue border-b-[3px] border-header-blue' : 'text-text-secondary'}`} onClick={() => setTab(0)}>{copy.galeria}</button>
          <button type="button" class={`flex-1 py-md text-sm font-semibold border-none bg-transparent cursor-pointer ${tab === 1 ? 'text-header-blue border-b-[3px] border-header-blue' : 'text-text-secondary'}`} onClick={() => { setTab(1); setUploadSuccess(false); }}>{copy.subir_foto}</button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto custom-scroll">
          {uploadSuccess && (
            <div class="bg-green-dark/10 border-b border-green-dark/30 p-md flex items-center gap-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span class="text-sm font-medium text-green-dark">{copy.foto_enviada}</span>
            </div>
          )}
          {tab === 0 && (
            <div class="p-md">
              <div class="mb-lg flex flex-col gap-md rounded-lg border border-header-blue/20 bg-header-blue/5 p-md sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-start gap-sm">
                  <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-header-blue/10 text-header-blue">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-text-primary">{copy.comparte_tu_momento}</p>
                    <p class="mt-xs text-xs leading-snug text-text-secondary">{copy.comparte_tu_momento_desc}</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setTab(1); setUploadSuccess(false); setError(''); }} class="w-full flex-shrink-0 rounded-md border-none bg-header-blue px-md py-sm text-sm font-semibold text-white shadow-sm cursor-pointer transition-colors hover:bg-header-blue-dark sm:w-auto">
                  {copy.subir_foto}
                </button>
              </div>
              {loading && (
                <div class="flex flex-col items-center justify-center py-3xl text-text-secondary">
                  <div class="w-8 h-8 border-2 border-header-blue/30 border-t-header-blue rounded-full animate-spin mb-md" />
                  <span class="text-sm">{copy.cargando_fotos}</span>
                </div>
              )}
              {loadError && !loading && (
                <p class="text-center text-red-500 text-sm py-3xl">{loadError}</p>
              )}
              {!loading && !loadError && fotos.length === 0 && (
                <p class="text-center text-text-secondary text-sm py-3xl">{copy.sin_fotos}</p>
              )}
              {!loading && !loadError && fotos.length > 0 && (
                <div class="grid grid-cols-3 gap-x-sm gap-y-lg">
                  {fotos.map((f) => (
                    <div key={f.id} class="flex flex-col">
                      <div
                        class="relative w-full aspect-square rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setLightbox(f.imagePath)}
                      >
                        <img src={f.imagePath} alt={f.description} style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center" loading="lazy" />
                      </div>
                      {f.description && (
                        <p class="text-[11px] text-text-primary font-medium leading-tight mt-sm line-clamp-2">{f.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 1 && (
            <div class="p-lg">
              <p class="text-base font-semibold text-text-primary mb-1">{copy.comparte_tu_momento}</p>
              <p class="text-xs text-text-secondary mb-lg">{copy.foto_revision}</p>

              {!previewFile ? (
                <label class="flex flex-col items-center justify-center h-[180px] bg-bg-cream rounded-md border-2 border-dashed border-header-blue/30 cursor-pointer hover:bg-header-blue/5 transition-colors">
                  <input type="file" accept="image/*" aria-label={copy.seleccionar_foto} class="hidden" onChange={handleFilePick} />
                  <div class="w-14 h-14 rounded-full bg-header-blue/10 flex items-center justify-center mb-md">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B7DD8" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <span class="text-sm text-text-secondary font-medium">{copy.seleccionar_foto}</span>
                </label>
              ) : (
                <div class="flex flex-col items-center">
                  <div class="w-full max-w-[260px] aspect-square rounded-md overflow-hidden border border-divider bg-[#1A1A1A]">
                    <img src={previewUrl!} alt={copy.vista_previa} class="w-full h-full object-contain" />
                  </div>
                  <textarea value={description} onInput={(e: any) => setDescription(e.target.value)} maxLength={50} rows={2} placeholder={copy.descripcion_opcional} aria-label={copy.descripcion_opcional} class="w-full mt-md p-md text-base border border-divider rounded-md resize-none focus:outline-none focus:border-header-blue" />
                </div>
              )}
            </div>
          )}
        </div>

        {tab === 1 && previewFile ? (
          <div class="flex-shrink-0 border-t border-divider bg-card-white p-md" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));">
            {error && <p class="mb-sm text-center text-xs text-red-500" role="alert">{error}</p>}
            <div class="flex w-full gap-sm">
              <button type="button" onClick={() => { setPreviewFile(null); setPreviewUrl(null); setDescription(''); setError(''); }} disabled={uploading} class="min-h-[48px] flex-1 rounded-md border border-divider bg-transparent px-sm text-sm font-semibold text-text-primary cursor-pointer transition-colors hover:bg-divider/20 disabled:cursor-not-allowed disabled:opacity-50">{copy.cambiar_foto}</button>
              <button type="button" onClick={handleUpload} disabled={uploading} class="flex min-h-[48px] flex-1 items-center justify-center gap-sm rounded-md border-none bg-header-blue px-sm text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors hover:bg-header-blue-dark disabled:cursor-not-allowed disabled:opacity-50">
                {uploading ? <><div class="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{copy.subiendo}</span></> : copy.subir_foto}
              </button>
            </div>
          </div>
        ) : (
          <div class="flex-shrink-0 border-t border-divider p-md" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));">
            <button type="button" onClick={close} class="w-full min-h-[48px] rounded-md border border-divider bg-transparent py-md text-base font-semibold text-text-primary cursor-pointer transition-colors hover:bg-divider/20">{copy.cerrar}</button>
          </div>
        )}
      </div>

      {lightbox && (
        <div class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-lg" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>
          <img src={lightbox} alt="" class="max-w-full max-h-full object-contain rounded-md" />
          <button onClick={() => setLightbox(null)} class="absolute top-lg right-lg w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center border-none cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
