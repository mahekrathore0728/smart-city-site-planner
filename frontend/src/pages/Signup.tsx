import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Map, Layers, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const res = await signup(fullName.trim(), email.trim(), password, confirmPassword);
    if (res.ok) {
      // Automatically enter Projects page
      navigate('/projects');
    } else {
      setError(res.error || 'Failed to create account');
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
            Dedicated studio for professional site planning
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', lineHeight: 1.6, maxWidth: 440 }}>
            Create an account to start documenting genuine site data, formulating design options, and auditing environmental performance.
          </p>

          <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--blue)', marginTop: 2 }}><Layers size={18} /></div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-base)' }}>Isolated Workspaces</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Your projects remain strictly private to your authenticated user account.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--green)', marginTop: 2 }}><ShieldCheck size={18} /></div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--text-base)' }}>Clean Starting State</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No fake data or sample clutter — start fresh with your real site requirements.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border)' }}>
          Smart City Site Planner &copy; {new Date().getFullYear()} · Professional Planning Workspace
        </div>
      </div>

      {/* Right side: Signup form */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Register your planner profile to begin new site projects
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
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Architect"
                  autoComplete="name"
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@urbanstudio.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 'var(--weight-semibold)' }}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
