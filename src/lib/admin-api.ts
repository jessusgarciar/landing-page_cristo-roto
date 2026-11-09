import { firebaseConfig, firebaseDatabaseId } from './firebase-config';

const PROJECT_ID = firebaseConfig.projectId;
const API_KEY = firebaseConfig.apiKey;
const DB_ID = firebaseDatabaseId;
const BUCKET = firebaseConfig.storageBucket;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
const REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('admin_idtoken');
}

function setTokens(idToken: string, refreshToken: string, expiresIn: number) {
  const expiry = Date.now() + expiresIn * 1000;
  window.localStorage.setItem('admin_idtoken', idToken);
  window.localStorage.setItem('admin_refreshtoken', refreshToken);
  window.localStorage.setItem('admin_expiry', String(expiry));
}

function clearTokens() {
  window.localStorage.removeItem('admin_idtoken');
  window.localStorage.removeItem('admin_refreshtoken');
  window.localStorage.removeItem('admin_expiry');
}

function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '='));
    return JSON.parse(decoded);
  } catch { return null; }
}

function isTokenExpired(token: string): boolean {
  const claims = decodeJWT(token);
  if (!claims?.exp) return true;
  return Date.now() / 1000 >= claims.exp;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message || '';
    const map: Record<string, string> = {
      EMAIL_NOT_FOUND: 'Usuario no encontrado',
      INVALID_PASSWORD: 'Contrase�a incorrecta',
      USER_DISABLED: 'Usuario deshabilitado',
      INVALID_LOGIN_CREDENTIALS: 'Credenciales inv�lidas',
      TOO_MANY_ATTEMPTS_TRY_LATER: 'Demasiados intentos',
    };
    throw new Error(map[code] || code.replace(/_/g, ' ').toLowerCase());
  }
  const claims = decodeJWT(data.idToken);
  if (!claims?.admin) throw new Error('No tienes permisos de administrador');
  setTokens(data.idToken, data.refreshToken, parseInt(data.expiresIn, 10) || 3600);
  return { uid: claims.user_id || '', email: claims.email || '', isAdmin: true };
}

export async function refreshToken(): Promise<boolean> {
  const rt = window.localStorage.getItem('admin_refreshtoken');
  if (!rt) return false;
  try {
    const res = await fetch(REFRESH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(rt)}`,
    });
    if (!res.ok) { clearTokens(); return false; }
    const data = await res.json();
    setTokens(data.id_token, data.refresh_token || rt, parseInt(data.expires_in, 10) || 3600);
    return true;
  } catch { clearTokens(); return false; }
}

export function logout() { clearTokens(); }

export async function initAuth(): Promise<AdminUser | null> {
  let token = getToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    const ok = await refreshToken();
    if (!ok) return null;
    token = getToken();
    if (!token) return null;
  }
  const claims = decodeJWT(token);
  if (!claims?.admin) return null;
  return { uid: claims.user_id || '', email: claims.email || '', isAdmin: true };
}

function extractValue(val: any): any {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.timestampValue !== undefined) return new Date(val.timestampValue).getTime();
  if (val.arrayValue?.values) return val.arrayValue.values.map(extractValue);
  if (val.mapValue?.fields) {
    const obj: any = {};
    for (const [k, v] of Object.entries(val.mapValue.fields)) obj[k] = extractValue(v);
    return obj;
  }
  if (val.nullValue !== undefined) return null;
  return val;
}

function toFirestoreField(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreField) } };
  if (typeof val === 'object') {
    const fields: any = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === 'id') continue;
      fields[k] = toFirestoreField(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  let token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });
  if ((res.status === 401 || res.status === 403) && token) {
    const ok = await refreshToken();
    if (ok) {
      token = getToken();
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(url, { ...options, headers });
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg = `Error ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j.error?.message) msg = JSON.stringify(j.error.message);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchCollection(name: string): Promise<any[]> {
  const data = await apiFetch(`${BASE_URL}/${name}?key=${API_KEY}`);
  if (!data.documents) return [];
  return data.documents.map((doc: any) => {
    const fields: any = {};
    if (doc.fields) for (const [k, v] of Object.entries(doc.fields)) fields[k] = extractValue(v);
    return { id: doc.name.split('/').pop(), ...fields };
  });
}

export async function addDocument(name: string, data: Record<string, any>): Promise<string> {
  const fields: any = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreField(v);
  const body = { fields };
  const result = await apiFetch(`${BASE_URL}/${name}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return result.name.split('/').pop();
}

export async function updateDocument(name: string, docId: string, data: Record<string, any>): Promise<void> {
  const fields: any = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreField(v);
  const masks = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const body = { fields };
  await apiFetch(`${BASE_URL}/${name}/${docId}?key=${API_KEY}&${masks}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-HTTP-Method-Override': 'PATCH',
    },
    body: JSON.stringify(body),
  });
}

export async function deleteDocument(name: string, docId: string): Promise<void> {
  await apiFetch(`${BASE_URL}/${name}/${docId}?key=${API_KEY}`, { method: 'DELETE' });
}

export async function batchUpdate(name: string, updates: { docId: string; data: Record<string, any> }[]): Promise<void> {
  for (const { docId, data } of updates) await updateDocument(name, docId, data);
}

export async function uploadImage(folder: string, blob: Blob): Promise<string> {
  const token = getToken();
  const filePath = `landing/${folder}/${Date.now()}.webp`;
  const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodeURIComponent(filePath)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'image/webp' },
    body: blob,
  });
  if (!res.ok) throw new Error(`Upload error ${res.status}`);
  const data = await res.json();
  const dt = data.downloadTokens || '';
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(filePath)}?alt=media&token=${dt}`;
}
