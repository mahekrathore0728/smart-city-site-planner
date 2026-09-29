import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, AlertTriangle, CheckSquare, Square, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useAppStore, useToast } from '../../store/appStore';
import type { SiteInfo } from '../../types';

export default function SiteLocation() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject } = useAppStore();
  const toast = useToast();
  const [site, setSite] = useState<Partial<SiteInfo>>({});
  const [areaStr, setAreaStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.site.get(projectId).then(res => {
      if (res.ok) setSite(res.data);
      setLoading(false);
    });
    if (currentProject) setAreaStr(String(currentProject.site_area_km2 || ''));
  }, [projectId, currentProject]);

  function toggle(field: keyof SiteInfo) {
    setSite(s => ({ ...s, [field]: !s[field] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true);
    const areaVal = parseFloat(areaStr);
    const [sRes, pRes] = await Promise.all([
      api.site.update(projectId, {
        ...site,
        site_area_km2: !isNaN(areaVal) ? areaVal : undefined,
        boundary_coords: site.boundary_coords,
      }),
      api.projects.update(projectId, {
        city: (document.getElementById('city') as HTMLInputElement)?.value,
        state: (document.getElementById('state') as HTMLInputElement)?.value,
        location_name: (document.getElementById('loc') as HTMLInputElement)?.value,
        site_area_km2: !isNaN(areaVal) ? areaVal : undefined,
        planning_org: (document.getElementById('org') as HTMLInputElement)?.value,
      }),
    ]);
    setSaving(false);
    if (sRes.ok) {
      setSite(sRes.data);
      if (pRes.ok) setCurrentProject(pRes.data);
      toast.success('Site information saved');
    } else toast.error(sRes.error);
  }

  const areaVal = parseFloat(areaStr);
  const areaWarn = areaStr !== '' && !isNaN(areaVal) && areaVal < 1.0;

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const p = currentProject;
  const completionFlags = [
    { key:'site_limits_done' as keyof SiteInfo, label:'Site Limits', desc:'Site boundary defined and documented in Forma' },
    { key:'landscaping_done' as keyof SiteInfo, label:'Landscaping', desc:'Green spaces, parks, and landscape elements planned' },
    { key:'buildings_done' as keyof SiteInfo, label:'Buildings', desc:'Building massing or typologies defined' },
    { key:'transportation_done' as keyof SiteInfo, label:'Transportation', desc:'Roads, transit, and pedestrian networks planned' },
  ];
  const allDone = completionFlags.every(f => site[f.key]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Site & Location</h1>
          <p className="page-subtitle">Define your planning site boundary, area, and context</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Site details */}
        <div className="card">
          <div className="card-header"><span className="card-title">Site Details</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input id="city" className="input" defaultValue={p?.city || ''} placeholder="e.g. Pune"/>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input id="state" className="input" defaultValue={p?.state || ''} placeholder="e.g. Maharashtra"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="loc">Site Location Name</label>
              <input id="loc" className="input" defaultValue={p?.location_name || ''} placeholder="e.g. Hinjewadi–Wakad Corridor"/>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="area">Site Area (km²) *</label>
              <input id="area" type="number" min="0" step="0.01" className="input" value={areaStr} onChange={e => setAreaStr(e.target.value)} placeholder="e.g. 2.5"/>
              {areaWarn && (
                <div className="info-banner warn" style={{marginTop:'var(--space-2)'}}>
                  <AlertTriangle size={14} style={{flexShrink:0}}/> Site area is below the recommended minimum of 1.0 km² for regional site planning.
                </div>
              )}
              {!areaWarn && <span className="form-hint">Minimum 1.0 km² recommended for regional master planning</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="org">Planning Organization</label>
              <input id="org" className="input" defaultValue={p?.planning_org || ''} placeholder="e.g. Pune Municipal Corporation"/>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ctx">Context Notes</label>
              <textarea id="ctx" className="textarea" rows={3} value={site.context_notes || ''} onChange={e => setSite(s => ({...s, context_notes: e.target.value}))} placeholder="Describe the planning context, surrounding land use, key landmarks…"/>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lctx">Local Context</label>
              <textarea id="lctx" className="textarea" rows={2} value={site.local_context || ''} onChange={e => setSite(s => ({...s, local_context: e.target.value}))} placeholder="Describe the local planning area, municipal authority, zoning context…"/>
            </div>
          </div>
        </div>

        {/* Site completeness */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Site Design Completeness</span>
              <p className="card-subtitle">Track the four primary site design elements</p>
            </div>
            {allDone && <span className="badge badge-green">All Complete</span>}
          </div>
          <div className="card-body" style={{display:'flex', flexDirection:'column', gap:'var(--space-3)'}}>
            <div className="info-banner info" style={{marginBottom:'var(--space-2)'}}>
              <Info size={14} style={{flexShrink:0}}/> These elements are modeled in external spatial planning tools (such as Autodesk Forma). Track progress here.
            </div>
            {completionFlags.map(f => {
              const done = Boolean(site[f.key]);
              return (
                <div key={f.key} style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'10px var(--space-4)', background: done ? 'var(--green-light)' : 'var(--bg-muted)', borderRadius:'var(--radius-md)', cursor:'pointer', border:`1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}
                  onClick={() => toggle(f.key)} role="checkbox" aria-checked={done} tabIndex={0}
                  onKeyDown={e => e.key===' ' && toggle(f.key)}>
                  <span style={{ color: done ? 'var(--green)' : 'var(--text-tertiary)', flexShrink:0 }}>
                    {done ? <CheckSquare size={18}/> : <Square size={18}/>}
                  </span>
                  <div>
                    <div style={{ fontWeight:'var(--weight-medium)', color: done ? 'var(--green-dark)' : 'var(--text-primary)', fontSize:'var(--text-md)' }}>{f.label}</div>
                    <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Project Documentation Map</span>
              <p className="card-subtitle">Visual reference map for project documentation</p>
            </div>
          </div>
          <div className="card-body">
            <div className="info-banner info" style={{marginBottom:'var(--space-4)'}}>
              <Info size={14} style={{flexShrink:0}}/> This is a <strong>spatial reference map</strong>. The detailed site model is developed in external modeling tools.
            </div>
            <div style={{ height:360, background:'var(--bg-muted)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'var(--space-3)', color:'var(--text-tertiary)' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.4">
                <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 20h40M20 4v40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
                <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div style={{fontWeight:'var(--weight-medium)'}}>Map View</div>
              <div style={{fontSize:'var(--text-sm)', textAlign:'center', maxWidth:300}}>
                Enter coordinates and install <code>react-leaflet</code> to display interactive site boundary map.<br/>
                Use Autodesk Forma for actual site modeling.
              </div>
              {(p?.coordinates as any)?.lat && (
                <div style={{fontFamily:'var(--font-mono)', fontSize:'var(--text-sm)', color:'var(--blue)'}}>
                  {(p?.coordinates as any).lat}° N, {(p?.coordinates as any).lng}° E
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Site Information</>}
          </button>
        </div>
      </form>
    </div>
  );
}
