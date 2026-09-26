import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Video, Info } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Walkthrough } from '../../types';

export default function WalkthroughPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [form, setForm] = useState<Partial<Walkthrough>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.walkthrough.get(projectId).then(res => { if (res.ok && res.data) setForm(res.data); setLoading(false); });
  }, [projectId]);

  function set(k: keyof Walkthrough, v: string | undefined) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await api.walkthrough.update(projectId!, form);
    setSaving(false);
    if (res.ok) { setForm(res.data || {}); toast.success('Walkthrough saved'); }
    else toast.error(res.error);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      set('video_path', res.url);
      const uRes = await api.walkthrough.update(projectId!, { ...form, video_path: res.url });
      if (uRes.ok) setForm(uRes.data || {});
      toast.success('Video uploaded');
    } else toast.error(res.error);
    e.target.value = '';
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const res = await uploadFile(file);
    if (res.ok) { set('thumbnail_path', res.url); toast.success('Thumbnail uploaded'); }
    else toast.error(res.error);
    e.target.value = '';
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const hasVideo = form.video_path || form.video_url;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">30-Second Walkthrough</h1>
          <p className="page-subtitle">Upload or link your Autodesk Forma walkthrough video</p>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> The walkthrough must be created in Autodesk Forma. Export the video and upload it here, or paste a link to a shared location. Target duration: 30 seconds.
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Video upload */}
        <div className="card">
          <div className="card-header"><span className="card-title">Walkthrough Video</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
            {form.video_path ? (
              <div>
                <div className="badge badge-green" style={{ marginBottom:'var(--space-3)' }}>✓ Video uploaded</div>
                <video src={form.video_path} controls style={{ width:'100%', maxHeight:400, borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' }} />
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop:'var(--space-2)' }} onClick={() => set('video_path', undefined)}>Remove video</button>
              </div>
            ) : (
              <label className="upload-area" style={{ cursor:'pointer', padding:'var(--space-10)' }}>
                <input type="file" accept="video/*" style={{ display:'none' }} onChange={handleVideoUpload} disabled={uploading}/>
                {uploading ? <div className="spinner"/> : <Video size={32} color="var(--text-tertiary)"/>}
                <div className="upload-area-text" style={{ marginTop:'var(--space-3)' }}>
                  {uploading ? 'Uploading video…' : 'Click to upload walkthrough video (MP4, MOV, WEBM)'}
                </div>
                <div style={{ fontSize:'var(--text-sm)', color:'var(--text-tertiary)', marginTop:'var(--space-2)' }}>Max 32 MB · Target: 30 seconds</div>
              </label>
            )}

            <div className="form-group">
              <label className="form-label">Or paste video URL / shared link</label>
              <input className="input" type="url" value={form.video_url||''} onChange={e=>set('video_url',e.target.value)} placeholder="https://… (OneDrive, Google Drive, YouTube Unlisted…)"/>
              <span className="form-hint">Use if file is too large to upload or hosted externally</span>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="card">
          <div className="card-header"><span className="card-title">Thumbnail Image</span></div>
          <div className="card-body">
            {form.thumbnail_path ? (
              <div style={{ display:'flex', alignItems:'center', gap:'var(--space-4)' }}>
                <img src={form.thumbnail_path} alt="Walkthrough thumbnail" style={{ width:160, height:90, objectFit:'cover', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)' }}/>
                <button type="button" className="btn btn-ghost btn-sm" onClick={()=>set('thumbnail_path',undefined)}>Remove</button>
              </div>
            ) : (
              <label className="upload-area" style={{ cursor:'pointer', maxWidth:300 }}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleThumbUpload}/>
                <Upload size={20} color="var(--text-tertiary)"/>
                <span className="upload-area-text">Upload thumbnail</span>
              </label>
            )}
          </div>
        </div>

        {/* Sequence notes + description */}
        <div className="card">
          <div className="card-header"><span className="card-title">Documentation</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Video Description</label>
              <textarea className="textarea" rows={3} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Describe what the walkthrough shows — site overview, proposals, key features…"/>
            </div>
            <div className="form-group">
              <label className="form-label">Sequence Notes</label>
              <textarea className="textarea" rows={3} value={form.sequence_notes||''} onChange={e=>set('sequence_notes',e.target.value)} placeholder="e.g. 0:00–0:10 Site overview, 0:10–0:20 Proposal A fly-through, 0:20–0:30 Forma Board summary…"/>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Walkthrough</>}
          </button>
        </div>
      </form>
    </div>
  );
}
