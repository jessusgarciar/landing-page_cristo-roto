import { useEffect, useState } from 'preact/hooks';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, type Service } from '../lib/firebase';
import PlaceCard from './PlaceCard';

interface Props {
  services: Service[];
}

export default function LiveServiceSection({ services: initial }: Props) {
  const [services, setServices] = useState(initial);

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'servicios'), (snap) => {
        const list: Service[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Service));
        setServices(list);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <section id="servicios" class="bg-green px-md py-lg md:py-xl">
      <div class="flex items-center gap-sm mb-md">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#36783a" stroke-width="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
        <h2 class="text-[22px] font-bold text-text-primary" data-i18n="servicios_title">Servicios</h2>
      </div>
      <div class="flex flex-col gap-md">
        {services.map((service) => <PlaceCard key={service.id} place={service} kind="service" />)}
      </div>
    </section>
  );
}
