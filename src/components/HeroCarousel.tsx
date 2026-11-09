import { useEffect, useRef, useState } from 'preact/hooks';
import { t, getLocale } from '../lib/i18n';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb } from '../lib/firebase';

interface CarouselItem {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
}

interface Props {
  items: CarouselItem[];
}

export default function HeroCarousel({ items: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [, setLocale] = useState(getLocale());
  const imgErrors = useRef<Set<string>>(new Set());

  const len = items.length;

  useEffect(() => {
    function onLangChange() { setLocale(getLocale()); }
    window.addEventListener('langchange', onLangChange);
    return () => window.removeEventListener('langchange', onLangChange);
  }, []);

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'carousel'), (snap) => {
        const list: CarouselItem[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as CarouselItem));
        if (list.length > 0) setItems(list);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, []);

  const active = len > 0 ? current % len : 0;
  function next() { setCurrent((c) => len ? (c + 1) % len : 0); }
  function prev() { setCurrent((c) => len ? (c - 1 + len) % len : 0); }

  function scrollToFeatured() {
    const el = document.getElementById('destacados');
    if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  const fallbackImages = [
    '/assets/images/carrusel_img1.webp',
    '/assets/images/carrusel_img2.jpg',
    '/assets/images/carrusel_img3.webp',
  ];

  function handleImgError(img: CarouselItem, idx: number, e: any) {
    const fbIdx = idx % fallbackImages.length;
    const currentSrc = e.target.src;
    const fbSrc = fallbackImages[fbIdx];
    if (currentSrc !== fbSrc && fbSrc && !imgErrors.current.has(img.id + '_fb')) {
      e.target.src = fbSrc;
      imgErrors.current.add(img.id + '_fb');
    } else {
      imgErrors.current.add(img.id);
      setLocale(getLocale());
    }
  }

  if (len === 0) {
    return <div class="w-full" style={{ height: '75vw', minHeight: '300px', background: '#3B7DD8' }} />;
  }

  return (
    <div
      id="inicio"
      class="landing-hero relative w-full overflow-hidden"
      role="region"
      aria-label={t('fotos_destino')}
      onTouchStart={(e: any) => { const t = e.touches?.[0]; if (t) setTouchStart(t.clientX); }}
      onTouchEnd={(e: any) => {
        const t = e.changedTouches?.[0];
        if (!t) return;
        const diff = touchStart - t.clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          class={`absolute inset-0 transition-opacity duration-300 ease-in-out ${idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={idx !== active}
        >
          {imgErrors.current.has(item.id) ? (
            <div class="w-full h-full" style={{ background: '#3B7DD8' }} />
          ) : (
            <img
              src={item.imagePath}
              alt={item.title}
              style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center"
              width="1920"
              height="1080"
              fetchpriority={idx === 0 ? 'high' : 'auto'}
              loading={idx === 0 ? 'eager' : 'lazy'}
              onError={(e) => handleImgError(item, idx, e)}
            />
          )}
        </div>
      ))}

      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-20 pointer-events-none" />

      <div class="hero-copy" aria-live="polite" aria-atomic="true">
        <h1>{items[active]?.title}</h1>
        <p>{items[active]?.subtitle}</p>
      </div>

      <div class="hero-action">
        <button
          onClick={scrollToFeatured}
          class="hero-discover"
          data-i18n="descubre_mas"
        >{t('descubre_mas')}</button>
      </div>

      {len > 1 && (
        <>
          <button onClick={prev} class="hero-arrow hero-arrow-prev" aria-label={t('foto_anterior')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} class="hero-arrow hero-arrow-next" aria-label={t('foto_siguiente')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}
    </div>
  );
}
