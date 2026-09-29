import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Plus, Trash2, Info } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { PresentationSlide } from '../../types';

const DEFAULT_TITLES = [
  'Site Context & Local Problems',
  'Planning Objectives & Data Sources',
  'Design Option A — Planning Concept',
  'Design Option B — Planning Concept',
  'Site Analysis Results',
  'Final Concept Decision',
  'Implementation Plan & Impact',
];

export default function Presentation() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [forms, setForms] = useState<Record<string, Partial<PresentationSlide>>>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string|null>(null);
  const [uploading, setUploading] = useState<string|null>(null);

  useEffect(() => {
    if (!projectId) return;
    api.presentation.list(projectId).then(res => {
      if (res.ok) {
        setSlides(res.data);
        const f: Record<string, Partial<PresentationSlide>> = {};
        res.data.forEach(s => { f[s.id] = { ...s }; });
        setForms(f);
      }
      setLoading(false);
    });
  }, [projectId]);

  function updateForm(id: string, key: keyof PresentationSlide, value: unknown) {
    setForms(f => ({ ...f, [id]: { ...f[id], [key]: value } }));
  }

  async function handleSave(slide: PresentationSlide) {
    setSaving(slide.id);
    const data = forms[slide.id] || {};
    const status: PresentationSlide['status'] = data.content_notes || (Array.isArray(data.image_paths) && data.image_paths.length > 0) ? 'draft' : 'empty';
    const res = await api.presentation.updateSlide(projectId!, slide.id, { ...data, status });
    setSaving(null);
    if (res.ok) { setSlides(s => s.map(x => x.id === slide.id ? res.data : x)); toast.success('Slide saved'); }
    else toast.error(res.error);
  }

  async function handleUpload(slide: PresentationSlide, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(slide.id);
    const res = await uploadFile(file);
    setUploading(null);
    if (res.ok) {
      const existing = Array.isArray(forms[slide.id]?.image_paths) ? forms[slide.id].image_paths as string[] : [];
      const newPaths = [...existing, res.url];
      updateForm(slide.id, 'image_paths', newPaths);
      await api.presentation.updateSlide(projectId!, slide.id, { image_paths: newPaths });
      toast.success('Image added');
    } else toast.error(res.error);
    e.target.value = '';
  }

  const complete = slides.filter(s => s.status === 'complete').length;
  const withContent = slides.filter(s => s.status !== 'empty').length;

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const slide = slides[activeSlide];
  const formData = slide ? (forms[slide.id] || {}) : {};
  const imagePaths = Array.isArray(formData.image_paths) ? formData.image_paths as string[] : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Presentation</h1>
          <p className="page-subtitle">Build your project deck for stakeholder and review meetings</p>
        </div>
        <div style={{ display:'flex', gap:'var(--space-3)', alignItems:'center' }}>
          <span className="badge badge-muted">{withContent}/{slides.length} slides with content</span>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> Add content notes and upload slide images. Recommended: 5–7 slides covering site context, design options, analyses, and final concept.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'var(--space-6)' }}>
        {/* Slide list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
          {slides.map((s, i) => {
            const fd = forms[s.id] || {};
            const hasContent = fd.content_notes || (Array.isArray(fd.image_paths) && (fd.image_paths as string[]).length > 0);
            return (
              <button key={s.id} onClick={() => setActiveSlide(i)}
                style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'var(--space-3) var(--space-4)', background: activeSlide===i ? 'var(--blue-light)' : 'var(--bg-panel)', border:`1.5px solid ${activeSlide===i ? 'var(--blue)' : 'var(--border)'}`, borderRadius:'var(--radius-lg)', cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:24, height:24, borderRadius:'var(--radius-sm)', background: hasContent ? 'var(--green)' : activeSlide===i ? 'var(--blue)' : 'var(--bg-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'var(--text-xs)', fontWeight:700, color: hasContent||activeSlide===i ? '#fff' : 'var(--text-tertiary)', flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'var(--text-sm)', fontWeight:'var(--weight-medium)', color: activeSlide===i?'var(--blue)':'var(--text-primary)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(fd.title as string) || DEFAULT_TITLES[i] || `Slide ${i+1}`}</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)' }}>{hasContent ? '● Content added' : '○ Empty'}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Slide editor */}
        {slide && (
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'var(--tracking-wider)', marginBottom:4 }}>Slide {activeSlide+1} of {slides.length}</div>
                <span className="card-title">{(formData.title as string) || DEFAULT_TITLES[activeSlide]}</span>
              </div>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label">Slide Title</label>
                <input className="input" value={(formData.title as string)||''} onChange={e=>updateForm(slide.id,'title',e.target.value)} placeholder={DEFAULT_TITLES[activeSlide]}/>
              </div>
              <div className="form-group">
                <label className="form-label">Content Notes</label>
                <textarea className="textarea" rows={6} value={(formData.content_notes as string)||''} onChange={e=>updateForm(slide.id,'content_notes',e.target.value)} placeholder="Key points, findings, and talking points for this slide…"/>
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="form-label">Slide Images</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--space-3)', marginBottom:'var(--space-2)' }}>
                  {imagePaths.map((src, i) => (
                    <div key={i} style={{ position:'relative' }}>
                      <img src={src} alt={`Slide ${activeSlide+1} img ${i+1}`} style={{ width:120,height:80,objectFit:'cover',borderRadius:'var(--radius-md)',border:'1px solid var(--border)' }}/>
                      <button type="button" onClick={()=>{const n=imagePaths.filter((_,j)=>j!==i);updateForm(slide.id,'image_paths',n);}} style={{ position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'var(--red)',border:'none',cursor:'pointer',color:'#fff',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                    </div>
                  ))}
                  <label className="upload-area" style={{ width:120,height:80,padding:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleUpload(slide,e)} disabled={uploading===slide.id}/>
                    {uploading===slide.id ? <div className="spinner" style={{width:14,height:14}}/> : <Upload size={14} color="var(--text-tertiary)"/>}
                    <span style={{fontSize:'var(--text-xs)',color:'var(--text-tertiary)',marginTop:4}}>Add image</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="select" style={{maxWidth:200}} value={(formData.status as string)||'empty'} onChange={e=>updateForm(slide.id,'status',e.target.value)}>
                  <option value="empty">Empty</option>
                  <option value="draft">Draft</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
            <div className="card-footer" style={{ display:'flex', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:'var(--space-2)' }}>
                {activeSlide > 0 && <button className="btn btn-ghost btn-sm" onClick={()=>setActiveSlide(i=>i-1)}>← Previous</button>}
                {activeSlide < slides.length-1 && <button className="btn btn-ghost btn-sm" onClick={()=>setActiveSlide(i=>i+1)}>Next →</button>}
              </div>
              <button className="btn btn-primary" onClick={()=>handleSave(slide)} disabled={saving===slide.id}>
                {saving===slide.id ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={14}/> Save Slide</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
