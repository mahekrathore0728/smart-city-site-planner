import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Users } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { TeamMember } from '../../types';

const empty = (): Partial<TeamMember> => ({ name:'', role:'', module:'', responsibilities:'', evidence:'' });

export default function Team() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.team.list(projectId).then(res => { if (res.ok) setTeam(res.data); setLoading(false); });
  }, [projectId]);

  function startAdd() { setForm(empty()); setEditId(null); setShowForm(true); }
  function startEdit(m: TeamMember) { setForm({ ...m }); setEditId(m.id); setShowForm(true); }
  function cancel() { setShowForm(false); setEditId(null); setForm(empty()); }

  async function handleSave() {
    if (!projectId || !form.name?.trim()) { toast.error('Member name is required'); return; }
    setSaving(true);
    if (editId) {
      const res = await api.team.update(projectId, editId, form);
      setSaving(false);
      if (res.ok) { setTeam(t => t.map(x => x.id === editId ? res.data : x)); toast.success('Member updated'); cancel(); }
      else toast.error(res.error);
    } else {
      const res = await api.team.create(projectId, form);
      setSaving(false);
      if (res.ok) { setTeam(t => [...t, res.data]); toast.success('Team member added'); cancel(); }
      else toast.error(res.error);
    }
  }

  async function handleDelete(m: TeamMember) {
    if (!window.confirm(`Remove ${m.name}?`)) return;
    const res = await api.team.delete(projectId!, m.id);
    if (res.ok) { setTeam(prev => prev.filter(x => x.id !== m.id)); toast.success('Removed'); }
    else toast.error(res.error);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Composition & Contribution</h1>
          <p className="page-subtitle">Track team member roles, modules, and verified work contributions</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd}><Plus size={15}/> Add Team Member</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:'var(--space-6)', borderColor:'var(--blue)', borderWidth:2 }}>
          <div className="card-header">
            <span className="card-title">{editId ? 'Edit Team Member' : 'Add Team Member'}</span>
            <button className="btn btn-ghost btn-icon" onClick={cancel}><X size={16}/></button>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Rahul Sharma"/>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="input" value={form.role||''} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Lead Urban Planner / GIS Analyst"/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Module / Task</label>
                <input className="input" value={form.module||''} onChange={e=>setForm(f=>({...f,module:e.target.value}))} placeholder="e.g. Forma Wind & Solar Analyses"/>
              </div>
              <div className="form-group">
                <label className="form-label">Evidence / Artefact Link</label>
                <input className="input" value={form.evidence||''} onChange={e=>setForm(f=>({...f,evidence:e.target.value}))} placeholder="Link to commits, documentation, or design files"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Responsibilities & Contribution</label>
              <textarea className="textarea" rows={2} value={form.responsibilities||''} onChange={e=>setForm(f=>({...f,responsibilities:e.target.value}))} placeholder="Detailed summary of work done by this member..."/>
            </div>
          </div>
          <div className="card-footer" style={{ display:'flex', justifyContent:'flex-end', gap:'var(--space-3)' }}>
            <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{width:12,height:12,borderWidth:2}}/> Saving…</> : <><Save size={13}/> {editId?'Update':'Add Member'}</>}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-overlay"><div className="spinner"/></div>}

      {!loading && team.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <Users size={36} className="empty-state-icon"/>
            <div className="empty-state-title">No team members added</div>
            <p className="empty-state-desc">Add team members and detail their roles, module assignments, and contributions for SIH evaluation.</p>
            <button className="btn btn-primary mt-4" onClick={startAdd}><Plus size={14}/> Add First Member</button>
          </div>
        </div>
      )}

      {!loading && team.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role & Module</th>
                <th>Responsibilities</th>
                <th>Evidence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight:'var(--weight-semibold)' }}>{m.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize:'var(--text-sm)', color:'var(--text-primary)' }}>{m.role || '—'}</div>
                    {m.module && <span className="tag mt-1">{m.module}</span>}
                  </td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', maxWidth:260 }}>{m.responsibilities || '—'}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{m.evidence || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:'var(--space-1)' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(m)}><Pencil size={13}/></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(m)}><Trash2 size={13} color="var(--red)"/></button>
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
