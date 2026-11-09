import type { ComponentChildren } from 'preact';

interface Props {
  title: string;
  children: ComponentChildren;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  loading?: boolean;
  error?: string;
}

export default function AdminFormDialog({ title, children, onSave, onCancel, saveLabel, loading, error }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.6)',
    }} onClick={(e: any) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div class="admin-form-dialog" style={{
        background: '#1e293b', borderRadius: '12px', width: '520px',
        maxWidth: '92vw', maxHeight: '85vh', display: 'flex',
        flexDirection: 'column', border: '1px solid #334155',
        boxShadow: '0 20px 60px rgba(0,0,0,.5)',
      }}>
        <div class="admin-form-dialog-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #334155',
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>{title}</h3>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
              padding: '4px', display: 'flex',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="admin-form-dialog-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {children}
          {error && (
            <p style={{ margin: '12px 0 0', padding: '10px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '12px' }}>{error}</p>
          )}
        </div>

        <div class="admin-form-dialog-footer" style={{
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          padding: '16px 20px', borderTop: '1px solid #334155',
        }}>
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
            onClick={onSave}
            disabled={loading}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none',
              background: loading ? '#2563eb80' : '#3B7DD8', color: '#fff',
              fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Guardando...' : saveLabel || 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}

export function AdminTextField({ label, value, onChange, placeholder, type, multiline }: FieldProps) {
  const style: any = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #334155', background: '#0f172a',
    color: '#f1f5f9', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          onInput={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...style, resize: 'vertical' }}
        />
      ) : (
        <input
          type={type || 'text'}
          value={value}
          onInput={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          style={style}
        />
      )}
    </div>
  );
}
