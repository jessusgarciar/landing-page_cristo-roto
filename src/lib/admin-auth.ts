export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

function fb() {
  const f = (window as any).__fb;
  console.log('[admin-auth] __fb exists:', !!f, f ? Object.keys(f) : 'undefined');
  if (!f) throw new Error('Firebase no inicializado - intenta recargar la pagina');
  return f;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  console.log('[admin-auth] login called with:', email);
  const f = fb();
  console.log('[admin-auth] signInWithEmailAndPassword exists:', typeof f.signInWithEmailAndPassword);
  const cred = await f.signInWithEmailAndPassword(f.auth, email, password);
  console.log('[admin-auth] signIn ok, checking claims...');
  const result = await cred.user.getIdTokenResult();
  if (!result.claims.admin && !result.claims.superadmin) {
    await f.signOut(f.auth);
    throw new Error('No tienes permisos de administrador');
  }
  console.log('[admin-auth] admin verified');
  return { uid: cred.user.uid, email: cred.user.email || '', isAdmin: true };
}

export async function logout(): Promise<void> {
  const f = fb();
  await f.signOut(f.auth);
}

export function onAuthChange(cb: (user: AdminUser | null) => void): () => void {
  const f = fb();
  console.log('[admin-auth] onAuthChange subscribed');
  return f.onAuthStateChanged(f.auth, async (firebaseUser: any) => {
    console.log('[admin-auth] auth state changed:', !!firebaseUser, firebaseUser?.email);
    if (!firebaseUser) { cb(null); return; }
    try {
      const result = await firebaseUser.getIdTokenResult();
      cb((result.claims.admin || result.claims.superadmin) ? { uid: firebaseUser.uid, email: firebaseUser.email || '', isAdmin: true } : null);
    } catch { cb(null); }
  });
}
