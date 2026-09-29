import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Circle, Save, Info, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { ChecklistItem, ChecklistStatus } from '../../types';
import { SIH_CHECKLIST_LABELS } from '../../types';

export default function SIHChecklist() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [items, setItems] = useState<Record<string, ChecklistItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.checklist.get(projectId).then(res => {
      if (res.ok) setItems(res.data);
      setLoading(false);
    });
  }, [projectId]);

  function toggle(key: string) {
    setItems(prev => {
      const item = prev[key] || { project_id: projectId, item_key: key, status: 'pending', notes: '' };
      const nextStatus: ChecklistStatus = item.status === 'complete' ? 'pending' : 'complete';
      return {
        ...prev,
        [key]: { ...item, status: nextStatus }
      };
    });
  }

  function updateNotes(key: string, notes: string) {
    setItems(prev => ({
      ...prev,
      [key]: { ...prev[key], notes }
    }));
  }

  async function handleSave() {
    if (!projectId) return;
    setSaving(true);
    const payload: Record<string, { status: string; notes?: string }> = {};
    Object.keys(SIH_CHECKLIST_LABELS).forEach(k => {
      payload[k] = {
        status: items[k]?.status || 'pending',
        notes: items[k]?.notes || ''
      };
    });
    const res = await api.checklist.update(projectId, payload);
    setSaving(false);
    if (res.ok) {
      setItems(res.data);
      toast.success('Checklist updated');
    } else toast.error(res.error);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const total = Object.keys(SIH_CHECKLIST_LABELS).length;
  const completedCount = Object.values(items).filter(i => i.status === 'complete').length;
  const pct = Math.round((completedCount / total) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Readiness Checklist</h1>
          <p className="page-subtitle">Track project deliverables, site standards, and quality requirements</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Checklist</>}
        </button>
      </div>

      <div className="card" style={{ marginBottom:'var(--space-6)', padding:'var(--space-5) var(--space-6)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-3)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
            <ShieldCheck size={18} color="var(--blue)" />
            <span style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-md)' }}>Overall Readiness Score</span>
          </div>
          <span style={{ fontWeight:700, fontSize:'var(--text-lg)', color:'var(--blue)' }}>{pct}% ({completedCount}/{total})</span>
        </div>
        <div className="progress-bar" style={{ height:8 }}>
          <div className="progress-fill green" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Required Deliverables & Standards</span>
        </div>
        <div className="card-body-sm" style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
          {Object.entries(SIH_CHECKLIST_LABELS).map(([key, label]) => {
            const item = items[key] || { status: 'pending', notes: '' };
            const isDone = item.status === 'complete';
            return (
              <div
                key={key}
                style={{
                  display:'flex',
                  alignItems:'center',
                  gap:'var(--space-3)',
                  padding:'var(--space-3) var(--space-4)',
                  background: isDone ? 'var(--bg-subtle)' : 'var(--bg-panel)',
                  border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)'
                }}
              >
                <div
                  onClick={() => toggle(key)}
                  style={{ cursor:'pointer', display:'flex', alignItems:'center', flexShrink:0 }}
                >
                  {isDone ? <CheckCircle size={18} color="var(--green)" /> : <Circle size={18} color="var(--text-tertiary)" />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:'var(--weight-medium)', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {label}
                  </div>
                </div>
                <input
                  className="input"
                  style={{ maxWidth:260, fontSize:'var(--text-xs)', padding:'4px 8px' }}
                  placeholder="Notes / proof reference..."
                  value={item.notes || ''}
                  onChange={e => updateNotes(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
