import { useState } from 'preact/hooks';
import { useCollection, updateDocument, deleteDocument, toMillis, sortByCreatedAt } from '../../lib/admin-firestore';
import type { TuristaFoto } from '../../lib/firebase';
import AdminConfirmDialog from './AdminConfirmDialog';

function formatDate(ts: any): string {
  const ms = toMillis(ts);
  if (!ms) return '-';
  return new Date(ms).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdminTuristaFotos() {
  const { items, loading, error } = useCollection<TuristaFoto>('fotos_turistas');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDescId, setEditDescId] = useState<string | null>(null);
  const [editDescValue, setEditDescValue] = useState('');

  const sorted = sortByCreatedAt(items);
  const approved = items.filter((f) => f.approved).length;
  const pending = items.filter((f) => !f.approved).length;

  async function handleApprove(docId: string) {
    await updateDocument('fotos_turistas', docId, { approved: true });
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument('fotos_turistas', deleteId); }
    finally { setDeleteId(null); }
  }

  function openEditDesc(foto: TuristaFoto) {
    setEditDescId(foto.id);
    setEditDescValue(foto.description || '');
  }

  async function handleSaveDesc() {
    if (!editDescId) return;
    await updateDocument('fotos_turistas', editDescId, { description: editDescValue.trim() });
    setEditDescId(null);
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '12px 18px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>{items.length}</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '12px 18px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Aprobadas</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#22c55e' }}>{approved}</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: '8px', border: '1px solid #334155', padding: '12px 18px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Pendientes</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#eab308' }}>{pending}</div>
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      {sorted.length === 0 ? (
        <div style={{ background: '#1e293b', borderRadius: '10px', border: '1px solid #334155', padding: '48px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No hay fotos de turistas</p>
        </div>
      ) : (
        <div class="admin-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {sorted.map((foto) => (
            <div key={foto.id} style={{
              background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'relative', paddingTop: '75%', background: '#0f172a' }}>
                <img
                  src={foto.imagePath}
                  alt={foto.description || ''}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e: any) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                    background: foto.approved ? 'rgba(34,197,94,.12)' : 'rgba(234,179,8,.15)',
                    color: foto.approved ? '#22c55e' : '#eab308',
                  }}>
                    {foto.approved ? 'Aprobada' : 'Pendiente'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{formatDate(foto.createdAt)}</span>
                </div>

                <p style={{
                  margin: '0 0 12px', fontSize: '12px', color: '#94a3b8',
                  fontStyle: foto.description ? 'normal' : 'italic',
                  lineHeight: 1.3,
                }}>
                  {foto.description || 'Sin descripción'}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!foto.approved && (
                    <button
                      onClick={() => handleApprove(foto.id)}
                      style={{
                        padding: '6px 14px', borderRadius: '6px', border: 'none',
                        background: '#22c55e', color: '#fff', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Aprobar
                    </button>
                  )}
                  <button
                    onClick={() => openEditDesc(foto)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid #334155',
                      background: 'transparent', color: '#3B7DD8', fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Editar descripción
                  </button>
                  <button
                    onClick={() => setDeleteId(foto.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid #334155',
                      background: 'transparent', color: '#ef4444', fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editDescId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)' }}
             onClick={(e: any) => { if (e.target === e.currentTarget) setEditDescId(null); }}>
          <div class="admin-photo-edit-dialog" style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '90vw', border: '1px solid #334155', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#f1f5f9' }}>Editar descripción</h3>
            <textarea
              value={editDescValue}
              onInput={(e: any) => setEditDescValue(e.target.value)}
              maxLength={50}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #334155', background: '#0f172a',
                color: '#f1f5f9', fontSize: '13px', outline: 'none',
                resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{editDescValue.length}/50</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditDescId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleSaveDesc} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#3B7DD8', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar foto"
          message="La foto será eliminada permanentemente. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
