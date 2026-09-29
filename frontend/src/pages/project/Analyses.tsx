import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Info, AlertTriangle } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Analysis, Proposal, AnalysisType, AnalysisStatus, AnalysisProvenance } from '../../types';
import { ANALYSIS_LABELS, ANALYSIS_STATUS_LABELS, PROVENANCE_LABELS } from '../../types';

const ANALYSIS_TYPES: AnalysisType[] = ['area_metrics','embodied_carbon','sun_hours','daylight','wind','microclimate','noise','solar_energy'];
const ANALYSIS_ICONS: Record<AnalysisType, string> = { area_metrics:'⬛', embodied_carbon:'♻️', sun_hours:'☀️', daylight:'💡', wind:'🌬️', microclimate:'🌡️', noise:'🔊', solar_energy:'⚡' };

export default function Analyses() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [activeTab, setActiveTab] = useState<AnalysisType>('area_metrics');
  const [activeProp, setActiveProp] = useState<'A'|'B'>('A');
  const [form, setForm] = useState<Partial<Analysis>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([api.proposals.list(projectId), api.analyses.list(projectId)]).then(([pr, ar]) => {
      if (pr.ok) setProposals(pr.data);
      if (ar.ok) {
        const map: Record<string, Analysis> = {};
        ar.data.forEach(a => { map[`${a.proposal_id}:${a.analysis_type}`] = a; });
        setAnalyses(map);
      }
      setLoading(false);
    });
  }, [projectId]);

  const currentProp = proposals.find(p => p.label === activeProp);
  const key = currentProp ? `${currentProp.id}:${activeTab}` : '';
  const currentAnalysis = analyses[key];

  useEffect(() => {
    if (currentAnalysis) setForm({ ...currentAnalysis });
    else setForm({});
  }, [key, currentAnalysis]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentAnalysis) return;
    setSaving(true);
    const res = await api.analyses.update(projectId!, currentAnalysis.id, form);
    setSaving(false);
    if (res.ok) {
      setAnalyses(a => ({ ...a, [key]: res.data }));
      toast.success('Analysis saved');
    } else toast.error(res.error);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !currentAnalysis) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      setForm(f => ({ ...f, evidence_image_path: res.url }));
      const uRes = await api.analyses.update(projectId!, currentAnalysis.id, { ...form, evidence_image_path: res.url, status: 'uploaded' });
      if (uRes.ok) { setAnalyses(a => ({ ...a, [key]: uRes.data })); toast.success('Evidence uploaded'); }
    } else toast.error(res.error);
    e.target.value = '';
  }

  const statusDot: Record<AnalysisStatus, string> = { not_started:'grey', evidence_required:'amber', uploaded:'blue', reviewed:'green' };
  const statusClass: Record<AnalysisStatus, string> = { not_started:'not-started', evidence_required:'evidence-required', uploaded:'uploaded', reviewed:'reviewed' };

  function getAnalysisForType(type: AnalysisType, propId: string) {
    return analyses[`${propId}:${type}`];
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Site Analysis</h1>
          <p className="page-subtitle">Document environmental, microclimate, and spatial analysis evidence</p>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/>
        Import analysis findings and visual evidence from external spatial analysis software (such as Autodesk Forma). Document findings and team design responses.
      </div>

      {/* Proposal selector */}
      <div style={{ display:'flex', gap:'var(--space-3)', marginBottom:'var(--space-6)' }}>
        {(['A','B'] as const).map(l => {
          const prop = proposals.find(p => p.label === l);
          const reviewed = ANALYSIS_TYPES.filter(t => prop && getAnalysisForType(t, prop.id)?.status === 'reviewed').length;
          return (
            <button key={l} onClick={() => setActiveProp(l)}
              style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'var(--space-3) var(--space-5)', background:'var(--bg-panel)', border:`2px solid ${activeProp===l ? (l==='A'?'var(--blue)':'var(--green)') : 'var(--border)'}`, borderRadius:'var(--radius-lg)', cursor:'pointer', flex:1 }}>
              <div style={{ width:28, height:28, borderRadius:'var(--radius-md)', background:l==='A'?'var(--blue)':'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, flexShrink:0 }}>{l}</div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-md)' }}>{prop?.name || `Design Option ${l}`}</div>
                <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{reviewed}/8 analyses reviewed</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'var(--space-6)' }}>
        {/* Analysis type list */}
        <div className="card" style={{ padding:'var(--space-2)', alignSelf:'start' }}>
          {ANALYSIS_TYPES.map(type => {
            const prop = proposals.find(p => p.label === activeProp);
            const an = prop ? getAnalysisForType(type, prop.id) : null;
            const status: AnalysisStatus = an?.status || 'not_started';
            return (
              <button key={type} onClick={() => setActiveTab(type)}
                style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', width:'100%', padding:'9px var(--space-3)', background: activeTab===type ? 'var(--bg-muted)' : 'transparent', border:`1px solid ${activeTab===type?'var(--border-strong)':'transparent'}`, borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'left', marginBottom:2 }}>
                <span style={{ fontSize:16 }}>{ANALYSIS_ICONS[type]}</span>
                <span style={{ flex:1, fontSize:'var(--text-sm)', fontWeight: activeTab===type ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: activeTab===type ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {ANALYSIS_LABELS[type]}
                </span>
                <span className={`status-dot dot-${statusDot[status]}`}/>
              </button>
            );
          })}
        </div>

        {/* Analysis form */}
        {currentAnalysis && (
          <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
                    <span style={{ fontSize:20 }}>{ANALYSIS_ICONS[activeTab]}</span>
                    <span className="card-title">{ANALYSIS_LABELS[activeTab]}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background: activeProp==='A'?'var(--blue)':'var(--green)' }}/>
                      <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>Design Option {activeProp}</span>
                    </div>
                  </div>
                  <p className="card-subtitle">Import or enter analysis findings and visual evidence for Design Option {activeProp}</p>
                </div>
                <span className={`analysis-status ${statusClass[currentAnalysis.status]}`}>
                  {ANALYSIS_STATUS_LABELS[currentAnalysis.status]}
                </span>
              </div>
              <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>

                {/* Status + Provenance */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="select" value={form.status||'not_started'} onChange={e => setForm(f=>({...f, status: e.target.value as AnalysisStatus}))}>
                      {Object.entries(ANALYSIS_STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data Provenance</label>
                    <select className="select" value={form.provenance||'user'} onChange={e => setForm(f=>({...f, provenance: e.target.value as AnalysisProvenance}))}>
                      {Object.entries(PROVENANCE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>

                {/* Result */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Result Value</label>
                    <input className="input" value={form.result_value||''} onChange={e=>setForm(f=>({...f,result_value:e.target.value}))} placeholder="Import or enter result value…"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input className="input" value={form.result_unit||''} onChange={e=>setForm(f=>({...f,result_unit:e.target.value}))} placeholder="kWh/m², hrs, dB…"/>
                  </div>
                </div>

                {/* Finding → Design Response */}
                <div className="form-group">
                  <label className="form-label">Finding <span className="form-hint" style={{display:'inline',textTransform:'none',letterSpacing:'normal',fontWeight:400}}>— What did the analysis show?</span></label>
                  <textarea className="textarea" rows={3} value={form.finding||''} onChange={e=>setForm(f=>({...f,finding:e.target.value}))} placeholder="e.g. Selected blocks experience daylight reduction due to orientation…"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Design Response <span className="form-hint" style={{display:'inline',textTransform:'none',letterSpacing:'normal',fontWeight:400}}>— What design modification was made?</span></label>
                  <textarea className="textarea" rows={3} value={form.design_response||''} onChange={e=>setForm(f=>({...f,design_response:e.target.value}))} placeholder="e.g. Building massing and setback adjusted to optimize solar access…"/>
                </div>

                {/* Evidence upload */}
                <div className="form-group">
                  <label className="form-label">Analysis Evidence (Screenshot / Image)</label>
                  {form.evidence_image_path ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
                      <img src={form.evidence_image_path} alt="Analysis evidence" style={{ height:80, width:120, objectFit:'cover', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}/>
                      <div>
                        <div style={{ fontSize:'var(--text-sm)', color:'var(--green)', fontWeight:'var(--weight-medium)' }}>✓ Evidence uploaded</div>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setForm(f=>({...f,evidence_image_path:undefined}))}>Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-area" style={{cursor:'pointer'}}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={handleUpload} disabled={uploading}/>
                      {uploading ? <div className="spinner"/> : <Upload size={20} color="var(--text-tertiary)"/>}
                      <div className="upload-area-text">
                        {uploading ? 'Uploading…' : 'Click to upload analysis screenshot'}
                      </div>
                    </label>
                  )}
                </div>

                {/* Source + Notes */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Source / Reference</label>
                    <input className="input" value={form.source||''} onChange={e=>setForm(f=>({...f,source:e.target.value}))} placeholder="Autodesk Forma analysis result"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input className="input" value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional observations…"/>
                  </div>
                </div>
              </div>
              <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={14}/> Save Analysis</>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
