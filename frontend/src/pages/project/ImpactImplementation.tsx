import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Info, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FinalConcept } from '../../types';

export default function ImpactImplementation() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [concept, setConcept] = useState<Partial<FinalConcept>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.final.get(projectId).then(res => {
      if (res.ok && res.data) setConcept(res.data);
      setLoading(false);
    });
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await api.final.update(projectId!, concept);
    setSaving(false);
    if (res.ok) {
      setConcept(res.data || {});
      toast.success('Impact & Implementation details saved');
    } else toast.error(res.error);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Impact & Implementation</h1>
          <p className="page-subtitle">Document long-term sustainability, feasibility, and phased rollout strategy</p>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={15} style={{flexShrink:0}}/> Ensure all projected metrics are backed by defensible logic or verified references.
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Phased Strategy */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Phased Implementation Strategy</span>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Phase 1: Immediate & Infrastructure (Years 0–2)</label>
              <textarea
                className="textarea"
                rows={3}
                value={concept.notes || ''}
                onChange={e => setConcept(c => ({ ...c, notes: e.target.value }))}
                placeholder="Key site preparation, utility networks, foundational mobility hubs..."
              />
            </div>
          </div>
        </div>

        {/* Environmental & Social Impact */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Environmental & Social Impact Assessment</span>
          </div>
          <div className="card-body" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Environmental Benefits</label>
              <textarea
                className="textarea"
                rows={4}
                value={concept.key_evidence || ''}
                onChange={e => setConcept(c => ({ ...c, key_evidence: e.target.value }))}
                placeholder="Carbon reduction, green coverage %, stormwater management targets..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Social & Economic Feasibility</label>
              <textarea
                className="textarea"
                rows={4}
                value={concept.planning_priorities || ''}
                onChange={e => setConcept(c => ({ ...c, planning_priorities: e.target.value }))}
                placeholder="Community accessibility, job creation, affordable housing integration..."
              />
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Details</>}
          </button>
        </div>
      </form>
    </div>
  );
}
