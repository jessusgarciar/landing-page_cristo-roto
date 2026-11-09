import { useState } from 'preact/hooks';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../lib/admin-firestore';
import type { CarouselItem } from '../../lib/firebase';
import AdminDataTable from './AdminDataTable';
import AdminFormDialog, { AdminTextField } from './AdminFormDialog';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminImageUpload from './AdminImageUpload';

export default function AdminCarousel() {
  const { items, loading, error } = useCollection<CarouselItem>('carousel');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setImagePath('');
    setTitle('');
    setSubtitle('');
    setSaveError('');
    setDialogOpen(true);
  }

  function openEdit(item: CarouselItem) {
    setEditingId(item.id);
    setImagePath(item.imagePath || '');
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = { imagePath, title: title.trim(), subtitle: subtitle.trim() };
      if (editingId) {
        await updateDocument('carousel', editingId, data);
      } else {
        await addDocument('carousel', data);
      }
      setDialogOpen(false);
    } catch (e: any) {
      setSaveError(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteDocument('carousel', deleteId);
    } finally {
      setDeleting(null);
      setDeleteId(null);
    }
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{items.length} elementos</p>
        <button
          onClick={openAdd}
          style={{
            padding: '9px 18px', borderRadius: '8px', border: 'none',
            background: '#3B7DD8', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Agregar
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      <AdminDataTable
        columns={['#', 'Preview', 'Título', 'Subtítulo', 'Acciones']}
        emptyMessage="No hay imágenes en el carrusel"
        rows={items.map((item, i) => ({
          key: item.id,
          cells: [
            i + 1,
            <img src={item.imagePath} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />,
            <span style={{ fontWeight: 500 }}>{item.title}</span>,
            <span style={{ color: '#94a3b8' }}>{item.subtitle || '-'}</span>,
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => openEdit(item)}
                style={{
                  background: 'none', border: '1px solid #334155', borderRadius: '6px',
                  color: '#3B7DD8', fontSize: '12px', padding: '4px 10px', cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                style={{
                  background: 'none', border: '1px solid #334155', borderRadius: '6px',
                  color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer',
                }}
              >
                Eliminar
              </button>
            </div>,
          ],
        }))}
      />

      {dialogOpen && (
        <AdminFormDialog title={editingId ? 'Editar Carrusel' : 'Agregar Carrusel'} onSave={handleSave} onCancel={() => setDialogOpen(false)} loading={saving} error={saveError}>
          <AdminImageUpload folder="carousel" currentUrl={imagePath} onUpload={setImagePath} />
          <AdminTextField label="Título" value={title} onChange={setTitle} placeholder="Ej. Cristo Roto" />
          <AdminTextField label="Subtítulo" value={subtitle} onChange={setSubtitle} placeholder="Ej. San José de Gracia" />
        </AdminFormDialog>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar elemento"
          message="¿Estás seguro? La imagen del carrusel será eliminada permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting === deleteId}
        />
      )}
    </div>
  );
}
