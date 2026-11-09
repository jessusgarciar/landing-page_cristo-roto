import { useState } from 'preact/hooks';
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../lib/admin-firestore';
import type { Shop } from '../../lib/firebase';
import AdminDataTable from './AdminDataTable';
import AdminFormDialog, { AdminTextField } from './AdminFormDialog';
import AdminConfirmDialog from './AdminConfirmDialog';
import AdminImageUpload from './AdminImageUpload';

export default function AdminShops() {
  const { items, loading, error } = useCollection<Shop>('puestos');
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

  function openAdd() { setEditingId(null); setSaveError(''); reset(); setDialogOpen(true); }
  function openEdit(r: Shop) {
    setEditingId(r.id); setSaveError('');
    setName(r.name || ''); setDescription(r.description || '');
    setImagePath(r.imagePath || ''); setLogoPath(r.logoPath || '');
    setSchedule(r.schedule || ''); setPhone(r.phone || '');
    setAddress(r.address || '');
    setLatitude(r.latitude != null ? String(r.latitude) : '');
    setLongitude(r.longitude != null ? String(r.longitude) : '');
    setOffers(r.offers || []);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data: any = {
        name: name.trim(), description: description.trim(),
        schedule: schedule.trim(), phone: phone.trim(),
        offers: offers.filter((o) => o.trim()),
      };
      if (imagePath) data.imagePath = imagePath;
      if (logoPath) data.logoPath = logoPath;
      if (address.trim()) data.address = address.trim();
      if (latitude.trim()) data.latitude = Number(latitude);
      if (longitude.trim()) data.longitude = Number(longitude);

      if (editingId) {
        await updateDocument('puestos', editingId, data);
      } else {
        await addDocument('puestos', data);
      }
      setDialogOpen(false);
    } catch (e: any) { setSaveError(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteDocument('puestos', deleteId); }
    finally { setDeleteId(null); }
  }

  if (loading) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{items.length} comercios</p>
        <button onClick={openAdd} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#3B7DD8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + Agregar
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

      <AdminDataTable
        columns={['#', 'Logo', 'Nombre', 'Teléfono', 'Horario', 'Ofertas', 'Acciones']}
        emptyMessage="No hay comercios registrados"
        rows={items.map((r, i) => ({
          key: r.id,
          cells: [
            i + 1,
            r.logoPath ? <img src={r.logoPath} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ color: '#64748b' }}>-</span>,
            <span style={{ fontWeight: 500 }}>{r.name}</span>,
            <a href={`tel:${r.phone}`} style={{ color: '#3B7DD8', textDecoration: 'none', fontSize: '12px' }}>{r.phone || '-'}</a>,
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{r.schedule || '-'}</span>,
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{r.offers?.length || 0}</span>,
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => openEdit(r)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#3B7DD8', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => setDeleteId(r.id)} style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}>Eliminar</button>
            </div>,
          ],
        }))}
      />

      {dialogOpen && (
        <AdminFormDialog title={editingId ? 'Editar Comercio' : 'Agregar Comercio'} onSave={handleSave} onCancel={() => setDialogOpen(false)} loading={saving} error={saveError}>
          <AdminImageUpload folder="puestos/fondo" currentUrl={imagePath} onUpload={setImagePath} label="Imagen de fondo" />
          <AdminImageUpload folder="puestos/logo" currentUrl={logoPath} onUpload={setLogoPath} label="Logo" />
          <AdminTextField label="Nombre" value={name} onChange={setName} placeholder="Nombre del comercio" />
          <AdminTextField label="Descripción" value={description} onChange={setDescription} placeholder="Descripción" multiline />
          <AdminTextField label="Horario" value={schedule} onChange={setSchedule} placeholder="Ej. 8:00 AM - 6:00 PM" />
          <AdminTextField label="Teléfono" value={phone} onChange={setPhone} placeholder="Ej. 449-123-4567" />
          <AdminTextField label="Dirección" value={address} onChange={setAddress} placeholder="Dirección (opcional)" />
          <div class="admin-coordinate-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AdminTextField label="Latitud" value={latitude} onChange={setLatitude} placeholder="22.145..." />
            <AdminTextField label="Longitud" value={longitude} onChange={setLongitude} placeholder="-102.413..." />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
              Ofertas
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
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: '6px',
                    border: '1px solid #334155', background: '#0f172a',
                    color: '#f1f5f9', fontSize: '12px', outline: 'none',
                  }}
                  placeholder="Ej. Tacos $25"
                />
                <button
                  onClick={() => setOffers(offers.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: '1px solid #334155', borderRadius: '6px', color: '#ef4444', padding: '4px 8px', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={() => setOffers([...offers, ''])}
              style={{ background: 'none', border: '1px dashed #334155', borderRadius: '6px', color: '#94a3b8', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
            >
              + Agregar oferta
            </button>
          </div>
        </AdminFormDialog>
      )}

      {deleteId && (
        <AdminConfirmDialog
          title="Eliminar Comercio"
          message="¿Estás seguro? El comercio será eliminado permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
