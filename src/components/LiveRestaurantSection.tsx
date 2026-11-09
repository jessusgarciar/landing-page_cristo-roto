import { useEffect, useState } from 'preact/hooks';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, type Restaurant } from '../lib/firebase';
import PlaceCard from './PlaceCard';

interface Props {
  restaurants: Restaurant[];
}

export default function LiveRestaurantSection({ restaurants: initial }: Props) {
  const [restaurants, setRestaurants] = useState(initial);

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'restaurantes'), (snap) => {
        const list: Restaurant[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Restaurant));
        setRestaurants(list);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <section id="restaurantes" class="px-md py-lg md:py-xl">
      <div class="flex items-center gap-sm mb-md">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8772E" stroke-width="2">
          <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        <h2 class="text-[22px] font-bold text-text-primary" data-i18n="restaurantes">Restaurantes</h2>
      </div>
      <div class="flex flex-col gap-md">
        {restaurants.map((restaurant) => (
          <PlaceCard key={restaurant.id} place={restaurant} kind="restaurant" />
        ))}
      </div>
      <div class="mt-md w-full bg-header-blue/10 rounded-md p-md text-center">
        <p class="text-sm text-header-blue font-medium m-0" data-i18n="tienes_restaurante">Tienes un restaurante? Contactanos para promocionarte aqui.</p>
      </div>
    </section>
  );
}
