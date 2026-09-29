import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Save, AlertTriangle, CheckSquare, Square, Info,
  MapPin, Compass, Layers, CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';
import { useAppStore, useToast } from '../../store/appStore';
import type { SiteInfo } from '../../types';

export default function SiteLocation() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject } = useAppStore();
  const toast = useToast();
  const [site, setSite] = useState<Partial<SiteInfo>>({});
  const [areaKm2, setAreaKm2] = useState<string>('1.0');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [locationName, setLocationName] = useState('');
  const [planningOrg, setPlanningOrg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Map layer toggles
  const [showTerrain, setShowTerrain] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showContext, setShowContext] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api.site.get(projectId).then((res) => {
      if (res.ok) setSite(res.data);
      setLoading(false);
    });

    if (currentProject) {
      setAreaKm2(String(currentProject.site_area_km2 || 1.0));
      setCity(currentProject.city || '');
      setState(currentProject.state || '');
      setLocationName(currentProject.location_name || '');
      setPlanningOrg(currentProject.planning_org || '');
    }
  }, [projectId, currentProject]);

  function toggle(field: keyof SiteInfo) {
    setSite((s) => ({ ...s, [field]: !s[field] }));
  }

  const parsedArea = parseFloat(areaKm2);
  const areaM2 = !isNaN(parsedArea) ? parsedArea * 1_000_000 : 0;
  const isAreaValid = !isNaN(parsedArea) && parsedArea >= 1.0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true);

    const [sRes, pRes] = await Promise.all([
      api.site.update(projectId, {
        ...site,
        site_area_km2: !isNaN(parsedArea) ? parsedArea : undefined,
      }),
      api.projects.update(projectId, {
        city,
        state,
        location_name: locationName,
        site_area_km2: !isNaN(parsedArea) ? parsedArea : undefined,
        planning_org: planningOrg,
      }),
    ]);

    setSaving(false);
    if (sRes.ok) {
      setSite(sRes.data);
      if (pRes.ok) setCurrentProject(pRes.data);
      toast.success('Site configuration saved');
    } else {
      toast.error(sRes.error || 'Failed to save site data');
    }
  }

  const completionFlags = [
    { key: 'site_limits_done' as keyof SiteInfo, label: 'Site Boundary & Limits', desc: 'Polygon boundary established (minimum 1.0 km² / 1,000,000 m²)' },
    { key: 'landscaping_done' as keyof SiteInfo, label: 'Open Space & Landscaping', desc: 'Public green areas, buffer zones, and open corridors defined' },
    { key: 'buildings_done' as keyof SiteInfo, label: 'Existing & Proposed Buildings', desc: 'Massing envelopes, typologies, and setbacks established' },
    { key: 'transportation_done' as keyof SiteInfo, label: 'Roads & Circulation Network', desc: 'Arterial roads, pedestrian connections, and transit access' },
  ];
  const allDone = completionFlags.every((f) => site[f.key]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Site & Context</h1>
          <p className="page-subtitle">
            Map-first urban boundary specification, contextual terrain, and zoning validation
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* ── 1. Map-First Interactive Visual Workspace ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Interactive Site Boundary Map</span>
              <p className="card-subtitle">
                Site boundary verification and surrounding environmental context
              </p>
            </div>

            {/* Layer Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className={`btn btn-sm ${showTerrain ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setShowTerrain(!showTerrain)}
                style={{ fontSize: '11px' }}
              >
                Terrain
              </button>
              <button
                type="button"
                className={`btn btn-sm ${showRoads ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setShowRoads(!showRoads)}
                style={{ fontSize: '11px' }}
              >
                Roads
              </button>
              <button
                type="button"
                className={`btn btn-sm ${showBuildings ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setShowBuildings(!showBuildings)}
                style={{ fontSize: '11px' }}
              >
                Buildings
              </button>
              <button
                type="button"
                className={`btn btn-sm ${showContext ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setShowContext(!showContext)}
                style={{ fontSize: '11px' }}
              >
                Context
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', background: '#0A0E13', height: 420, overflow: 'hidden' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 900 420"
              style={{ display: 'block' }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="siteGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141C24" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#siteGrid)" />

              {/* 1. Terrain Contours */}
              {showTerrain && (
                <g opacity="0.4">
                  <path d="M -10 120 Q 250 80 500 140 T 910 110" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                  <path d="M -10 200 Q 280 160 550 220 T 910 180" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                  <path d="M -10 280 Q 240 240 520 300 T 910 270" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                  <path d="M -10 360 Q 300 320 600 380 T 910 340" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                </g>
              )}

              {/* 2. Context Roads */}
              {showRoads && (
                <g>
                  {/* Primary arterial */}
                  <path d="M 0 310 C 260 300, 600 350, 900 320" stroke="#1A2430" strokeWidth="16" fill="none" />
                  <path d="M 0 310 C 260 300, 600 350, 900 320" stroke="#2D3B4C" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
                  {/* Secondary collector */}
                  <path d="M 180 0 C 190 180, 170 300, 190 420" stroke="#1A2430" strokeWidth="12" fill="none" />
                  <path d="M 740 0 C 720 180, 750 300, 730 420" stroke="#1A2430" strokeWidth="12" fill="none" />
                </g>
              )}

              {/* 3. Surrounding Context Buildings */}
              {showBuildings && (
                <g opacity="0.3">
                  <rect x="60" y="50" width="80" height="70" fill="#1A232F" rx="2" />
                  <rect x="50" y="160" width="90" height="80" fill="#1A232F" rx="2" />
                  <rect x="60" y="340" width="90" height="60" fill="#1A232F" rx="2" />
                  <rect x="770" y="50" width="80" height="70" fill="#1A232F" rx="2" />
                  <rect x="760" y="160" width="90" height="90" fill="#1A232F" rx="2" />
                  <rect x="770" y="340" width="80" height="60" fill="#1A232F" rx="2" />
                </g>
              )}

              {/* 4. Site Boundary Polygon (Primary) */}
              <g id="active-site-boundary">
                {/* Boundary fill */}
                <polygon
                  points="260,70 650,85 710,340 240,320"
                  fill="rgba(79, 124, 255, 0.08)"
                  stroke="#4F7CFF"
                  strokeWidth="2.5"
                />
                {/* Internal setback guide */}
                <polygon
                  points="275,85 635,98 692,325 255,308"
                  fill="none"
                  stroke="#4F7CFF"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                />

                {/* Boundary Vertices */}
                <circle cx="260" cy="70" r="5" fill="#4F7CFF" stroke="#0B0D10" strokeWidth="2" />
                <circle cx="650" cy="85" r="5" fill="#4F7CFF" stroke="#0B0D10" strokeWidth="2" />
                <circle cx="710" cy="340" r="5" fill="#4F7CFF" stroke="#0B0D10" strokeWidth="2" />
                <circle cx="240" cy="320" r="5" fill="#4F7CFF" stroke="#0B0D10" strokeWidth="2" />

                {/* Center marker */}
                <circle cx="465" cy="205" r="4" fill="#45C58A" />
                <text x="465" y="225" fontSize="11" fill="#4F7CFF" fontWeight="700" textAnchor="middle" letterSpacing="0.04em">
                  {isAreaValid ? `SITE AREA: ${parsedArea.toFixed(2)} km² (${areaM2.toLocaleString()} m²)` : `AREA: ${parsedArea.toFixed(2)} km²`}
                </text>
              </g>

              {/* Internal Proposed Blocks */}
              <g id="internal-proposed-layout" opacity="0.8">
                <rect x="320" y="115" width="45" height="55" fill="#243142" stroke="#3A4D66" strokeWidth="1" rx="2" />
                <rect x="380" y="110" width="35" height="65" fill="#2C3D52" stroke="#486182" strokeWidth="1" rx="2" />
                <rect x="510" y="125" width="55" height="45" fill="#243142" stroke="#3A4D66" strokeWidth="1" rx="2" />
                <rect x="580" y="120" width="40" height="55" fill="#2C3D52" stroke="#486182" strokeWidth="1" rx="2" />

                <rect x="420" y="180" width="80" height="60" fill="rgba(69, 197, 138, 0.25)" stroke="#45C58A" strokeWidth="1" rx="3" />
                <text x="460" y="214" fontSize="9" fill="#6EE7B7" textAnchor="middle" fontWeight="bold">Green Spine</text>

                <rect x="320" y="240" width="60" height="40" fill="#1C2735" stroke="#2D3E54" strokeWidth="1" rx="2" />
                <rect x="540" y="245" width="65" height="40" fill="#1C2735" stroke="#2D3E54" strokeWidth="1" rx="2" />
              </g>
            </svg>

            {/* Corner Info Tag */}
            <div style={{
              position: 'absolute',
              top: 'var(--space-4)',
              left: 'var(--space-4)',
              background: 'rgba(11, 13, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '11px',
              color: 'var(--text-primary)',
            }}>
              <MapPin size={12} color="var(--blue)" />
              <span>{locationName || city || 'Site Location'}</span>
            </div>
          </div>
        </div>

        {/* ── 2. Site Area Requirement & Validation Indicator ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Site Area Threshold Validation</span>
            {isAreaValid ? (
              <span className="badge badge-green">✓ Validated (≥ 1,000,000 m²)</span>
            ) : (
              <span className="badge badge-amber">⚠ Threshold Not Met (&lt; 1,000,000 m²)</span>
            )}
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'center' }}>
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="site_area_input">
                    Site Area in Square Kilometers (km²) <span style={{ color: 'var(--red)' }}>*</span>
                  </label>
                  <input
                    id="site_area_input"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={areaKm2}
                    onChange={(e) => setAreaKm2(e.target.value)}
                    placeholder="1.0"
                  />
                </div>

                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Equivalent in square meters: <strong style={{ color: 'var(--text-primary)' }}>{areaM2.toLocaleString()} m²</strong>
                </div>
              </div>

              {/* Requirement Rule Explanation */}
              <div style={{
                background: isAreaValid ? 'rgba(69, 197, 138, 0.1)' : 'rgba(230, 162, 60, 0.1)',
                border: `1px solid ${isAreaValid ? 'rgba(69, 197, 138, 0.25)' : 'rgba(230, 162, 60, 0.25)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
              }}>
                <div style={{ fontWeight: 'var(--weight-semibold)', color: isAreaValid ? '#6EE7B7' : '#FCD34D', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                  {isAreaValid ? 'Standard Urban Site Qualification' : 'Threshold Warning'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Standard requirement: <strong>1 km² = 1,000,000 m²</strong>.
                  {isAreaValid
                    ? ' The configured area meets and exceeds the 1,000,000 m² planning criteria.'
                    : ' 100,000 m² is only 0.10 km². Please configure a minimum area of 1.00 km² (1,000,000 m²).'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Site Completeness Elements ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Site Design Completeness</span>
              <p className="card-subtitle">Track the core site modeling layers</p>
            </div>
            {allDone && <span className="badge badge-green">All Layers Verified</span>}
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {completionFlags.map((f) => {
              const done = Boolean(site[f.key]);
              return (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '12px var(--space-4)',
                    background: done ? 'rgba(69, 197, 138, 0.08)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: `1px solid ${done ? 'rgba(69, 197, 138, 0.25)' : 'var(--border)'}`,
                  }}
                  onClick={() => toggle(f.key)}
                  role="checkbox"
                  aria-checked={done}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && toggle(f.key)}
                >
                  <span style={{ color: done ? 'var(--green)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                    {done ? <CheckSquare size={18} /> : <Square size={18} />}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'var(--weight-medium)', color: done ? '#6EE7B7' : 'var(--text-primary)', fontSize: 'var(--text-md)' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Location Context Inputs ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Location & Planning Context</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city_input">City</label>
                <input
                  id="city_input"
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state_input">State / Region</label>
                <input
                  id="state_input"
                  className="input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loc_input">Site Location / Specific Area</label>
              <input
                id="loc_input"
                className="input"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Hinjewadi–Wakad Planning Sector"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="org_input">Planning Organization</label>
              <input
                id="org_input"
                className="input"
                value={planningOrg}
                onChange={(e) => setPlanningOrg(e.target.value)}
                placeholder="e.g. Municipal Development Authority"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ctx_input">Context Notes</label>
              <textarea
                id="ctx_input"
                className="textarea"
                rows={3}
                value={site.context_notes || ''}
                onChange={(e) => setSite((s) => ({ ...s, context_notes: e.target.value }))}
                placeholder="Describe spatial context, surrounding land use, and arterial connectivity…"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? 'Saving…' : <><Save size={15} /> Save Site Information</>}
          </button>
        </div>
      </form>
    </div>
  );
}
