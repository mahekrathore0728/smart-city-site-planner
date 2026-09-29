import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, AlertTriangle, ArrowRight, Compass } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../store/appStore';

export default function CreateProject() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    location_name: '',
    site_area_km2: '1.0',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const areaVal = parseFloat(form.site_area_km2);
  const areaBelow = form.site_area_km2 !== '' && !isNaN(areaVal) && areaVal < 1.0;

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    if (!form.location_name.trim() && !form.city.trim()) {
      e.location = 'Site location is required';
    }
    if (form.site_area_km2 !== '' && isNaN(parseFloat(form.site_area_km2))) {
      e.site_area_km2 = 'Enter a valid numeric area in km²';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const siteArea = form.site_area_km2 !== '' ? parseFloat(form.site_area_km2) : 1.0;
    const res = await api.projects.create({
      name: form.name.trim(),
      location_name: form.location_name.trim(),
      city: form.city.trim() || form.location_name.trim(),
      state: form.state.trim(),
      site_area_km2: siteArea,
      description: form.description.trim(),
    });

    setLoading(false);
    if (res.ok) {
      toast.success('Project created successfully');
      // Direct navigation to Site page
      navigate(`/projects/${res.data.id}/site`);
    } else {
      toast.error(res.error || 'Failed to create project');
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('/projects')}
            aria-label="Back to projects"
          >
            <ArrowLeft size={16} />
          </button>
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
          <span style={{ color: 'var(--border-strong)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)' }}>New Project Setup</span>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
          Cancel
        </button>
      </header>

      {/* Form Container */}
      <div style={{ maxWidth: 680, width: '100%', margin: '0 auto', padding: 'var(--space-10) var(--space-8)', flex: 1 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 className="page-title">Project Setup</h1>
          <p className="page-subtitle">Configure your urban site parameters to initialize the planning workspace.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Site Specifications</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {/* Project Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Project Name <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  id="name"
                  className={`input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Waterfront Mixed-Use Innovation District"
                  autoFocus
                  required
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label" htmlFor="location_name">
                  Location / Node <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  id="location_name"
                  className={`input ${errors.location ? 'error' : ''}`}
                  value={form.location_name}
                  onChange={(e) => set('location_name', e.target.value)}
                  placeholder="e.g. North Riverbank Sector 4"
                  required
                />
                {errors.location && <span className="form-error">{errors.location}</span>}
                <span className="form-hint">Specify site neighborhood, district, or municipal corridor</span>
              </div>

              {/* City and State grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City</label>
                  <input
                    id="city"
                    className="input"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    placeholder="e.g. Pune"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State / Region</label>
                  <input
                    id="state"
                    className="input"
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              {/* Site Area */}
              <div className="form-group">
                <label className="form-label" htmlFor="site_area">
                  Site Area (km²) <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <input
                  id="site_area"
                  type="number"
                  min="0.1"
                  step="0.01"
                  className={`input ${errors.site_area_km2 ? 'error' : ''}`}
                  value={form.site_area_km2}
                  onChange={(e) => set('site_area_km2', e.target.value)}
                  placeholder="1.0"
                />
                {errors.site_area_km2 && <span className="form-error">{errors.site_area_km2}</span>}

                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: areaBelow ? 'rgba(230, 162, 60, 0.1)' : 'rgba(69, 197, 138, 0.1)',
                  border: `1px solid ${areaBelow ? 'rgba(230, 162, 60, 0.3)' : 'rgba(69, 197, 138, 0.3)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: areaBelow ? '#FCD34D' : '#6EE7B7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}>
                  <Compass size={14} style={{ flexShrink: 0 }} />
                  {areaBelow ? (
                    <span>
                      Site area is {areaVal || 0} km² ({( (areaVal || 0) * 1000000).toLocaleString()} m²). Minimum planning threshold is 1.0 km² (1,000,000 m²).
                    </span>
                  ) : (
                    <span>
                      Standard area verified: {areaVal || 1.0} km² = {( (areaVal || 1.0) * 1000000).toLocaleString()} m² (Meets ≥ 1 km² threshold).
                    </span>
                  )}
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Description <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <textarea
                  id="description"
                  className="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Summarize initial planning vision, zoning objectives, and site constraints…"
                />
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Initializing…
                  </>
                ) : (
                  <>
                    Continue to Site <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
