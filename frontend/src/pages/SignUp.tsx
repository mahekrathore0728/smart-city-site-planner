import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';
import { useAppStore, useToast } from '../store/appStore';
import './Auth.css';

export default function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const loginStore = useAppStore((s) => s.login);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await api.auth.signup({
      full_name: fullName,
      email,
      password,
    });
    setLoading(false);

    if (res.ok) {
      loginStore(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/projects');
    } else {
      toast.error(res.error || 'Failed to create account');
    }
  }

  return (
    <div className="auth-page">
      {/* Integrated Aerial Masterplan Visual Backdrop */}
      <div className="auth-bg-visual" aria-hidden="true">
        <svg viewBox="0 0 1200 800" className="auth-masterplan-svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="signupGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1A232E" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#070A0F" />
          <rect width="100%" height="100%" fill="url(#signupGrid)" opacity="0.5" />

          <path d="M 0 160 Q 400 90 800 200 T 1200 140 L 1200 0 L 0 0 Z" fill="#0C1522" opacity="0.85" />
          <path d="M 0 160 Q 400 90 800 200 T 1200 140" fill="none" stroke="#1B3660" strokeWidth="18" opacity="0.5" />

          <polygon points="220,120 720,140 660,560 180,540" fill="rgba(62, 123, 255, 0.05)" stroke="#3E7BFF" strokeWidth="2.5" strokeDasharray="6 4" />
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

      {/* Main Split Grid */}
      <main className="auth-split-container">
        {/* Left Column: Branding */}
        <div className="auth-left-hero">
          <div className="auth-eyebrow">
            URBAN PLANNING / SMARTER CITIES
          </div>
          <h1 className="auth-hero-headline">
            Plan Smarter.<br />
            Build <span className="blue-text">Better Places.</span>
          </h1>
          <p className="auth-hero-desc">
            Create your workspace to access integrated site analysis, spatial design options, and BIM modeling tools.
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

        {/* Right Column: SignUp Card */}
        <div className="auth-right-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Create your account</h2>
              <p className="auth-card-subtitle">
                Create your UrbanPlan workspace and start planning smarter sites.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-field-label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="auth-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                  autoComplete="name"
                />
              </div>

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
                  placeholder="sarah.j@planningstudio.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="password">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input auth-input-has-toggle"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    autoComplete="new-password"
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

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input auth-input-has-toggle"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
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
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
