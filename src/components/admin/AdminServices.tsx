import { useState } from 'preact/hooks';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../lib/admin-firestore';
import type { Service } from '../../lib/firebase';
import AdminDataTable from './AdminDataTable';
import AdminFormDialog, { AdminTextField } from './AdminFormDialog';
import AdminConfirmDialog from './AdminConfirmDialog';

const ICON_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'anchor', label: 'Embarcadero', emoji: '⚓' },
  { value: 'parking', label: 'Estacionamiento', emoji: '🅿️' },
  { value: 'emergency', label: 'Emergencias', emoji: '🏥' },
  { value: 'restroom', label: 'Sanitarios', emoji: '🚻' },
  { value: 'info', label: 'Información', emoji: 'ℹ️' },
];

function getIconEmoji(icon: string): string {
  return ICON_OPTIONS.find((o) => o.value === icon)?.emoji || icon;
}

export default function AdminServices() {
  const { items, loading, error } = useCollection<Service>('servicios');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [icon, setIcon] = useState('info');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [offers, setOffers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function reset() {
    setIcon('info'); setName(''); setDescription('');
    setSchedule(''); setPhone(''); setAddress('');
    setLatitude(''); setLongitude(''); setOffers([]);
  }

  function openAdd() { setEditingId(null); setSaveError(''); reset(); setDialogOpen(true); }
  function openEdit(s: Service) {
    setEditingId(s.id); setSaveError('');
    setIcon(s.icon || 'info');
    setName(s.name || ''); setDescription(s.description || '');
    setSchedule(s.schedule || ''); setPhone(s.phone || '');
    setAddress(s.address || '');
    setLatitude(s.latitude != null ? String(s.latitude) : '');
    setLongitude(s.longitude != null ? String(s.longitude) : '');
    setOffers(s.offers || []);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data: any = {
        icon, name: name.trim(), description: description.trim(),
        schedule: schedule.trim(), phone: phone.trim(),
        offers: offers.filter((o) => o.trim()),
      };
      if (address.trim()) data.address = address.trim();
      if (latitude.trim()) data.latitude = Number(latitude);
      if (longitude.trim()) data.longitude = Number(longitude);

      if (editingId) {
        await updateDocument('servicios', editingId, data);
      } else {
        await addDocument('servicios', data);
      }
      setDialogOpen(false);
    } catch (e: any) { setSaveError(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument('servicios', deleteId); }
    finally { setDeleteId(null); }
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{items.length} servicios</p>
        <button onClick={openAdd} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#3B7DD8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + Agregar
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      <AdminDataTable
        columns={['#', 'Ícono', 'Nombre', 'Teléfono', 'Horario', 'Acciones']}
        emptyMessage="No hay servicios registrados"
        rows={items.map((s, i) => ({
          key: s.id,
          cells: [
            i + 1,
            <span style={{ fontSize: '22px' }}>{getIconEmoji(s.icon)}</span>,
            <span style={{ fontWeight: 500 }}>{s.name}</span>,
            <a href={`tel:${s.phone}`} style={{ color: '#3B7DD8', textDecoration: 'none', fontSize: '12px' }}>{s.phone || '-'}</a>,
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{(s.schedule || '').split('\n')[0] || '-'}</span>,
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => openEdit(s)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#3B7DD8', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => setDeleteId(s.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Eliminar</button>
            </div>,
          ],
        }))}
      />

      {dialogOpen && (
        <AdminFormDialog title={editingId ? 'Editar Servicio' : 'Agregar Servicio'} onSave={handleSave} onCancel={() => setDialogOpen(false)} loading={saving} error={saveError}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Ícono
            </label>
            <select
              value={icon}
              onChange={(e: any) => setIcon(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #334155', background: '#0f172a',
                color: '#f1f5f9', fontSize: '13px', outline: 'none',
              }}
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
              ))}
            </select>
          </div>
          <AdminTextField label="Nombre" value={name} onChange={setName} placeholder="Nombre del servicio" />
          <AdminTextField label="Descripción" value={description} onChange={setDescription} placeholder="Descripción" multiline />
          <AdminTextField label="Horario" value={schedule} onChange={setSchedule} placeholder="Ej. 8:00 AM - 6:00 PM" />
          <AdminTextField label="Teléfono" value={phone} onChange={setPhone} placeholder="Ej. 449-123-4567" />
          <AdminTextField label="Dirección" value={address} onChange={setAddress} placeholder="Dirección (opcional)" />
          <div class="admin-coordinate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AdminTextField label="Latitud" value={latitude} onChange={setLatitude} placeholder="22.145..." />
            <AdminTextField label="Longitud" value={longitude} onChange={setLongitude} placeholder="-102.413..." />
          </div>
        </AdminFormDialog>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar Servicio"
          message="¿Estás seguro? El servicio será eliminado permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
