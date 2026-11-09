import { useRef, useState } from 'preact/hooks';

interface Props {
  folder: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  label?: string;
}

function processImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      const outDim = Math.min(size, 1200);
      canvas.width = outDim; canvas.height = outDim;
      const ctx = canvas.getContext('2d')!;
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, outDim, outDim);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Error al procesar')), 'image/webp', 0.85);
    };
    img.onerror = () => reject(new Error('Error al cargar imagen'));
  });
}

export default function AdminImageUpload({ folder, currentUrl, onUpload, label }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file)); setError(''); setUploading(true); setProgress(0);
    try {
      const webp = await processImage(file);
      const f = (window as any).__fb;
      const filePath = `landing/${folder}/${Date.now()}.webp`;
      const storageRef = f.ref(f.storage, filePath);
      const task = f.uploadBytesResumable(storageRef, webp, { contentType: 'image/webp' });
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed',
          (snap: any) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          (err: any) => reject(err),
          () => resolve(),
        );
      });
      const url = await f.getDownloadURL(task.snapshot.ref);
      setPreview(url); onUpload(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false); setProgress(0);
    }
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{label || 'Imagen'}</label>
      {preview && (
        <div style={{ marginBottom: '8px', position: 'relative' }}>
          <img src={preview} alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }} />
          <button onClick={() => { setPreview(null); onUpload(''); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>x</button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px dashed #334155', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: uploading ? 'not-allowed' : 'pointer' }}>{uploading ? `Subiendo... ${progress}%` : preview ? 'Cambiar imagen' : 'Seleccionar imagen'}</button>
      {uploading && <div style={{ marginTop: '8px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: '#3B7DD8', borderRadius: '2px', transition: 'width .2s' }} /></div>}
      {error && <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
