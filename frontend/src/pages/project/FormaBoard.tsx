import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Info, AlertTriangle } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FormaBoardFrame } from '../../types';

const FRAME_DESCRIPTIONS = [
  'Overview of site location, area, and key local planning challenges.',
  'Transit-Oriented Compact Development — concept, massing, and key features.',
  'Green-Blue Resilient Development — concept, network, and key features.',
  'Side-by-side Forma analysis results for all 8 required analyses.',
  'Selected final proposal, key evidence, trade-offs, and planning priorities.',
];

export default function FormaBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [frames, setFrames] = useState<FormaBoardFrame[]>([]);
  const [forms, setForms] = useState<Record<string, Partial<FormaBoardFrame>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string|null>(null);
  const [uploading, setUploading] = useState<string|null>(null);
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!projectId) return;
    api.formaBoard.list(projectId).then(res => {
      if (res.ok) {
        setFrames(res.data);
        const f: Record<string, Partial<FormaBoardFrame>> = {};
        res.data.forEach(fr => { f[fr.id] = { ...fr }; });
        setForms(f);
      }
      setLoading(false);
    });
  }, [projectId]);

  function updateForm(id: string, key: keyof FormaBoardFrame, value: string) {
    setForms(f => ({ ...f, [id]: { ...f[id], [key]: value } }));
  }

  async function handleSave(frame: FormaBoardFrame) {
    setSaving(frame.id);
    const res = await api.formaBoard.updateFrame(projectId!, frame.id, forms[frame.id] || {});
    setSaving(null);
    if (res.ok) { setFrames(f => f.map(x => x.id === frame.id ? res.data : x)); toast.success('Frame saved'); }
    else toast.error(res.error);
  }

  async function handleUpload(frame: FormaBoardFrame, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(frame.id);
    const res = await uploadFile(file);
    setUploading(null);
    if (res.ok) {
      const current = forms[frame.id] || {};
      const existingPaths = Array.isArray(current.image_paths) ? current.image_paths : [];
      const newPaths = [...existingPaths, res.url];
      setForms(f => ({ ...f, [frame.id]: { ...f[frame.id], image_paths: newPaths } }));
      const uRes = await api.formaBoard.updateFrame(projectId!, frame.id, { image_paths: newPaths });
      if (uRes.ok) setFrames(f => f.map(x => x.id === frame.id ? uRes.data : x));
      toast.success('Image added to frame');
    } else toast.error(res.error);
    e.target.value = '';
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const frame = frames[activeFrame];
  const formData = frame ? (forms[frame.id] || {}) : {};
  const imagePaths = Array.isArray(formData.image_paths) ? formData.image_paths : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Forma Board Story</h1>
          <p className="page-subtitle">Organize content for your Forma Board presentation</p>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> This organizes content for your actual Forma Board in Autodesk Forma. It does not create or publish to Forma Board directly.
      </div>

      {/* Frame navigation */}
      <div style={{ display:'flex', gap:'var(--space-2)', marginBottom:'var(--space-6)', overflowX:'auto', paddingBottom:4 }}>
        {frames.map((fr, i) => {
          const hasCont = Boolean(forms[fr.id]?.description || (Array.isArray(forms[fr.id]?.image_paths) && (forms[fr.id].image_paths as string[]).length > 0));
          return (
            <button key={fr.id} onClick={() => setActiveFrame(i)}
              style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', padding:'var(--space-3) var(--space-4)', background:'var(--bg-panel)', border:`2px solid ${activeFrame===i ? 'var(--blue)' : 'var(--border)'}`, borderRadius:'var(--radius-lg)', cursor:'pointer', minWidth:140, flexShrink:0 }}>
              <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'var(--tracking-wider)', marginBottom:4 }}>Frame {i+1}</div>
              <div style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-sm)', color: activeFrame===i ? 'var(--blue)' : 'var(--text-primary)', lineHeight:1.3 }}>{fr.frame_title}</div>
              {hasCont && <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',marginTop:6 }}/>}
            </button>
          );
        })}
      </div>

      {frame && (
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'var(--tracking-wider)', marginBottom:4 }}>Frame {activeFrame+1} of {frames.length}</div>
              <span className="card-title">{frame.frame_title}</span>
              <p className="card-subtitle">{FRAME_DESCRIPTIONS[activeFrame]}</p>
            </div>
            {saving === frame.id && <div className="spinner" style={{width:16,height:16,borderWidth:2}}/>}
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label">Frame Title</label>
              <input className="input" value={(formData.frame_title as string)||frame.frame_title} onChange={e => updateForm(frame.id,'frame_title',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Description / Summary</label>
              <textarea className="textarea" rows={4} value={(formData.description as string)||''} onChange={e => updateForm(frame.id,'description',e.target.value)} placeholder={FRAME_DESCRIPTIONS[activeFrame]}/>
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Frame Images</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--space-3)', marginBottom:'var(--space-3)' }}>
                {imagePaths.map((src, i) => (
                  <div key={i} style={{ position:'relative' }}>
                    <img src={src} alt={`Frame ${activeFrame+1} image ${i+1}`} style={{ width:120,height:80,objectFit:'cover',borderRadius:'var(--radius-md)',border:'1px solid var(--border)' }}/>
                    <button onClick={() => {
                      const newPaths = imagePaths.filter((_,j)=>j!==i);
                      setForms(f=>({...f,[frame.id]:{...f[frame.id],image_paths:newPaths}}));
                    }} style={{ position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'var(--red)',border:'none',cursor:'pointer',color:'#fff',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                  </div>
                ))}
                <label className="upload-area" style={{ width:120,height:80,padding:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleUpload(frame,e)} disabled={uploading===frame.id}/>
                  {uploading===frame.id ? <div className="spinner" style={{width:16,height:16}}/> : <Upload size={16} color="var(--text-tertiary)"/>}
                  <span style={{fontSize:'var(--text-xs)',color:'var(--text-tertiary)',marginTop:4}}>Add image</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Decision Notes</label>
              <textarea className="textarea" rows={2} value={(formData.decision_notes as string)||''} onChange={e=>updateForm(frame.id,'decision_notes',e.target.value)} placeholder="Key decisions or conclusions shown in this frame…"/>
            </div>
          </div>
          <div className="card-footer" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:'var(--space-2)' }}>
              {activeFrame > 0 && <button className="btn btn-ghost btn-sm" onClick={()=>setActiveFrame(i=>i-1)}>← Previous</button>}
              {activeFrame < frames.length-1 && <button className="btn btn-ghost btn-sm" onClick={()=>setActiveFrame(i=>i+1)}>Next →</button>}
            </div>
            <button className="btn btn-primary" onClick={()=>handleSave(frame)} disabled={saving===frame.id}>
              <Save size={14}/> Save Frame
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
