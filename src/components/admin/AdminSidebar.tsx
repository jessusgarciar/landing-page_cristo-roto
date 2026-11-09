import type { AdminTab } from './AdminApp';

interface Props {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'carousel', label: 'Carrusel', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'restaurants', label: 'Restaurantes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'shops', label: 'Comercios', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'lodgings', label: 'Hospedajes', icon: 'M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6' },
  { id: 'services', label: 'Servicios', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'feedback', label: 'Buzón', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'questions', label: 'Preguntas', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'photos', label: 'Fotos Turistas', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
];

export default function AdminSidebar({ currentTab, onTabChange }: Props) {
  return (
    <div class="admin-sidebar" style={{
      width: '240px', minWidth: '240px', height: '100%',
      background: '#0f172a', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #1e293b',
    }}>
      <div class="admin-sidebar-brand" style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#3B7DD8', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>Admin Panel</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Cristo Roto</div>
          </div>
        </div>
      </div>

      <div class="admin-sidebar-divider" style={{ height: '1px', background: '#1e293b', margin: '0 16px' }} />

      <nav class="admin-nav" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {TABS.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              class={`admin-nav-item ${active ? 'admin-nav-item-active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: 'none', background: active ? 'rgba(59,125,216,.12)' : 'transparent',
                color: active ? '#3B7DD8' : '#94a3b8',
                fontSize: '13px', fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                borderLeft: active ? '3px solid #3B7DD8' : '3px solid transparent',
                transition: 'all .15s',
                marginBottom: '2px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke={active ? '#3B7DD8' : '#64748b'} stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round"
                   style={{ flexShrink: 0 }}>
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div class="admin-sidebar-footer" style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#64748b', fontSize: '12px', textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Volver a Landing
        </a>
      </div>
    </div>
  );
}
