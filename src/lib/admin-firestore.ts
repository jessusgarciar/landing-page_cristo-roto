import { useEffect, useState, useRef } from 'preact/hooks';

function fb() {
  return (window as any).__fb;
}

export function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts.seconds != null) return ts.seconds * 1000 + (ts.nanoseconds || 0) / 1000000;
  return 0;
}

export function sortByCreatedAt<T extends { createdAt?: any }>(items: T[]): T[] {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export interface CollectionState<T> {
  items: T[];
  loading: boolean;
  error: string;
}

export function useCollection<T>(collectionName: string): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({ items: [], loading: true, error: '' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let unsub: any;
    try {
      const f = fb();
      const colRef = f.collection(f.db, collectionName);
      unsub = f.onSnapshot(colRef,
        (snap: any) => {
          if (!mounted.current) return;
          const items: T[] = [];
          snap.forEach((d: any) => { items.push({ id: d.id, ...d.data() } as T); });
          setState({ items, loading: false, error: '' });
        },
        (err: any) => { if (mounted.current) setState((s) => ({ ...s, loading: false, error: err.message })); },
      );
    } catch (e: any) {
      if (mounted.current) setState((s) => ({ ...s, loading: false, error: e.message }));
    }
    return () => { mounted.current = false; if (unsub) unsub(); };
  }, [collectionName]);

  return state;
}

export async function addDocument<T extends Record<string, any>>(cn: string, data: T): Promise<string> {
  const f = fb();
  const docRef = await f.addDoc(f.collection(f.db, cn), data);
  return docRef.id;
}

export async function updateDocument<T extends Record<string, any>>(cn: string, id: string, data: Partial<T>): Promise<void> {
  const f = fb();
  await f.setDoc(f.doc(f.db, cn, id), data, { merge: true });
}

export async function deleteDocument(cn: string, id: string): Promise<void> {
  const f = fb();
  await f.deleteDoc(f.doc(f.db, cn, id));
}

export async function batchUpdate(cn: string, updates: { docId: string; data: Record<string, any> }[]): Promise<void> {
  const f = fb();
  const batch = f.writeBatch(f.db);
  for (const { docId, data } of updates) batch.set(f.doc(f.db, cn, docId), data, { merge: true });
  await batch.commit();
}
