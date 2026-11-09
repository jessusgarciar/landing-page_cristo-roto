interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export default function AdminConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel, loading }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.6)',
    }} onClick={(e: any) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div class="admin-confirm-dialog" style={{
        background: '#1e293b', borderRadius: '12px', padding: '24px',
        width: '400px', maxWidth: '90vw', border: '1px solid #334155',
        boxShadow: '0 20px 60px rgba(0,0,0,.5)',
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{message}</p>
        <div class="admin-confirm-dialog-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid #334155',
              background: 'transparent', color: '#94a3b8', fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none',
              background: loading ? '#dc262680' : '#ef4444', color: '#fff',
              fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Eliminando...' : confirmLabel || 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
