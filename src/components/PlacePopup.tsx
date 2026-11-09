import { useEffect, useRef, useState } from 'preact/hooks';
import { t, getLocale } from '../lib/i18n';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PlacePopupData {
  name: string;
  description: string;
  schedule: string;
  phone: string;
  imagePath?: string;
  logoPath?: string;
  address?: string;
  offers: string[];
  coordinates?: Coordinates | null;
  showOffersTab: boolean;
  placeType?: 'restaurant' | 'shop' | 'lodging' | 'service';
  offersLabelKey?: string;
  offersIntroLabelKey?: string;
}

export default function PlacePopup() {
  const [data, setData] = useState<PlacePopupData | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [, setLocale] = useState(getLocale());
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  function setThemeColor(color: string, isDark: boolean) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }

  useEffect(() => {
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent).detail as PlacePopupData;
      setData(detail);
      setOpen(true);
      setTab(0);
      document.body.style.overflow = 'hidden';
      history.pushState({ popup: true }, '');
      setThemeColor('#1a1a1a', true);
    }
    function onLangChange() { setLocale(getLocale()); }
    window.addEventListener('open-place-popup', handleOpen);
    window.addEventListener('langchange', onLangChange);
    return () => {
      window.removeEventListener('open-place-popup', handleOpen);
      window.removeEventListener('langchange', onLangChange);
    };
  }, []);

  useEffect(() => {
    function onPop() {
      if (!history.state?.popup) {
        setOpen(false);
        setData(null);
        document.body.style.overflow = '';
        if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
        setThemeColor('#3B7DD8', false);
      }
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const background = Array.from(document.body.children).filter((el) => el instanceof HTMLElement && !el.contains(dialog)) as HTMLElement[];
    const previousInert = background.map((el) => el.inert);
    background.forEach((el) => { el.inert = true; });
    dialog?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')).filter((el) => el.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      background.forEach((el, i) => { el.inert = previousInert[i]; });
      previous?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (open && tab === 0 && mapRef.current && data?.coordinates && !mapInstance.current) {
      import('leaflet').then((L: any) => {
        if (!mapRef.current || mapInstance.current) return;
        const m = L.map(mapRef.current, {
          center: [data.coordinates!.lat, data.coordinates!.lng],
          zoom: 15,
          zoomControl: false,
        });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(m);
        L.marker([data.coordinates!.lat, data.coordinates!.lng])
          .addTo(m)
          .bindPopup(data.name || '')
          .openPopup();
        L.control.zoom({ position: 'topright' }).addTo(m);
        mapInstance.current = m;
      });
    }
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [open, tab]);

  function close() {
    if (history.state?.popup) history.back();
    setOpen(false);
    setData(null);
    document.body.style.overflow = '';
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    setThemeColor('#3B7DD8', false);
  }

  function openMaps() {
    if (data?.coordinates) {
      window.open(`https://www.google.com/maps?q=${data.coordinates.lat},${data.coordinates.lng}`, '_blank');
    } else if (data?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`, '_blank');
    }
  }

  if (!open || !data) return null;

  return (
    <div class="fixed inset-0 z-[100] flex items-end justify-center" onClick={close}>
      <div class="absolute inset-0 bg-black/50" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="place-dialog-title" tabIndex={-1} class="place-dialog relative bg-card-white rounded-t-[24px] w-full max-w-[600px] max-h-[85dvh] flex flex-col animate-fade-in-up" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} onClick={(e: any) => e.stopPropagation()}>
        <div class="relative h-40 rounded-t-[24px] overflow-hidden flex-shrink-0" style={{ backgroundColor: '#3B7DD8', backgroundImage: data.imagePath ? `url(${data.imagePath})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <button onClick={close} aria-label={t('cerrar')} class="absolute top-sm right-sm w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center border-none cursor-pointer z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="absolute bottom-md left-md right-0 flex items-end gap-sm">
            <div class="w-[50px] h-[50px] rounded-full bg-card-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
              {data.logoPath ? <img src={data.logoPath} alt="" class="w-full h-full object-cover" /> : (
                data.placeType === 'lodging' ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3B7DD8" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                )
              )}
            </div>
            <div class="flex-1 min-w-0">
              <h2 id="place-dialog-title" class="text-white text-lg font-bold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] leading-tight">{data.name}</h2>
              <div class="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span class="text-white text-[11px] drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">{data.schedule}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex border-b border-divider flex-shrink-0">
          <button class={`flex-1 py-md text-sm font-semibold border-none bg-transparent cursor-pointer transition-colors ${tab === 0 ? 'text-header-blue border-b-[3px] border-header-blue' : 'text-text-secondary'}`} onClick={() => { setTab(0); if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } }} data-i18n="descripcion_mapa">{t('descripcion_mapa')}</button>
          {data.showOffersTab && (
            <button class={`flex-1 py-md text-sm font-semibold border-none bg-transparent cursor-pointer transition-colors ${tab === 1 ? 'text-header-blue border-b-[3px] border-header-blue' : 'text-text-secondary'}`} onClick={() => setTab(1)} data-i18n={data.offersLabelKey || 'lo_que_ofrecen'}>{t(data.offersLabelKey || 'lo_que_ofrecen')}</button>
          )}
        </div>

        <div class="flex-1 overflow-y-auto custom-scroll">
          {tab === 0 && (
            <div class="p-lg">
              <p class="text-sm text-text-primary leading-relaxed mb-lg">{data.description}</p>
              {data.phone && (
                <a href={`tel:${data.phone}`} class="flex items-center justify-center gap-sm w-full bg-header-blue text-white font-semibold text-sm py-md rounded-md no-underline mb-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  <span data-i18n="llamar">{t('llamar')}</span> {data.phone}
                </a>
              )}
              <div class="flex items-center gap-sm mb-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8772E" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span class="text-base font-semibold text-text-primary" data-i18n="ubicacion">{t('ubicacion')}</span>
              </div>
              <div class="w-full h-[200px] rounded-md border border-divider overflow-hidden relative">
                <div ref={mapRef} class="w-full h-full" />
                {data.coordinates && (
                  <button onClick={openMaps} class="absolute bottom-sm right-sm bg-header-blue text-white text-[11px] font-semibold px-sm py-xs rounded-sm border-none cursor-pointer flex items-center gap-1 z-[1000]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span data-i18n="como_llegar">{t('como_llegar')}</span>
                  </button>
                )}
              </div>
              {data.address && <p class="text-center text-xs text-text-secondary mt-sm">{data.address}</p>}
            </div>
          )}
          {tab === 1 && (
            <div class="p-lg">
              <p class="text-base font-semibold text-text-primary mb-md" data-i18n={data.offersIntroLabelKey || 'encuentra_aqui'}>{t(data.offersIntroLabelKey || 'encuentra_aqui')}</p>
              {data.offers.map((offer: string, i: number) => (
                <div key={i} class="flex items-center gap-md bg-green rounded-sm px-md py-sm mb-sm">
                  <div class="w-2 h-2 rounded-full bg-cta-orange flex-shrink-0" />
                  <span class="text-sm text-text-primary">{offer}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div class="p-md pt-sm flex-shrink-0">
          <button onClick={close} class="w-full py-md text-text-primary font-semibold text-base bg-transparent border border-divider rounded-md cursor-pointer hover:bg-divider/20 transition-colors" data-i18n="cerrar">{t('cerrar')}</button>
        </div>
      </div>
    </div>
  );
}
