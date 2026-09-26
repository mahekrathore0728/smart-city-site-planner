import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, CheckSquare, Square, AlertTriangle, Info } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { RevitWorkflow } from '../../types';

const STATUS_OPTIONS = ['pending','in_progress','complete'];

export default function RevitIntegration() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [revit, setRevit] = useState<Partial<RevitWorkflow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string|null>(null);

  useEffect(() => {
    if (!projectId) return;
    api.revit.get(projectId).then(res => { if (res.ok) setRevit(res.data); setLoading(false); });
  }, [projectId]);

  function set(key: keyof RevitWorkflow, value: unknown) { setRevit(r => ({ ...r, [key]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await api.revit.update(projectId!, revit);
    setSaving(false);
    if (res.ok) { setRevit(res.data); toast.success('Revit workflow saved'); }
    else toast.error(res.error);
  }

  async function handleUpload(field: keyof RevitWorkflow, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(field as string);
    const res = await uploadFile(file);
    setUploading(null);
    if (res.ok) {
      set(field, res.url);
      const uRes = await api.revit.update(projectId!, { ...revit, [field]: res.url });
      if (uRes.ok) setRevit(uRes.data);
      toast.success('Image uploaded');
    } else toast.error(res.error);
    e.target.value = '';
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const evidenceSlots: { field: keyof RevitWorkflow; label: string; desc: string }[] = [
    { field:'before_image', label:'Forma Massing (Before)', desc:'Forma model before Revit detailing' },
    { field:'after_image', label:'After Revit Sync', desc:'Forma model after Revit sync-back' },
    { field:'floor_plan_image', label:'Floor Plan', desc:'Revit floor plan export' },
    { field:'model_3d_image', label:'3D Model', desc:'Revit 3D view' },
    { field:'facade_image', label:'Facade', desc:'Building facade / elevation' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revit Integration</h1>
          <p className="page-subtitle">Document your Forma → Revit → Forma sync workflow</p>
        </div>
      </div>

      <div className="info-banner warn" style={{ marginBottom:'var(--space-4)' }}>
        <AlertTriangle size={15} style={{flexShrink:0}}/>
        <div>
          <strong>Work is performed in Autodesk Revit and Forma.</strong> This platform documents your workflow progress — it does not perform Revit operations or Forma sync.
        </div>
      </div>

      <div className="forma-notice" style={{ marginBottom:'var(--space-6)', padding:'var(--space-3) var(--space-4)', fontSize:'var(--text-sm)' }}>
        <Info size={13}/> Workflow: <strong>Forma Massing → Export → Revit Detailing → Sync Back → Re-run Forma Analysis</strong>
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Building info */}
        <div className="card">
          <div className="card-header"><span className="card-title">Office Building Details</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Building Name</label>
                <input className="input" value={revit.building_name||''} onChange={e=>set('building_name',e.target.value)} placeholder="e.g. Innovation Hub Tower"/>
              </div>
              <div className="form-group">
                <label className="form-label">Role in Masterplan</label>
                <input className="input" value={revit.building_role||''} onChange={e=>set('building_role',e.target.value)} placeholder="e.g. Mixed-use office at transit node"/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Forma Model Reference</label>
                <input className="input" value={revit.forma_ref||''} onChange={e=>set('forma_ref',e.target.value)} placeholder="Forma model ID or name"/>
              </div>
              <div className="form-group">
                <label className="form-label">Revit Model Reference</label>
                <input className="input" value={revit.revit_ref||''} onChange={e=>set('revit_ref',e.target.value)} placeholder="Revit file name or path"/>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow status */}
        <div className="card">
          <div className="card-header"><span className="card-title">Workflow Status</span></div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'var(--space-4)' }}>
              {[
                { key:'export_status' as keyof RevitWorkflow, label:'Revit Export', desc:'Forma → Revit' },
                { key:'sync_status' as keyof RevitWorkflow, label:'Revit Sync-back', desc:'Revit → Forma' },
              ].map(s => (
                <div key={s.key} className="form-group">
                  <label className="form-label">{s.label}</label>
                  <select className="select" value={(revit[s.key] as string)||'pending'} onChange={e=>set(s.key, e.target.value)}>
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.replace('_',' ')}</option>)}
                  </select>
                  <span className="form-hint">{s.desc}</span>
                </div>
              ))}
              {[
                { key:'detailing_done' as keyof RevitWorkflow, label:'Revit Detailing' },
                { key:'analysis_rerun' as keyof RevitWorkflow, label:'Analysis Re-run' },
              ].map(s => {
                const done = Boolean(revit[s.key]);
                return (
                  <div key={s.key} className="form-group">
                    <label className="form-label">{s.label}</label>
                    <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', cursor:'pointer', padding:'8px var(--space-3)', background: done?'var(--green-light)':'var(--bg-muted)', borderRadius:'var(--radius-md)', border:`1px solid ${done?'rgba(16,185,129,0.3)':'var(--border)'}`, marginTop:2 }}
                      onClick={() => set(s.key, !done)} role="checkbox" aria-checked={done} tabIndex={0}
                      onKeyDown={e=>e.key===' ' && set(s.key,!done)}>
                      {done ? <CheckSquare size={16} color="var(--green)"/> : <Square size={16} color="var(--text-tertiary)"/>}
                      <span style={{ fontSize:'var(--text-sm)', color: done?'var(--green-dark)':'var(--text-secondary)' }}>{done?'Done':'Pending'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div className="card">
          <div className="card-header"><span className="card-title">Evidence Gallery</span><span className="form-hint">Upload screenshots from Forma and Revit</span></div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'var(--space-4)' }}>
              {evidenceSlots.map(slot => {
                const img = revit[slot.field] as string | undefined;
                return (
                  <div key={slot.field}>
                    <div style={{ fontSize:'var(--text-sm)', fontWeight:'var(--weight-medium)', marginBottom:'var(--space-1)' }}>{slot.label}</div>
                    <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', marginBottom:'var(--space-2)' }}>{slot.desc}</div>
                    {img ? (
                      <div style={{ position:'relative' }}>
                        <img src={img} alt={slot.label} style={{ width:'100%', height:100, objectFit:'cover', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}/>
                        <button type="button" onClick={()=>set(slot.field,undefined)} style={{ position:'absolute',top:4,right:4,background:'var(--red)',border:'none',borderRadius:'50%',width:20,height:20,cursor:'pointer',color:'#fff',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                      </div>
                    ) : (
                      <label className="upload-area" style={{ height:100, padding:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:4 }}>
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleUpload(slot.field,e)} disabled={uploading===slot.field}/>
                        {uploading===slot.field ? <div className="spinner" style={{width:16,height:16}}/> : <Upload size={16} color="var(--text-tertiary)"/>}
                        <span style={{fontSize:'var(--text-xs)',color:'var(--text-tertiary)'}}>Upload</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="card-header"><span className="card-title">Notes</span></div>
          <div className="card-body">
            <textarea className="textarea" rows={3} value={revit.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Document the Revit detailing process, challenges, decisions, and sync-back observations…"/>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Revit Workflow</>}
          </button>
        </div>
      </form>
    </div>
  );
}
