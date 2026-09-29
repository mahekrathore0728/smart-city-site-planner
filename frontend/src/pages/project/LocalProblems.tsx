import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, AlertTriangle, X, Save } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { LocalProblem, ProblemCategory } from '../../types';
import { PROBLEM_CATEGORY_LABELS } from '../../types';

const SEV_COLORS: Record<string, string> = {
  critical: 'badge-red', high: 'badge-amber', medium: 'badge-blue', low: 'badge-muted'
};

const empty = (): Partial<LocalProblem> => ({ title:'', category:'mobility', severity:'medium', description:'', source:'', notes:'' });

export default function LocalProblems() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [problems, setProblems] = useState<LocalProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.problems.list(projectId).then(res => {
      if (res.ok) setProblems(res.data);
      setLoading(false);
    });
  }, [projectId]);

  function startAdd() { setForm(empty()); setEditId(null); setShowForm(true); }
  function startEdit(p: LocalProblem) { setForm({ ...p }); setEditId(p.id); setShowForm(true); }
  function cancelForm() { setShowForm(false); setEditId(null); setForm(empty()); }

  async function handleSave() {
    if (!projectId || !form.title?.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    if (editId) {
      const res = await api.problems.update(projectId, editId, form);
      setSaving(false);
      if (res.ok) { setProblems(p => p.map(x => x.id === editId ? res.data : x)); toast.success('Updated'); cancelForm(); }
      else toast.error(res.error);
    } else {
      const res = await api.problems.create(projectId, form);
      setSaving(false);
      if (res.ok) { setProblems(p => [...p, res.data]); toast.success('Problem added'); cancelForm(); }
      else toast.error(res.error);
    }
  }

  async function handleDelete(p: LocalProblem) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    const res = await api.problems.delete(projectId!, p.id);
    if (res.ok) { setProblems(prev => prev.filter(x => x.id !== p.id)); toast.success('Deleted'); }
    else toast.error(res.error);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Context & Problems</h1>
          <p className="page-subtitle">Document the site context, environmental challenges, and planning issues</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd}><Plus size={15}/> Add Problem</button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card" style={{ marginBottom:'var(--space-6)', borderColor:'var(--blue)', borderWidth:2 }}>
          <div className="card-header">
            <span className="card-title">{editId ? 'Edit Problem' : 'Add Local Problem'}</span>
            <button className="btn btn-ghost btn-icon" onClick={cancelForm}><X size={16}/></button>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="input" value={form.title||''} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Traffic congestion at main junction"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="select" value={form.category||'mobility'} onChange={e => setForm(f=>({...f,category:e.target.value as ProblemCategory}))}>
                  {Object.entries(PROBLEM_CATEGORY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="select" value={form.severity||'medium'} onChange={e => setForm(f=>({...f,severity:e.target.value as any}))}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" rows={2} value={form.description||''} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the problem and its impact on the community…"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Source</label>
                <input className="input" value={form.source||''} onChange={e => setForm(f=>({...f,source:e.target.value}))} placeholder="e.g. Municipal survey 2023"/>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="input" value={form.notes||''} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional notes…"/>
              </div>
            </div>
          </div>
          <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end', gap:'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{width:12,height:12,borderWidth:2}}/> Saving…</> : <><Save size={13}/> {editId?'Update':'Add Problem'}</>}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"/></div>}

      {!loading && problems.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <AlertTriangle size={36} className="empty-state-icon"/>
            <div className="empty-state-title">No local problems documented</div>
            <p className="empty-state-desc">Document the planning challenges, infrastructure gaps, and environmental issues affecting this site.</p>
            <button className="btn btn-primary mt-4" onClick={startAdd}><Plus size={14}/> Add First Problem</button>
          </div>
        </div>
      )}

      {!loading && problems.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {problems.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight:'var(--weight-medium)' }}>{p.title}</div>
                    {p.description && <div style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginTop:2 }}>{p.description}</div>}
                  </td>
                  <td><span className="tag">{PROBLEM_CATEGORY_LABELS[p.category] || p.category}</span></td>
                  <td><span className={`badge ${SEV_COLORS[p.severity] || 'badge-muted'}`}>{p.severity}</span></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', maxWidth:180 }}>
                    {p.source || <span style={{color:'var(--text-tertiary)'}}>—</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(p)} title="Edit"><Pencil size={13}/></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(p)} title="Delete"><Trash2 size={13} color="var(--red)"/></button>
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
