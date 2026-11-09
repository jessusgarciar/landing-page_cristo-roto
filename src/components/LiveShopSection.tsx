import { useEffect, useState } from 'preact/hooks';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, type Shop } from '../lib/firebase';
import PlaceCard from './PlaceCard';

interface Props {
  shops: Shop[];
}

export default function LiveShopSection({ shops: initial }: Props) {
  const [shops, setShops] = useState(initial);

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'puestos'), (snap) => {
        const list: Shop[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Shop));
        setShops(list);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <section id="comercios" class="bg-bg-cream px-md py-lg md:py-xl">
      <div class="flex items-center gap-sm mb-md">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h2 class="text-[22px] font-bold text-text-primary" data-i18n="puestos_comercios">Puestos y Comercios</h2>
      </div>
      <div class="flex flex-col gap-md">
        {shops.map((shop) => (
          <PlaceCard key={shop.id} place={shop} kind="shop" />
        ))}
      </div>
      <div class="mt-md w-full bg-green-dark/10 rounded-md p-md text-center">
        <p class="text-sm text-green-dark font-medium m-0" data-i18n="tienes_puesto">Tienes un puesto? Contactanos para promocionarte aqui.</p>
      </div>
    </section>
  );
}
