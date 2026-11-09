import { firebaseConfig, firebaseDatabaseId } from './firebase-config';

const PROJECT_ID = firebaseConfig.projectId;
const API_KEY = firebaseConfig.apiKey;
const DB_ID = firebaseDatabaseId;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;

import type {
  CarouselItem,
  FeaturedItem,
  Restaurant,
  Shop,
  Lodging,
  Service,
  Question,
} from './firebase';

async function fetchCollection(collection: string): Promise<any[]> {
  const url = `${BASE_URL}/${collection}?key=${API_KEY}`;
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let retryable = true;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) {
        retryable = res.status === 429 || res.status >= 500;
        throw new Error(`Firestore HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.documents) return [];

      return data.documents.map((doc: any) => {
        const fields: Record<string, any> = {};
        for (const [key, value] of Object.entries(doc.fields || {})) {
          fields[key] = extractValue(value as any);
        }
        const id = doc.name.split('/').pop();
        return { id, ...fields };
      });
    } catch (error) {
      if (!retryable || attempt === attempts) {
        throw new Error(`No se pudo cargar landing-db/${collection}. Revisa la conexión a Firestore y vuelve a compilar.`, { cause: error });
      }
      console.warn(`Firestore: reintentando ${collection} (${attempt}/${attempts - 1}) por un fallo temporal.`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  return [];
}

function extractValue(field: any): any {
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
  if (field.doubleValue !== undefined) return field.doubleValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.timestampValue !== undefined) return new Date(field.timestampValue).getTime();
  if (field.mapValue?.fields) {
    const map: Record<string, any> = {};
    for (const [k, v] of Object.entries(field.mapValue.fields)) {
      map[k] = extractValue(v as any);
    }
    return map;
  }
  if (field.arrayValue?.values) {
    return field.arrayValue.values.map((v: any) => extractValue(v));
  }
  if (field.nullValue !== undefined) return null;
  if (field.referenceValue !== undefined) return field.referenceValue;
  if (field.geoPointValue) {
    return {
      latitude: field.geoPointValue.latitude,
      longitude: field.geoPointValue.longitude,
    };
  }
  return null;
}

function fixLocalPath(path: string): string {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  return path.replace(/\.(png|jpe?g)$/i, '.webp');
}

export async function getCarouselItems(): Promise<CarouselItem[]> {
  const items = await fetchCollection('carousel');
  return items.map((item: any) => ({
    ...item,
    imagePath: fixLocalPath(item.imagePath || ''),
  }));
}

export async function getFeaturedItems(): Promise<FeaturedItem[]> {
  return fetchCollection('destacados');
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const items = await fetchCollection('restaurantes');
  return items.map((item: any) => ({
    ...item,
    imagePath: fixLocalPath(item.imagePath || ''),
    logoPath: fixLocalPath(item.logoPath || ''),
    offers: item.offers || [],
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
  }));
}

export async function getShops(): Promise<Shop[]> {
  const items = await fetchCollection('puestos');
  return items.map((item: any) => ({
    ...item,
    imagePath: fixLocalPath(item.imagePath || ''),
    logoPath: fixLocalPath(item.logoPath || ''),
    offers: item.offers || [],
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
  }));
}

export async function getLodgings(): Promise<Lodging[]> {
  const items = await fetchCollection('hospedajes');
  return items.map((item: any) => ({
    ...item,
    imagePath: fixLocalPath(item.imagePath || ''),
    logoPath: fixLocalPath(item.logoPath || ''),
    offers: item.offers || [],
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
  }));
}

export async function getServices(): Promise<Service[]> {
  const items = await fetchCollection('servicios');
  return items.map((item: any) => ({
    ...item,
    offers: item.offers || [],
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
  }));
}

export async function getQuestions(): Promise<Question[]> {
  return fetchCollection('preguntas');
}
