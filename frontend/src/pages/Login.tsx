import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';
import { useAppStore, useToast } from '../store/appStore';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const loginStore = useAppStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/projects';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await api.auth.login({ email, password });
    setLoading(false);

    if (res.ok) {
      loginStore(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.full_name}!`);
      navigate(from, { replace: true });
    } else {
      toast.error(res.error || 'Failed to authenticate');
    }
  }

  return (
    <div className="auth-page">
      {/* Integrated Aerial Photographic City Background */}
      <div className="auth-bg-visual" aria-hidden="true">
        <img
          src="/images/city-masterplan-bg.jpg"
          alt="Aerial City Background"
          className="auth-masterplan-img"
        />
        <svg viewBox="0 0 1200 800" className="auth-masterplan-svg" preserveAspectRatio="none">
          <polygon
            points="220,120 720,140 660,560 180,540"
            fill="rgba(62, 123, 255, 0.05)"
            stroke="#3E7BFF"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          <circle cx="220" cy="120" r="4" fill="#3E7BFF" />
          <circle cx="720" cy="140" r="4" fill="#3E7BFF" />
          <circle cx="660" cy="560" r="4" fill="#3E7BFF" />
          <circle cx="180" cy="540" r="4" fill="#3E7BFF" />
        </svg>
        <div className="auth-bg-overlay" />
      </div>

      {/* Header Bar */}
      <header className="auth-header-bar">
        <Link to="/" className="auth-brand-logo">
          <div className="auth-logo-badge">
            <Layers size={18} />
          </div>
          <span>UrbanPlan</span>
        </Link>
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      {/* Main Cinematic Grid */}
      <main className="auth-split-container">
        {/* Left Column: Urban Planning Hero Branding */}
        <div className="auth-left-hero">
          <div className="auth-eyebrow">
            URBAN PLANNING / SMARTER CITIES
          </div>
          <h1 className="auth-hero-headline">
            Plan Smarter.<br />
            Build <span className="blue-text">Better Places.</span>
          </h1>
          <p className="auth-hero-desc">
            A professional workspace for site planning, urban analysis and data-backed design decisions.
          </p>

          <div className="auth-hero-pillars">
            <div className="hero-pillar">
              <div className="pillar-dot" />
              <span>Interactive 3D site masterplanning</span>
            </div>
            <div className="hero-pillar">
              <div className="pillar-dot" />
              <span>Built-in environmental analysis</span>
            </div>
            <div className="hero-pillar">
              <div className="pillar-dot" />
              <span>Audit-ready design option comparison</span>
            </div>
          </div>
        </div>

        {/* Right Column: Compact Professional Login Form Panel */}
        <div className="auth-right-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Welcome back</h2>
              <p className="auth-card-subtitle">
                Sign in to continue planning smarter places.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@planningstudio.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-header">
                  <label className="auth-field-label" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-btn"
                    onClick={() =>
                      toast.info('Password reset instructions sent to your email.')
                    }
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input auth-input-has-toggle"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill btn-pill-blue auth-submit-pill"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div
                      className="spinner"
                      style={{ width: 14, height: 14, borderWidth: 2 }}
                    />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
