import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FinalConcept as FC, Proposal } from '../../types';

export default function FinalConcept() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [form, setForm] = useState<Partial<FC>>({});
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.final.get(projectId),
      api.proposals.list(projectId),
    ]).then(([fRes, pRes]) => {
      if (fRes.ok && fRes.data) setForm(fRes.data);
      if (pRes.ok) setProposals(pRes.data);
      setLoading(false);
    });
  }, [projectId]);

  function set(k: keyof FC, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.selected_proposal) {
      toast.error('Please select Option 1, Option 2, or Hybrid first');
      return;
    }
    setSaving(true);
    const res = await api.final.update(projectId!, form);
    setSaving(false);
    if (res.ok) {
      setForm(res.data || {});
      toast.success('Final concept decision saved');
    } else {
      toast.error(res.error || 'Failed to save final concept');
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const opt1 = proposals.find((p) => p.label === '1' || p.label === 'A');
  const opt2 = proposals.find((p) => p.label === '2' || p.label === 'B');

  const selectionOptions = [
    {
      val: '1',
      title: opt1?.name || 'Design Option 1',
      desc: opt1?.concept || 'Transit-oriented, high spatial density typology',
      accent: 'var(--blue)',
    },
    {
      val: '2',
      title: opt2?.name || 'Design Option 2',
      desc: opt2?.concept || 'Ecological corridor, moderate density resilient typology',
      accent: 'var(--green)',
    },
    {
      val: 'hybrid',
      title: 'Hybrid Synthesis Concept',
      desc: 'Selective integration of optimal elements from Option 1 and Option 2',
      accent: 'var(--purple)',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Final Concept</h1>
          <p className="page-subtitle">
            Document final site design selection, analytical defense, and planning decisions
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : <><Save size={14} /> Save Final Decision</>}
        </button>
      </div>

      <div className="info-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Defensible Planning Decision:</strong> Base the final concept on verified Autodesk Forma evidence, spatial trade-offs, and site objectives. Document key planning commitments and architectural integration below.
        </span>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* ── 1. Final Design Option Selection ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Select Final Design Direction</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {selectionOptions.map((opt) => {
              const isSelected = form.selected_proposal === opt.val;
              return (
                <div
                  key={opt.val}
                  onClick={() => set('selected_proposal', opt.val as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-5)',
                    border: `1px solid ${isSelected ? opt.accent : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-secondary)',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? opt.accent : 'var(--border-strong)'}`,
                      background: isSelected ? opt.accent : 'transparent',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 'var(--weight-semibold)', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {opt.desc}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                      Selected Concept
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. Decision Rationale & Evidence ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Decision Rationale & Analytical Evidence</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">
                Decision Rationale <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                className="textarea"
                rows={4}
                value={form.rationale || ''}
                onChange={(e) => set('rationale', e.target.value)}
                placeholder="State clearly why this concept was selected over the alternative. Reference specific Forma environmental findings (solar exposure, wind comfort, microclimate) as evidence…"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Key Analysis Evidence Citations</label>
              <textarea
                className="textarea"
                rows={3}
                value={form.key_evidence || ''}
                onChange={(e) => set('key_evidence', e.target.value)}
                placeholder="Cite specific quantitative Forma results (e.g. 'Option 1 provides 2.4 hours more daylight on northern residential courts while maintaining safe wind comfort criteria')…"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Acknowledged Trade-offs</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={form.tradeoffs || ''}
                  onChange={(e) => set('tradeoffs', e.target.value)}
                  placeholder="Document accepted compromises (e.g. higher structural embodied carbon or reduced ground-floor commercial area)…"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Strategic Planning Priorities</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={form.planning_priorities || ''}
                  onChange={(e) => set('planning_priorities', e.target.value)}
                  placeholder="Key implementation guidelines: transit-first corridors, green canopy buffers, phasing priority…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Final Building Integration Notes ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Building & Architectural Integration</span>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Architectural Detailing Guidelines</label>
              <textarea
                className="textarea"
                rows={3}
                value={form.notes || ''}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Describe how the detailed Revit office/focal building model integrates with the final site concept…"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : <><Save size={14} /> Commit Final Concept</>}
          </button>
        </div>
      </form>
    </div>
  );
}
