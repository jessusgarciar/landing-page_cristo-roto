import type { AdminUser } from '../../lib/admin-auth';
import type { AdminTab } from './AdminApp';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminCarousel from './AdminCarousel';
import AdminRestaurants from './AdminRestaurants';
import AdminShops from './AdminShops';
import AdminLodgings from './AdminLodgings';
import AdminServices from './AdminServices';
import AdminFeedback from './AdminFeedback';
import AdminQuestions from './AdminQuestions';
import AdminTuristaFotos from './AdminTuristaFotos';

interface Props {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  user: AdminUser;
  onLogout: () => void;
}

const TAB_TITLES: Record<AdminTab, string> = {
  dashboard: 'Dashboard',
  carousel: 'Carrusel',
  restaurants: 'Restaurantes',
  shops: 'Comercios',
  lodgings: 'Hospedajes',
  services: 'Servicios',
  feedback: 'Buzón',
  questions: 'Preguntas Rápidas',
  photos: 'Fotos Turistas',
};

function renderContent(tab: AdminTab) {
  switch (tab) {
    case 'dashboard': return <AdminDashboard />;
    case 'carousel': return <AdminCarousel />;
    case 'restaurants': return <AdminRestaurants />;
    case 'shops': return <AdminShops />;
    case 'lodgings': return <AdminLodgings />;
    case 'services': return <AdminServices />;
    case 'feedback': return <AdminFeedback />;
    case 'questions': return <AdminQuestions />;
    case 'photos': return <AdminTuristaFotos />;
  }
}

export default function AdminShell({ currentTab, onTabChange, user, onLogout }: Props) {
  return (
    <div class="admin-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminSidebar currentTab={currentTab} onTabChange={onTabChange} />

      <div class="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header class="admin-header" style={{
          height: '56px', minHeight: '56px', background: '#1e293b',
          borderBottom: '1px solid #334155', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          <h1 class="admin-title" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>
            {TAB_TITLES[currentTab]}
          </h1>
          <div class="admin-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span class="admin-email" style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</span>
            <button
              onClick={onLogout}
              class="admin-logout"
              style={{
                padding: '6px 14px', borderRadius: '6px', border: '1px solid #334155',
                background: 'transparent', color: '#94a3b8', fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Salir
            </button>
          </div>
        </header>

        <main class="admin-content" style={{
          flex: 1, overflowY: 'auto', background: '#0f172a',
          padding: '24px',
        }}>
          {renderContent(currentTab)}
        </main>
      </div>
    </div>
  );
}
