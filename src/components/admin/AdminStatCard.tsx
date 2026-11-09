interface Props {
  icon: string;
  label: string;
  value: number;
  subtitle?: string;
}

const ICONS: Record<string, string> = {
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  restaurant: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  store: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  lodging: 'M3 11.5 12 4l9 7.5M5 10v10h14V10M9 20v-6h6v6',
  question: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  camera: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  service: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
};

export default function AdminStatCard({ icon, label, value, subtitle }: Props) {
  const path = ICONS[icon] || ICONS.image;

  return (
    <div style={{
      background: '#1e293b', borderRadius: '10px', padding: '18px',
      border: '1px solid #334155', display: 'flex', alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '10px',
        background: 'rgba(59,125,216,.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B7DD8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d={path} />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
        {subtitle && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
