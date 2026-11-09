import { useState } from 'preact/hooks';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../lib/admin-firestore';
import type { Lodging } from '../../lib/firebase';
import { mockLodgings } from '../../data/mockLodgings';
import AdminDataTable from './AdminDataTable';
import AdminFormDialog, { AdminTextField } from './AdminFormDialog';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminImageUpload from './AdminImageUpload';

export default function AdminLodgings() {
  const { items, loading, error } = useCollection<Lodging>('hospedajes');
  const displayItems = items.length > 0 ? items : mockLodgings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [logoPath, setLogoPath] = useState('');
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
    setName(''); setDescription(''); setImagePath(''); setLogoPath('');
    setSchedule(''); setPhone(''); setAddress('');
    setLatitude(''); setLongitude(''); setOffers([]);
  }

  function openAdd() {
    setEditingId(null); setSaveError(''); reset(); setDialogOpen(true);
  }

  function openEdit(lodging: Lodging) {
    setEditingId(lodging.id); setSaveError('');
    setName(lodging.name || ''); setDescription(lodging.description || '');
    setImagePath(lodging.imagePath || ''); setLogoPath(lodging.logoPath || '');
    setSchedule(lodging.schedule || ''); setPhone(lodging.phone || '');
    setAddress(lodging.address || '');
    setLatitude(lodging.latitude != null ? String(lodging.latitude) : '');
    setLongitude(lodging.longitude != null ? String(lodging.longitude) : '');
    setOffers(lodging.offers || []);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true); setSaveError('');
    try {
      const data: any = {
        name: name.trim(), description: description.trim(),
        schedule: schedule.trim(), phone: phone.trim(),
        offers: offers.filter((offer) => offer.trim()),
      };
      if (imagePath) data.imagePath = imagePath;
      if (logoPath) data.logoPath = logoPath;
      if (address.trim()) data.address = address.trim();
      if (latitude.trim()) data.latitude = Number(latitude);
      if (longitude.trim()) data.longitude = Number(longitude);

      if (editingId) {
        await updateDocument('hospedajes', editingId, data);
      } else {
        await addDocument('hospedajes', data);
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
    try { await deleteDocument('hospedajes', deleteId); }
    finally { setDeleteId(null); }
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{displayItems.length} hospedajes</p>
          {items.length === 0 && (
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px' }}>Mostrando ejemplos para probar edición</p>
          )}
        </div>
        <button onClick={openAdd} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#3B7DD8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + Agregar
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      <AdminDataTable
        columns={['#', 'Logo', 'Nombre', 'Teléfono', 'Horario', 'Amenidades', 'Acciones']}
        emptyMessage="No hay hospedajes registrados"
        rows={displayItems.map((lodging, i) => ({
          key: lodging.id,
          cells: [
            i + 1,
            lodging.logoPath ? <img src={lodging.logoPath} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ color: '#64748b' }}>-</span>,
            <span style={{ fontWeight: 500 }}>{lodging.name}</span>,
            <a href={`tel:${lodging.phone}`} style={{ color: '#3B7DD8', textDecoration: 'none', fontSize: '12px' }}>{lodging.phone || '-'}</a>,
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lodging.schedule || '-'}</span>,
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{lodging.offers?.length || 0}</span>,
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => openEdit(lodging)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#3B7DD8', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => setDeleteId(lodging.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Eliminar</button>
            </div>,
          ],
        }))}
      />

      {dialogOpen && (
        <AdminFormDialog title={editingId ? 'Editar Hospedaje' : 'Agregar Hospedaje'} onSave={handleSave} onCancel={() => setDialogOpen(false)} loading={saving} error={saveError}>
          <AdminImageUpload folder="hospedajes/fondo" currentUrl={imagePath} onUpload={setImagePath} label="Imagen de fondo" />
          <AdminImageUpload folder="hospedajes/logo" currentUrl={logoPath} onUpload={setLogoPath} label="Logo" />
          <AdminTextField label="Nombre" value={name} onChange={setName} placeholder="Nombre del hospedaje" />
          <AdminTextField label="Descripción" value={description} onChange={setDescription} placeholder="Descripción" multiline />
          <AdminTextField label="Horario de atención" value={schedule} onChange={setSchedule} placeholder="Ej. Recepción 24 horas" />
          <AdminTextField label="Teléfono" value={phone} onChange={setPhone} placeholder="Ej. 449-123-4567" />
          <AdminTextField label="Dirección" value={address} onChange={setAddress} placeholder="Dirección (opcional)" />
          <div class="admin-coordinate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AdminTextField label="Latitud" value={latitude} onChange={setLatitude} placeholder="22.145..." />
            <AdminTextField label="Longitud" value={longitude} onChange={setLongitude} placeholder="-102.413..." />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
              Amenidades y servicios
            </label>
            {offers.map((offer, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                <input
                  value={offer}
                  onInput={(e: any) => {
                    const next = [...offers];
                    next[i] = e.target.value;
                    setOffers(next);
                  }}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
                  placeholder="Ej. WiFi, estacionamiento"
                />
                <button onClick={() => setOffers(offers.filter((_, j) => j !== i))} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', padding: '4px 8px', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>
                  x
                </button>
              </div>
            ))}
            <button onClick={() => setOffers([...offers, ''])} style={{ background: 'none', border: '1px dashed #334155', borderRadius: '6px', color: '#94a3b8', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>
              + Agregar amenidad
            </button>
          </div>
        </AdminFormDialog>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar Hospedaje"
          message="¿Estás seguro? El hospedaje será eliminado permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
