import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FinalConcept as FC } from '../../types';

export default function FinalConcept() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [form, setForm] = useState<Partial<FC>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.final.get(projectId).then(res => { if (res.ok && res.data) setForm(res.data); setLoading(false); });
  }, [projectId]);

  function set(k: keyof FC, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.selected_proposal) { toast.error('Select a proposal first'); return; }
    setSaving(true);
    const res = await api.final.update(projectId!, form);
    setSaving(false);
    if (res.ok) { setForm(res.data || {}); toast.success('Final concept saved'); }
    else toast.error(res.error);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Final Concept & Strategy</h1>
          <p className="page-subtitle">Document the selected spatial strategy and design rationale</p>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> The final selection must be expert/team controlled. Base your decision on quantitative analysis evidence, site constraints, and planning priorities.
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Proposal selection */}
        <div className="card">
          <div className="card-header"><span className="card-title">Select Final Design Option</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
            {[
              { val:'A', label:'Design Option A', sub:'Transit-Oriented Compact Development', accent:'var(--blue)' },
              { val:'B', label:'Design Option B', sub:'Green-Blue Resilient Development', accent:'var(--green)' },
              { val:'hybrid', label:'Hybrid / Refined Concept', sub:'Elements from both design options combined', accent:'var(--purple)' },
            ].map(opt => {
              const selected = form.selected_proposal === opt.val;
              return (
                <div key={opt.val} onClick={() => set('selected_proposal', opt.val as any)}
                  style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4) var(--space-5)', border:`2px solid ${selected ? opt.accent : 'var(--border)'}`, borderRadius:'var(--radius-lg)', cursor:'pointer', background: selected ? `${opt.accent}0F` : 'transparent', transition:'border-color var(--transition-fast)' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${selected ? opt.accent : 'var(--border-strong)'}`, background: selected ? opt.accent : 'transparent', flexShrink:0 }}/>
                  <div>
                    <div style={{ fontWeight:'var(--weight-semibold)', color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</div>
                    <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{opt.sub}</div>
                  </div>
                  {selected && <span className="badge badge-green" style={{ marginLeft:'auto' }}>Selected</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rationale */}
        <div className="card">
          <div className="card-header"><span className="card-title">Decision Rationale</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Rationale *</label>
              <textarea className="textarea" rows={5} value={form.rationale||''} onChange={e=>set('rationale',e.target.value)} placeholder="Explain why this proposal was selected. Reference specific Forma analysis findings as evidence for your decision…"/>
            </div>
            <div className="form-group">
              <label className="form-label">Key Evidence</label>
              <textarea className="textarea" rows={3} value={form.key_evidence||''} onChange={e=>set('key_evidence',e.target.value)} placeholder="List the key analysis results or findings that most strongly supported this decision…"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Trade-offs Accepted</label>
                <textarea className="textarea" rows={3} value={form.tradeoffs||''} onChange={e=>set('tradeoffs',e.target.value)} placeholder="What trade-offs does the selected proposal involve?"/>
              </div>
              <div className="form-group">
                <label className="form-label">Planning Priorities</label>
                <textarea className="textarea" rows={3} value={form.planning_priorities||''} onChange={e=>set('planning_priorities',e.target.value)} placeholder="What planning priorities guided this decision? e.g. sustainability over density"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="textarea" rows={2} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Additional notes on the final concept…"/>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Final Concept</>}
          </button>
        </div>
      </form>
    </div>
  );
}
