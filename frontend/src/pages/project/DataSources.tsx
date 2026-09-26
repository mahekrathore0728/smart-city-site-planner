import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ExternalLink, X, Save, Database, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { DataSource } from '../../types';

const SUGGESTIONS = ['data.gov.in','Bhuvan ISRO','Census of India','Local Master Plan','Municipal Dataset','Transport / PWD Data','OpenStreetMap','NRSC GeoPortal'];
const empty = (): Partial<DataSource> => ({ name:'', url:'', description:'', date_accessed:'', geographic_scope:'', notes:'' });

export default function DataSources() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.sources.list(projectId).then(res => { if (res.ok) setSources(res.data); setLoading(false); });
  }, [projectId]);

  function startAdd(prefill?: string) { setForm({ ...empty(), name: prefill || '' }); setEditId(null); setShowForm(true); }
  function startEdit(s: DataSource) { setForm({ ...s }); setEditId(s.id); setShowForm(true); }
  function cancel() { setShowForm(false); setEditId(null); setForm(empty()); }

  async function handleSave() {
    if (!projectId || !form.name?.trim()) { toast.error('Source name is required'); return; }
    setSaving(true);
    if (editId) {
      const res = await api.sources.update(projectId, editId, form);
      setSaving(false);
      if (res.ok) { setSources(s => s.map(x => x.id === editId ? res.data : x)); toast.success('Updated'); cancel(); }
      else toast.error(res.error);
    } else {
      const res = await api.sources.create(projectId, form);
      setSaving(false);
      if (res.ok) { setSources(s => [...s, res.data]); toast.success('Source added'); cancel(); }
      else toast.error(res.error);
    }
  }

  async function handleDelete(s: DataSource) {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    const res = await api.sources.delete(projectId!, s.id);
    if (res.ok) { setSources(prev => prev.filter(x => x.id !== s.id)); toast.success('Deleted'); }
    else toast.error(res.error);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Sources</h1>
          <p className="page-subtitle">Track GIS datasets, government portals, and reference materials</p>
        </div>
        <button className="btn btn-primary" onClick={() => startAdd()}><Plus size={15}/> Add Source</button>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> Document your actual data sources here. Do not claim data is official unless you have verified the source.
      </div>

      {/* Quick suggestions */}
      {!showForm && (
        <div style={{ marginBottom:'var(--space-5)' }}>
          <div style={{ fontSize:'var(--text-xs)', color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'var(--tracking-widest)', marginBottom:'var(--space-2)' }}>Quick add</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'var(--space-2)' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="tag" style={{ cursor:'pointer', background:'var(--bg-muted)', border:'1px solid var(--border)', borderRadius:'var(--radius-full)', padding:'4px 10px', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }} onClick={() => startAdd(s)}>
                <Plus size={10}/> {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom:'var(--space-6)', borderColor:'var(--blue)', borderWidth:2 }}>
          <div className="card-header">
            <span className="card-title">{editId ? 'Edit Source' : 'Add Data Source'}</span>
            <button className="btn btn-ghost btn-icon" onClick={cancel}><X size={16}/></button>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Source Name *</label>
                <input className="input" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. data.gov.in"/>
              </div>
              <div className="form-group">
                <label className="form-label">URL / Reference</label>
                <input className="input" value={form.url||''} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://…"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dataset Description</label>
              <textarea className="textarea" rows={2} value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What data does this source provide?"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Date Accessed</label>
                <input type="date" className="input" value={form.date_accessed||''} onChange={e=>setForm(f=>({...f,date_accessed:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Geographic Scope</label>
                <input className="input" value={form.geographic_scope||''} onChange={e=>setForm(f=>({...f,geographic_scope:e.target.value}))} placeholder="e.g. Maharashtra, India"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="input" value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional notes about this source"/>
            </div>
          </div>
          <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end', gap:'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{width:12,height:12,borderWidth:2}}/> Saving…</> : <><Save size={13}/> {editId?'Update':'Add Source'}</>}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"/></div>}
      {!loading && sources.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <Database size={36} className="empty-state-icon"/>
            <div className="empty-state-title">No data sources added</div>
            <p className="empty-state-desc">Add your GIS datasets, government portals, master plans, and reference materials.</p>
          </div>
        </div>
      )}
      {!loading && sources.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Source</th><th>Description</th><th>Scope</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {sources.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight:'var(--weight-medium)' }}>{s.name}</div>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:'var(--text-sm)', color:'var(--blue)', display:'flex', alignItems:'center', gap:3, marginTop:2 }} onClick={e=>e.stopPropagation()}>
                        <ExternalLink size={11}/> {s.url.replace(/^https?:\/\//,'').split('/')[0]}
                      </a>
                    )}
                  </td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', maxWidth:240 }}>{s.description || '—'}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{s.geographic_scope || '—'}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{s.date_accessed || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>startEdit(s)}><Pencil size={13}/></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>handleDelete(s)}><Trash2 size={13} color="var(--red)"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
