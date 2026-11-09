import { useState } from 'preact/hooks';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../lib/admin-firestore';
import type { Question } from '../../lib/firebase';
import AdminDataTable from './AdminDataTable';
import AdminFormDialog, { AdminTextField } from './AdminFormDialog';
import AdminConfirmDialog from './AdminConfirmDialog';

function avg(stars: number[], total: number): string {
  if (!total || total === 0) return '0.0';
  let sum = 0;
  for (let i = 0; i < 5; i++) {
    sum += (stars[i] || 0) * (i + 1);
  }
  return (sum / total).toFixed(1);
}

export default function AdminQuestions() {
  const { items, loading, error } = useCollection<Question>('preguntas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function openAdd() { setEditingId(null); setText(''); setDialogOpen(true); }
  function openEdit(q: Question) { setEditingId(q.id); setText(q.text || ''); setDialogOpen(true); }

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateDocument('preguntas', editingId, { text: text.trim() });
      } else {
        const id = 'q' + Date.now();
        await addDocument('preguntas', {
          text: text.trim(), isActive: true,
          starDistribution: [0, 0, 0, 0, 0], totalResponses: 0,
        });
      }
      setDialogOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleToggle(q: Question) {
    await updateDocument('preguntas', q.id, { isActive: !q.isActive });
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument('preguntas', deleteId); }
    finally { setDeleteId(null); setSelectedId(null); }
  }

  const selected = selectedId ? items.find((q) => q.id === selectedId) : null;
  const dist = selected?.starDistribution || [0, 0, 0, 0, 0];
  const totalRes = selected?.totalResponses || 0;
  const maxDist = Math.max(...dist, 1);

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{items.length} preguntas</p>
          <button onClick={openAdd} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#3B7DD8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Agregar
          </button>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

        <AdminDataTable
          columns={['#', 'Pregunta', 'Estado', 'Respuestas', 'Promedio', 'Acciones']}
          emptyMessage="No hay preguntas registradas"
          rows={items.map((q, i) => ({
            key: q.id,
            cells: [
              i + 1,
              <span style={{ fontWeight: 500, cursor: 'pointer', color: '#3B7DD8' }} onClick={() => setSelectedId(q.id)}>
                {q.text}
              </span>,
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                background: q.isActive ? 'rgba(34,197,94,.12)' : '#1e293b',
                color: q.isActive ? '#22c55e' : '#64748b',
                whiteSpace: 'nowrap',
              }}>
                {q.isActive ? 'Activa' : 'Inactiva'}
              </span>,
              <span style={{ fontSize: '13px' }}>{q.totalResponses || 0}</span>,
              <span style={{ fontSize: '13px', color: '#eab308' }}>
                ★ {avg(q.starDistribution || [0,0,0,0,0], q.totalResponses || 0)}
              </span>,
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleToggle(q)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: q.isActive ? '#64748b' : '#22c55e', fontSize: '11px', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {q.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => openEdit(q)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#3B7DD8', fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => setDeleteId(q.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}>Eliminar</button>
              </div>,
            ],
          }))}
        />
      </div>

      {selected && (
        <div style={{
          width: '300px', minWidth: '280px', position: 'sticky', top: '24px',
          background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Métricas</h3>
            <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>x</button>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.4 }}>
            {selected.text}
          </p>

          <div class="admin-question-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>{totalRes}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Respuestas</div>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#eab308' }}>{avg(dist, totalRes)}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Promedio ★</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const val = dist[star - 1] || 0;
              const pct = totalRes > 0 ? Math.round((val / totalRes) * 100) : 0;
              const barW = Math.round((val / maxDist) * 100);
              return (
                <div key={star}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{star} ★</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{val} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: '#3B7DD8', borderRadius: '3px', transition: 'width .2s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dialogOpen && (
        <AdminFormDialog title={editingId ? 'Editar Pregunta' : 'Agregar Pregunta'} onSave={handleSave} onCancel={() => setDialogOpen(false)} loading={saving}>
          <AdminTextField label="Texto de la pregunta" value={text} onChange={setText} placeholder="Ej. ¿Cómo calificarías el servicio turístico?" multiline />
        </AdminFormDialog>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar Pregunta"
          message="¿Estás seguro? La pregunta y sus métricas serán eliminadas permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
