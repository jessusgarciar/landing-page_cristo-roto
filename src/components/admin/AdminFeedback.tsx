import { useState } from 'preact/hooks';
import { useCollection, updateDocument, deleteDocument, batchUpdate, toMillis, sortByCreatedAt } from '../../lib/admin-firestore';
import type { FeedbackEntry } from '../../lib/firebase';
import AdminDataTable from './AdminDataTable';
import AdminConfirmDialog from './AdminConfirmDialog';

function formatDate(ts: any): string {
  const ms = toMillis(ts);
  if (!ms) return '-';
  return new Date(ms).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminFeedback() {
  const { items, loading, error } = useCollection<FeedbackEntry>('feedback');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const sorted = sortByCreatedAt(items);
  const unreadCount = items.filter((f) => !f.isRead).length;

  async function handleMarkRead(docId: string) {
    await updateDocument('feedback', docId, { isRead: true });
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      const unread = items.filter((f) => !f.isRead);
      await batchUpdate('feedback', unread.map((f) => ({ docId: f.id, data: { isRead: true } })));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteDocument('feedback', deleteId);
    setDeleteId(null);
  }

  const detailItem = detailId ? items.find((f) => f.id === detailId) : null;

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
          {unreadCount} sin leer de {items.length} totales
        </p>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
              background: 'transparent', color: '#94a3b8', fontSize: '12px',
              cursor: markingAll ? 'not-allowed' : 'pointer',
            }}
          >
            {markingAll ? 'Marcando...' : 'Marcar todos leídos'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      <AdminDataTable
        columns={['Estado', 'Comentario', 'Fecha', 'Acciones']}
        emptyMessage="No hay comentarios en el buzón"
        rows={sorted.map((f) => ({
          key: f.id,
          cells: [
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
              background: f.isRead ? '#1e293b' : 'rgba(234,179,8,.15)',
              color: f.isRead ? '#64748b' : '#eab308',
              whiteSpace: 'nowrap',
            }}>
              {f.isRead ? 'Leído' : 'Nuevo'}
            </span>,
            <span style={{
              fontWeight: f.isRead ? 400 : 600, color: f.isRead ? '#94a3b8' : '#e2e8f0',
              maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
            }}>
              {f.comment}
            </span>,
            <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
              {formatDate(f.createdAt)}
            </span>,
            <div style={{ display: 'flex', gap: '6px' }}>
              {!f.isRead && (
                <button onClick={() => handleMarkRead(f.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#22c55e', fontSize: '12px', padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Leído
                </button>
              )}
              <button onClick={() => setDetailId(f.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#3B7DD8', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>
                Ver
              </button>
              <button onClick={() => setDeleteId(f.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>,
          ],
        }))}
      />

      {detailItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)' }}
             onClick={(e: any) => { if (e.target === e.currentTarget) setDetailId(null); }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', width: '460px', maxWidth: '90vw', border: '1px solid #334155', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '4px',
                background: detailItem.isRead ? '#1e293b' : 'rgba(234,179,8,.15)',
                color: detailItem.isRead ? '#64748b' : '#eab308',
              }}>
                {detailItem.isRead ? 'Leído' : 'Nuevo'}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(detailItem.createdAt)}</span>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {detailItem.comment}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailId(null)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar comentario"
          message="¿Estás seguro? El comentario será eliminado permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
