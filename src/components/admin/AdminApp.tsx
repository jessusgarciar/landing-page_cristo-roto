import { useEffect, useState } from 'preact/hooks';
import { onAuthChange, logout, type AdminUser } from '../../lib/admin-auth';
import AdminLogin from './AdminLogin';
import AdminShell from './AdminShell';

export type AdminTab =
  | 'dashboard'
  | 'carousel'
  | 'restaurants'
  | 'shops'
  | 'lodgings'
  | 'services'
  | 'feedback'
  | 'questions'
  | 'photos';

export default function AdminApp() {
  const [authUser, setAuthUser] = useState<AdminUser | null | undefined>(undefined);
  const [tab, setTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    const unsub = onAuthChange((user) => setAuthUser(user));
    return () => { unsub(); };
  }, []);

  if (authUser === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div class="spinner" />
      </div>
    );
  }

  if (!authUser) {
    return <AdminLogin />;
  }

  return (
    <AdminShell
      currentTab={tab}
      onTabChange={setTab}
      user={authUser}
      onLogout={() => {
        logout();
        setAuthUser(null);
        setTab('dashboard');
      }}
    />
  );
}
