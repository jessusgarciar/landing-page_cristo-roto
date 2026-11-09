import { useEffect, useState } from 'preact/hooks';
import { getLocale, t } from '../lib/i18n';

export type PlaceKind = 'restaurant' | 'shop' | 'lodging' | 'service';

export interface PlaceCardData {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  schedule: string;
  phone: string;
  logoPath?: string;
  address?: string;
  offers: string[];
  latitude?: number;
  longitude?: number;
}

export function dispatchPlacePopup(place: PlaceCardData, kind: PlaceKind): void {
  const isLodging = kind === 'lodging';
  window.dispatchEvent(new CustomEvent('open-place-popup', {
    detail: {
      name: place.name,
      description: place.description,
      schedule: place.schedule,
      phone: place.phone,
      imagePath: place.imagePath || '',
      logoPath: place.logoPath || '',
      address: place.address || '',
      offers: place.offers || [],
      coordinates: place.latitude != null && place.longitude != null
        ? { lat: place.latitude, lng: place.longitude } : null,
      showOffersTab: kind !== 'service',
      placeType: kind,
      offersLabelKey: isLodging ? 'amenidades' : undefined,
      offersIntroLabelKey: isLodging ? 'amenidades_intro' : undefined,
    },
  }));
}

interface Props {
  place: PlaceCardData;
  kind: PlaceKind;
}

export default function PlaceCard({ place, kind }: Props) {
  const dialPhone = place.phone?.replace(/[^+\d]/g, '') || '';
  const [, setLocale] = useState(getLocale());
  useEffect(() => {
    const onLanguage = () => setLocale(getLocale());
    window.addEventListener('langchange', onLanguage);
    return () => window.removeEventListener('langchange', onLanguage);
  }, []);

  return (
    <article class="place-card">
      <button class="place-card-details" onClick={() => dispatchPlacePopup(place, kind)} aria-label={`${t('ver_detalles')}: ${place.name}`}>
        {place.imagePath && (
          <div class="place-card-image">
            <img src={place.imagePath} alt="" width="320" height="320" loading="lazy"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
          </div>
        )}
        <div class="place-card-copy">
          <h3>{place.name}</h3>
          <p>{place.description}</p>
          {place.schedule && <span class="place-card-schedule"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{place.schedule}</span>}
          <span class="place-card-more">{t('ver_detalles')} <span aria-hidden="true">→</span></span>
        </div>
      </button>
      {/\d/.test(dialPhone) && <a class="place-card-call" href={`tel:${dialPhone}`}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 17v3a2 2 0 0 1-2 2C10 21 3 14 2 4a2 2 0 0 1 2-2h3l2 6-2 2a16 16 0 0 0 7 7l2-2 6 2Z"/></svg>
        <span>{t('llamar')} {place.phone}</span>
      </a>}
    </article>
  );
}
