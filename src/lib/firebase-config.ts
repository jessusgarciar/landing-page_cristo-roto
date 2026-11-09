// Solo configuración web pública. Las credenciales privadas nunca van aquí.
export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

for (const [field, value] of Object.entries(firebaseConfig)) {
  if (!value?.trim()) {
    throw new Error(`Falta configurar Firebase (${field}). Completa .env según .env.example.`);
  }
}

export const firebaseDatabaseId = import.meta.env.PUBLIC_FIREBASE_DATABASE_ID || 'landing-db';
