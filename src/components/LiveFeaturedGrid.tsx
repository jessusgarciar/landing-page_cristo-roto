import { useEffect, useState } from 'preact/hooks';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, type FeaturedItem } from '../lib/firebase';
import { getLocale, type Locale } from '../lib/i18n';
import es from '../data/locales/es.json';
import en from '../data/locales/en.json';
import ja from '../data/locales/ja.json';

const translations = { es, en, ja };

interface Props {
  items: FeaturedItem[];
}

export default function LiveFeaturedGrid({ items: initial }: Props) {
  const [items, setItems] = useState(initial);
  const [locale, setLocale] = useState<Locale>('es');
  const copy = translations[locale];

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'destacados'), (snap) => {
        const list: FeaturedItem[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as FeaturedItem));
        if (list.length > 0) setItems(list);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    function handleLanguageChange() {
      setLocale(getLocale());
    }
    setLocale(getLocale());
    window.addEventListener('langchange', handleLanguageChange);
    return () => window.removeEventListener('langchange', handleLanguageChange);
  }, []);

  return (
    <section id="destacados" class="px-md py-lg md:py-xl">
      <h2 class="text-[22px] font-bold text-text-primary mb-lg" data-i18n="lo_destacado">Lo Destacado</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
        {items.map((item) => (
          (() => {
            const isPhotoCard = item.icon === '📸' || item.title.includes('Vista');
            return (
              <div
                key={item.id}
                class={`bg-card-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12)] p-md flex flex-col items-center text-center cursor-pointer transition-shadow duration-200 hover:shadow-md ${isPhotoCard ? 'featured-photo-card ring-2 ring-header-blue/15' : ''}`}
                role={isPhotoCard ? 'button' : undefined}
                tabIndex={isPhotoCard ? 0 : undefined}
                onClick={() => {
                  if (isPhotoCard) {
                    window.dispatchEvent(new CustomEvent('open-photo-gallery'));
                  }
                }}
                onKeyDown={(event: KeyboardEvent) => {
                  if (isPhotoCard && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent('open-photo-gallery'));
                  }
                }}
              >
                <svg aria-hidden="true" class="mb-sm text-header-blue" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  {isPhotoCard ? <><path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/></>
                    : /lancha|traslado/i.test(item.title) || item.icon === '⛵' ? <><path d="M12 3v12M12 3l7 9h-7M9 6l-5 6h5M3 16l3 4h12l3-4H3ZM3 22l3-1 3 1 3-1 3 1 3-1 3 1"/></>
                    : /precio|tarifa/i.test(item.title) || item.icon === '🎫' ? <><path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5ZM15 5v3m0 3v2m0 3v3"/></>
                    : /segur/i.test(item.title) || item.icon === '🛡️' ? <><path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>
                    : <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>}
                </svg>
                <span class="text-sm font-semibold text-text-primary leading-tight">{item.title}</span>
                {!isPhotoCard && <span class="text-xs text-text-secondary leading-snug mt-xs line-clamp-3">{item.description}</span>}
                {isPhotoCard && (
                  <span class="mt-md inline-flex items-center gap-xs rounded-pill bg-header-blue/10 px-sm py-xs text-[11px] font-semibold text-header-blue" data-i18n="comparte_tu_momento">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    {copy.comparte_tu_momento}
                  </span>
                )}
              </div>
            );
          })()
        ))}
      </div>
    </section>
  );
}
