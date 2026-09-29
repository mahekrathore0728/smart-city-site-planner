import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, AlertTriangle, Map, Trash2, ArrowRight, FolderOpen,
  LogOut, User as UserIcon, Calendar, Layers
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../store/appStore';
import type { Project } from '../types';

export default function ProjectList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.projects.list().then((res) => {
      setLoading(false);
      if (res.ok) setProjects(res.data);
      else setError(res.error);
    });
  }, []);

  async function handleDelete(p: Project, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Delete project "${p.name}"? This action cannot be undone.`)) return;
    const res = await api.projects.delete(p.id);
    if (res.ok) {
      setProjects((prev) => prev.filter((x) => x.id !== p.id));
      toast.success('Project removed successfully');
    } else {
      toast.error(res.error);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{
        height: 60,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--blue)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Map size={16} strokeWidth={2.2} />
          </div>
          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
            Smart City Site Planner
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <UserIcon size={14} />
              <span>{user.full_name}</span>
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/projects/new')}
          >
            <Plus size={14} /> New Project
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            title="Log out of workspace"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: 1080, width: '100%', margin: '0 auto', padding: 'var(--space-10) var(--space-8)', flex: 1 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Your Projects</h1>
            <p className="page-subtitle">Create a site planning project to get started.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            <Plus size={15} /> + New Project
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {error && (
          <div className="info-banner error" style={{ marginBottom: 'var(--space-6)' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && projects.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <FolderOpen size={48} className="empty-state-icon" style={{ opacity: 0.6 }} />
              <div className="empty-state-title">No projects yet</div>
              <p className="empty-state-desc">Start your first site planning project.</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/projects/new')}>
                <Plus size={15} /> Create Project
              </button>
            </div>
          </div>
        )}

        {/* ── Project List Cards/Table ── */}
        {!loading && projects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {projects.map((p) => {
              const areaValid = p.site_area_km2 >= 1.0;
              const formattedDate = new Date(p.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: 'var(--space-5) var(--space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                  }}
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', flex: 1 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(79, 124, 255, 0.1)',
                      border: '1px solid rgba(79, 124, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--blue)',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <Layers size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
                          {p.name}
                        </span>
                        <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>
                          {p.stage || 'Setup'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 6, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        <span>
                          {p.location_name || [p.city, p.state].filter(Boolean).join(', ') || 'Location not specified'}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="text-mono">{p.site_area_km2 ? p.site_area_km2.toFixed(2) : '0.00'} km²</span>
                          {areaValid ? (
                            <span style={{ color: 'var(--green)', fontSize: '10px' }} title="Meets 1 km² (1,000,000 m²) requirement">
                              (✓ Validated)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--amber)', fontSize: '10px' }} title="Below 1.0 km² requirement">
                              (⚠ &lt; 1 km²)
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> Last updated: {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/projects/${p.id}`)}
                    >
                      Open Project <ArrowRight size={13} />
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={(e) => handleDelete(p, e)}
                      title="Delete project"
                      aria-label="Delete project"
                      style={{ color: 'var(--red)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
