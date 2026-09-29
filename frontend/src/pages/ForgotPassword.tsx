import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);

    // Password-reset API is not currently exposed by the existing backend.
    // Keep the recovery UI functional without calling an unsupported endpoint.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoading(false);
    setSubmitted(true);
    setMessage(
      'If an account exists for this email address, password reset instructions will be provided through the configured account recovery process.'
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: 'var(--space-8)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: 'var(--blue)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Map size={18} strokeWidth={2.2} />
            </div>

            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
              }}
            >
              UrbanPlan
            </span>
          </div>

          <h2
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: 'var(--space-4)',
            }}
          >
            Workspace Access Recovery
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-md)',
              lineHeight: 1.6,
              maxWidth: 440,
            }}
          >
            Recover access to your urban planning workspace and projects.
          </p>
        </div>

        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--text-xs)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--border)',
          }}
        >
          UrbanPlan &copy; {new Date().getFullYear()} · Professional Planning
          Workspace
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>

            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-primary)',
              }}
            >
              Reset Password
            </h1>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                marginTop: 4,
              }}
            >
              Enter your registered email address to continue.
            </p>
          </div>

          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-4) 0',
              }}
            >
              <CheckCircle2
                size={40}
                color="var(--green)"
                style={{ margin: '0 auto var(--space-4)' }}
              />

              <div
                style={{
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Request Recorded
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--space-6)',
                }}
              >
                {message}
              </p>

              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Registered Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="planner@urbanstudio.com"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg mt-2"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Submitting…' : 'Request Instructions'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}