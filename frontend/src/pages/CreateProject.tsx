import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MapPin } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../store/appStore';

export default function CreateProject() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', city:'', state:'', location_name:'',
    site_area_km2:'', planning_org:'', description:''
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const areaVal = parseFloat(form.site_area_km2);
  const areaBelow = form.site_area_km2 !== '' && !isNaN(areaVal) && areaVal < 1.0;

  function set(field: string, value: string) {
    setForm(f => ({...f, [field]: value}));
    setErrors(e => ({...e, [field]: ''}));
  }

  function validate() {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (form.site_area_km2 !== '' && isNaN(parseFloat(form.site_area_km2))) e.site_area_km2 = 'Enter a valid number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await api.projects.create({
      name: form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      location_name: form.location_name.trim(),
      site_area_km2: form.site_area_km2 !== '' ? parseFloat(form.site_area_km2) : 0,
      planning_org: form.planning_org.trim(),
      description: form.description.trim(),
    });
    setLoading(false);
    if (res.ok) {
      toast.success('Project created successfully');
      navigate(`/projects/${res.data.id}`);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', color:'var(--text-primary)' }}>
      <header style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)', padding:'0 var(--space-8)', height:60, display:'flex', alignItems:'center', gap:'var(--space-3)', position:'sticky', top:0, zIndex:10 }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')} aria-label="Back">
          <ArrowLeft size={16}/>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', fontWeight:700, fontSize:'var(--text-md)', cursor:'pointer' }} onClick={() => navigate('/projects')}>
          <div style={{ width:26,height:26,background:'var(--sage)',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',color:'#0B0F0E' }}>
            <MapPin size={14} strokeWidth={2.5} />
          </div>
          UrbanPlan
        </div>
        <span style={{color:'var(--border-strong)',margin:'0 4px'}}>/</span>
        <span style={{color:'var(--text-secondary)', fontSize:'var(--text-base)'}}>New Project</span>
      </header>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'var(--space-10) var(--space-8)' }}>
        <div style={{ marginBottom:'var(--space-8)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{marginBottom:'var(--space-4)', paddingLeft:0}}>
            <ArrowLeft size={13}/> All Projects
          </button>
          <h1 className="page-title">New Urban Development Project</h1>
          <p className="page-subtitle">Create a workspace to manage your site planning, design options, and site analyses.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Project Details</span>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Project Name <span style={{color:'var(--red)'}}>*</span></label>
                <input id="name" className={`input ${errors.name?'error':''}`} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Pune Mixed-Use Development" autoFocus />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="city">City <span style={{color:'var(--red)'}}>*</span></label>
                  <input id="city" className={`input ${errors.city?'error':''}`} value={form.city} onChange={e=>set('city',e.target.value)} placeholder="e.g. Pune" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="state">State <span style={{color:'var(--red)'}}>*</span></label>
                  <input id="state" className={`input ${errors.state?'error':''}`} value={form.state} onChange={e=>set('state',e.target.value)} placeholder="e.g. Maharashtra" />
                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Site Location</label>
                <input id="location" className="input" value={form.location_name} onChange={e=>set('location_name',e.target.value)} placeholder="e.g. Hinjewadi–Wakad Corridor" />
                <span className="form-hint">Describe the specific area within the city</span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="area">Site Area (km²) <span style={{color:'var(--red)'}}>*</span></label>
                <input id="area" type="number" min="0" step="0.1" className={`input ${errors.site_area_km2?'error':''}`} value={form.site_area_km2} onChange={e=>set('site_area_km2',e.target.value)} placeholder="e.g. 2.5" />
                {errors.site_area_km2 && <span className="form-error">{errors.site_area_km2}</span>}
                {areaBelow && (
                  <div className="info-banner warn" style={{marginTop:'var(--space-2)'}}>
                    <AlertTriangle size={15} style={{flexShrink:0, marginTop:1}}/>
                    <span>Site area is below the recommended minimum of 1.0 km² for regional site planning.</span>
                  </div>
                )}
                {!areaBelow && <span className="form-hint">Minimum 1.0 km² recommended for regional master planning</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="org">Planning Organization</label>
                <input id="org" className="input" value={form.planning_org} onChange={e=>set('planning_org',e.target.value)} placeholder="e.g. Pune Municipal Corporation" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="desc">Project Description</label>
                <textarea id="desc" className="textarea" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Brief description of the planning objectives and site context…" />
              </div>
            </div>
            <div className="card-footer" style={{display:'flex', justifyContent:'flex-end', gap:'var(--space-3)'}}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Creating…</> : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
