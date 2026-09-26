import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Target, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Objective } from '../../types';

const empty = (): Partial<Objective> => ({ name:'', description:'', target:'', rationale:'', status:'active' });
const STATUS_BADGE: Record<string,string> = { active:'badge-blue', achieved:'badge-green', deferred:'badge-muted' };

export default function Objectives() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.objectives.list(projectId).then(res => { if (res.ok) setObjectives(res.data); setLoading(false); });
  }, [projectId]);

  function startAdd() { setForm(empty()); setEditId(null); setShowForm(true); }
  function startEdit(o: Objective) { setForm({ ...o }); setEditId(o.id); setShowForm(true); }
  function cancel() { setShowForm(false); setEditId(null); setForm(empty()); }

  async function handleSave() {
    if (!projectId || !form.name?.trim()) { toast.error('Objective name is required'); return; }
    setSaving(true);
    if (editId) {
      const res = await api.objectives.update(projectId, editId, form);
      setSaving(false);
      if (res.ok) { setObjectives(o => o.map(x => x.id === editId ? res.data : x)); toast.success('Updated'); cancel(); }
      else toast.error(res.error);
    } else {
      const res = await api.objectives.create(projectId, form);
      setSaving(false);
      if (res.ok) { setObjectives(o => [...o, res.data]); toast.success('Objective added'); cancel(); }
      else toast.error(res.error);
    }
  }

  async function handleDelete(o: Objective) {
    if (!window.confirm(`Delete "${o.name}"?`)) return;
    const res = await api.objectives.delete(projectId!, o.id);
    if (res.ok) { setObjectives(prev => prev.filter(x => x.id !== o.id)); toast.success('Deleted'); }
    else toast.error(res.error);
  }

  async function cycleStatus(o: Objective) {
    const next: Objective['status'] = o.status === 'active' ? 'achieved' : o.status === 'achieved' ? 'deferred' : 'active';
    const res = await api.objectives.update(projectId!, o.id, { status: next });
    if (res.ok) setObjectives(prev => prev.map(x => x.id === o.id ? res.data : x));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart City Objectives</h1>
          <p className="page-subtitle">Define measurable planning goals for this project</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd}><Plus size={15}/> Add Objective</button>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> Enter defensible, team-verified targets. Do not invent impact numbers — only state targets your team can justify with data or evidence.
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:'var(--space-6)', borderColor:'var(--blue)', borderWidth:2 }}>
          <div className="card-header">
            <span className="card-title">{editId ? 'Edit Objective' : 'Add Planning Objective'}</span>
            <button className="btn btn-ghost btn-icon" onClick={cancel}><X size={16}/></button>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Objective Name *</label>
              <input className="input" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Improve last-mile connectivity"/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" rows={2} value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What does this objective aim to achieve?"/>
            </div>
            <div className="form-group">
              <label className="form-label">Target</label>
              <input className="input" value={form.target||''} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="e.g. Reduce last-mile travel time by 30% from baseline"/>
              <span className="form-hint">Enter a specific, defensible target that your team can justify with data</span>
            </div>
            <div className="form-group">
              <label className="form-label">Rationale / Source</label>
              <input className="input" value={form.rationale||''} onChange={e=>setForm(f=>({...f,rationale:e.target.value}))} placeholder="e.g. NUTP guidelines, local master plan, IGBC standards"/>
            </div>
          </div>
          <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end', gap:'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{width:12,height:12,borderWidth:2}}/> Saving…</> : <><Save size={13}/> {editId?'Update':'Add Objective'}</>}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"/></div>}

      {!loading && objectives.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <Target size={36} className="empty-state-icon"/>
            <div className="empty-state-title">No objectives defined</div>
            <p className="empty-state-desc">Examples: "Improve last-mile connectivity", "Increase green coverage to 30%", "Reduce urban heat stress"</p>
            <button className="btn btn-primary mt-4" onClick={startAdd}><Plus size={14}/> Add First Objective</button>
          </div>
        </div>
      )}

      {!loading && objectives.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
          {objectives.map(o => (
            <div key={o.id} className="card">
              <div style={{ padding:'var(--space-5) var(--space-6)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'var(--space-4)', marginBottom:'var(--space-3)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', flexWrap:'wrap' }}>
                    <h4 style={{ fontSize:'var(--text-lg)', fontWeight:'var(--weight-semibold)' }}>{o.name}</h4>
                    <button className={`badge ${STATUS_BADGE[o.status]||'badge-muted'}`} onClick={() => cycleStatus(o)} title="Click to cycle status" style={{cursor:'pointer'}}>
                      {o.status}
                    </button>
                  </div>
                  <div style={{ display:'flex', gap:'var(--space-1)', flexShrink:0 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(o)}><Pencil size={13}/></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(o)}><Trash2 size={13} color="var(--red)"/></button>
                  </div>
                </div>
                {o.description && <p style={{ color:'var(--text-secondary)', marginBottom:'var(--space-3)', fontSize:'var(--text-base)', lineHeight:'var(--leading-relaxed)' }}>{o.description}</p>}
                {o.target && (
                  <div style={{ background:'var(--blue-light)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:'var(--radius-md)', padding:'var(--space-3) var(--space-4)', marginBottom:'var(--space-3)' }}>
                    <div style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'var(--tracking-wider)', marginBottom:4 }}>Target</div>
                    <div style={{ color:'var(--text-primary)', fontSize:'var(--text-base)' }}>{o.target}</div>
                  </div>
                )}
                {o.rationale && (
                  <div style={{ fontSize:'var(--text-sm)', color:'var(--text-tertiary)' }}>
                    <span style={{ fontWeight:'var(--weight-medium)', color:'var(--text-secondary)' }}>Rationale: </span>{o.rationale}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
