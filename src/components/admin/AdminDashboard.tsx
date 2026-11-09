import { useEffect, useRef } from 'preact/hooks';
import { useCollection, toMillis, sortByCreatedAt } from '../../lib/admin-firestore';
import type { CarouselItem, Restaurant, Shop, Lodging, Service, Question, FeedbackEntry, TuristaFoto } from '../../lib/firebase';
import AdminStatCard from './AdminStatCard';

function formatRelative(ts: any): string {
  const ms = toMillis(ts);
  if (!ms) return '';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || labels.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement!.clientWidth;
    const h = Math.max(200, labels.length * 36 + 40);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...values, 1);
    const barH = 24;
    const gap = 12;
    const leftPad = 4;
    const rightPad = 60;
    const chartW = w - leftPad - rightPad;

    labels.forEach((label, i) => {
      const y = i * (barH + gap) + 8;
      const barW = Math.max(4, (values[i] / maxVal) * chartW);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(leftPad, y, chartW, barH);

      ctx.fillStyle = '#3B7DD8';
      ctx.beginPath();
      const r = barH / 2;
      ctx.moveTo(leftPad + r, y);
      ctx.lineTo(leftPad + barW - r, y);
      ctx.arcTo(leftPad + barW, y, leftPad + barW, y + r, r);
      ctx.lineTo(leftPad + barW, y + barH - r);
      ctx.arcTo(leftPad + barW, y + barH, leftPad + barW - r, y + barH, r);
      ctx.lineTo(leftPad + r, y + barH);
      ctx.arcTo(leftPad, y + barH, leftPad, y + barH - r, r);
      ctx.lineTo(leftPad, y + r);
      ctx.arcTo(leftPad, y, leftPad + r, y, r);
      ctx.fill();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '11px system-ui';
      ctx.textBaseline = 'middle';
      const labelText = label.length > 28 ? label.slice(0, 28) + '...' : label;
      ctx.fillText(labelText, leftPad + 8, y + barH / 2);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px system-ui';
      ctx.fillText(String(values[i]), leftPad + chartW + 8, y + barH / 2);
    });
  }, [labels, values]);

  return <canvas ref={canvasRef} style={{ width: '100%' }} />;
}

function PieChart({ labels, values, colors }: { labels: string[]; values: number[]; colors: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const total = values.reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = 70;
    let angle = -Math.PI / 2;

    values.forEach((v, i) => {
      const slice = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      angle += slice;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy);
  }, [labels, values, colors]);

  return (
    <div class="admin-pie-chart" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <canvas ref={canvasRef} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {labels.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors[i], flexShrink: 0 }} />
            <span style={{ color: '#cbd5e1' }}>{label}</span>
            <span style={{ color: '#64748b', marginLeft: 'auto' }}>{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const carousel = useCollection<CarouselItem>('carousel');
  const restaurants = useCollection<Restaurant>('restaurantes');
  const shops = useCollection<Shop>('puestos');
  const lodgings = useCollection<Lodging>('hospedajes');
  const services = useCollection<Service>('servicios');
  const questions = useCollection<Question>('preguntas');
  const feedback = useCollection<FeedbackEntry>('feedback');
  const photos = useCollection<TuristaFoto>('fotos_turistas');

  const activeQuestions = questions.items.filter((q) => q.isActive);
  const totalResponses = questions.items.reduce((s, q) => s + (q.totalResponses || 0), 0);
  const unreadCount = feedback.items.filter((f) => !f.isRead).length;
  const pendingPhotos = photos.items.filter((p) => !p.approved).length;

  const allStarDist = activeQuestions.reduce((acc, q) => {
    const d = q.starDistribution || [0, 0, 0, 0, 0];
    return acc.map((v, i) => v + (d[i] || 0));
  }, [0, 0, 0, 0, 0]);

  const sortedFeedback = sortByCreatedAt(feedback.items).slice(0, 4);

  return (
    <div>
      <div class="admin-stat-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '14px', marginBottom: '24px',
      }}>
        <AdminStatCard icon="image" label="Carrusel" value={carousel.items.length} />
        <AdminStatCard icon="restaurant" label="Restaurantes" value={restaurants.items.length} />
        <AdminStatCard icon="store" label="Comercios" value={shops.items.length} />
        <AdminStatCard icon="lodging" label="Hospedajes" value={lodgings.items.length} />
        <AdminStatCard icon="service" label="Servicios" value={services.items.length} />
        <AdminStatCard icon="question" label="Preguntas Activas" value={activeQuestions.length} subtitle={`${totalResponses} respuestas`} />
        <AdminStatCard icon="mail" label="Buzón" value={feedback.items.length} subtitle={`${unreadCount} sin leer`} />
        <AdminStatCard icon="camera" label="Fotos" value={photos.items.length} subtitle={`${pendingPhotos} pendientes`} />
      </div>

      <div class="admin-dashboard-chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div class="admin-dashboard-panel" style={{
          background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
          padding: '18px',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
            Respuestas por pregunta
          </h3>
          {activeQuestions.length > 0 ? (
            <BarChart
              labels={activeQuestions.map((q) => q.text)}
              values={activeQuestions.map((q) => q.totalResponses || 0)}
            />
          ) : (
            <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>No hay preguntas activas</p>
          )}
        </div>

        <div class="admin-dashboard-panel" style={{
          background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
          padding: '18px',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
            Distribucion de estrellas
          </h3>
          {allStarDist.some((v) => v > 0) ? (
            <PieChart
              labels={['1 ★', '2 ★', '3 ★', '4 ★', '5 ★']}
              values={allStarDist}
              colors={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']}
            />
          ) : (
            <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>Sin datos</p>
          )}
        </div>
      </div>

      {sortedFeedback.length > 0 && (
        <div class="admin-dashboard-panel admin-feedback-panel" style={{
          background: '#1e293b', borderRadius: '10px', border: '1px solid #334155',
          padding: '18px',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
            Comentarios recientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedFeedback.map((f) => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px', borderRadius: '8px', background: '#0f172a',
              }}>
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                  background: f.isRead ? '#1e293b' : 'rgba(234,179,8,.15)',
                  color: f.isRead ? '#64748b' : '#eab308',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {f.isRead ? 'Leído' : 'Nuevo'}
                </span>
                <p style={{
                  margin: 0, fontSize: '13px', color: f.isRead ? '#94a3b8' : '#e2e8f0',
                  flex: 1, lineHeight: 1.4, fontWeight: f.isRead ? 400 : 500,
                }}>
                  {f.comment}
                </p>
                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatRelative(f.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
