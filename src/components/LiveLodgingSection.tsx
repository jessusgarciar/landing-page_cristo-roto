import { useEffect, useState } from 'preact/hooks';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, type Lodging } from '../lib/firebase';
import PlaceCard from './PlaceCard';

interface Props {
  lodgings: Lodging[];
}

export default function LiveLodgingSection({ lodgings: initial }: Props) {
  const [lodgings, setLodgings] = useState(initial);

  useEffect(() => {
    let unsub: Unsubscribe;
    try {
      const db = getFirestoreDb();
      unsub = onSnapshot(collection(db, 'hospedajes'), (snap) => {
        const list: Lodging[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Lodging));
        setLodgings(list.length > 0 ? list : initial);
      });
    } catch {}
    return () => { if (unsub) unsub(); };
  }, [initial]);

  return (
    <section id="hospedajes" class="bg-[#F4EFE8] border-t border-[#E8DED2] px-md py-lg md:py-xl">
      <div class="flex items-center gap-sm mb-md">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5E3C" stroke-width="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10M9 20v-6h6v6" />
        </svg>
        <h2 class="text-[22px] font-bold text-text-primary" data-i18n="hospedajes">Hospedajes</h2>
      </div>
      <div class="flex flex-col gap-md">
        {lodgings.map((lodging) => (
          <PlaceCard key={lodging.id} place={lodging} kind="lodging" />
        ))}
      </div>
      <div class="mt-md w-full rounded-md p-md text-center bg-[#8B5E3C]/10">
        <p class="text-sm font-medium m-0 text-[#8B5E3C]" data-i18n="tienes_hospedaje">
          Tienes un hospedaje? Contactanos para promocionarlo aqui.
        </p>
      </div>
    </section>
  );
}
