import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Map, Layers, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please provide your email and password');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.ok) {
      navigate('/projects');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  }

  return (
    <div className="auth-page">
      {/* Left side: Branding & Statement */}
      <div className="auth-left">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-8)' }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'var(--blue)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <Map size={18} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Smart City Site Planner
            </span>
          </div>

          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 'var(--space-4)' }}>
            Professional digital urban planning studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', lineHeight: 1.6, maxWidth: 440 }}>
            Plan, model, and evaluate urban sites with evidence-based spatial analyses, design options, and site context modeling.
          </p>

          <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--blue)', marginTop: 2 }}><Layers size={18} /></div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-base)' }}>Site & Context Analysis</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Strict 1.0 km² area minimums with boundary polygon verification.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--green)', marginTop: 2 }}><ShieldCheck size={18} /></div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-base)' }}>Evidence-Based Decision Record</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Verifiable Forma environmental outputs and Revit workflow tracking.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border)' }}>
          Smart City Site Planner &copy; {new Date().getFullYear()} · Professional Planning Workspace
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              Sign In
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Enter your credentials to access your planning workspace
            </p>
          </div>

          {error && (
            <div className="info-banner error" style={{ marginBottom: 'var(--space-4)' }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="planner@urbanstudio.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="password">Password</label>
                  <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--blue)' }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg mt-2"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Log in <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 'var(--weight-semibold)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
