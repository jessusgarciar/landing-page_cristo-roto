import { useState } from 'preact/hooks';
import { login } from '../../lib/admin-auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    console.log('[AdminLogin] handleSubmit', email, pass ? '***' : 'empty');
    if (!email.trim() || !pass) { setError('Completa todos los campos'); return; }
    setLoading(true); setError('');
    try {
      console.log('[AdminLogin] calling login...');
      await login(email.trim(), pass);
      console.log('[AdminLogin] login success');
    } catch (err: any) {
      console.error('[AdminLogin] login error:', err.message || err);
      setError(err.message || err.code || 'Error de autenticacion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="admin-login-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div class="admin-login-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px', width: '380px', maxWidth: '90vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,125,216,.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B7DD8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          </div>
          <h2 style={{ margin: '12px 0 4px', fontSize: '18px', fontWeight: 600, color: '#f1f5f9' }}>Panel de Administracion</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Ingresa con tu cuenta de administrador</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onInput={(e: any) => setEmail(e.target.value)} placeholder="admin@ejemplo.com" disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${error ? '#ef4444' : '#334155'}`, background: '#0f172a', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: error ? '4px' : '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>Contrasena</label>
            <input type="password" value={pass} onInput={(e: any) => setPass(e.target.value)} placeholder="********" disabled={loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${error ? '#ef4444' : '#334155'}`, background: '#0f172a', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {error && <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#ef4444' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: 'none', background: loading ? '#2563eb80' : '#3B7DD8', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}><a href="/" style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'none' }}>Volver al inicio</a></div>
      </div>
    </div>
  );
}
