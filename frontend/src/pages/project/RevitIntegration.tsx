import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Save, Upload, CheckSquare, Square, ShieldCheck,
  Cpu, ArrowRight, CheckCircle2
} from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { RevitWorkflow } from '../../types';

export default function RevitIntegration() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [revit, setRevit] = useState<Partial<RevitWorkflow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    api.revit.get(projectId).then((res) => {
      if (res.ok) setRevit(res.data);
      setLoading(false);
    });
  }, [projectId]);

  function set(key: keyof RevitWorkflow, value: unknown) {
    setRevit((r) => ({ ...r, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true);
    const res = await api.revit.update(projectId, revit);
    setSaving(false);
    if (res.ok) {
      setRevit(res.data);
      toast.success('Building workflow record saved');
    } else {
      toast.error(res.error || 'Failed to save');
    }
  }

  async function handleUpload(field: keyof RevitWorkflow, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(field as string);
    const res = await uploadFile(file);
    setUploading(null);
    if (res.ok) {
      set(field, res.url);
      const uRes = await api.revit.update(projectId, { ...revit, [field]: res.url });
      if (uRes.ok) setRevit(uRes.data);
      toast.success('Artifact uploaded');
    } else {
      toast.error(res.error || 'Upload failed');
    }
    e.target.value = '';
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const evidenceSlots: { field: keyof RevitWorkflow; label: string; desc: string }[] = [
    { field: 'before_image', label: 'Forma Massing Envelope', desc: 'Initial massing in Autodesk Forma before Revit detailing' },
    { field: 'after_image', label: 'Forma Post-Sync Model', desc: 'Forma site model updated after Revit synchronization' },
    { field: 'floor_plan_image', label: 'Architectural Floor Plan', desc: 'Revit floor plan showing spatial layout and circulation' },
    { field: 'model_3d_image', label: 'Detailed 3D Model', desc: 'Revit perspective view with structural elements' },
    { field: 'facade_image', label: 'Building Facade / Elevation', desc: 'Detailed fenestration, shading louvers, and materials' },
  ];

  const workflowSteps = [
    { num: '01', title: 'Forma Building Mass', desc: 'Envelope defined in site context' },
    { num: '02', title: 'Export / Revit', desc: 'Geometry exported to Revit environment' },
    { num: '03', title: 'Detailed Building', desc: 'Floors, columns, walls, and envelope' },
    { num: '04', title: 'Sync / Update', desc: 'Sync back to Forma for analysis rerun' },
    { num: '05', title: 'Evidence Record', desc: 'Verification artifacts documented' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Building / Revit Integration</h1>
          <p className="page-subtitle">
            Track detailed architectural building integration between Autodesk Forma and Revit
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : <><Save size={14} /> Save Building Data</>}
        </button>
      </div>

      {/* Honest boundary notice */}
      <div className="info-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Architectural Integration Workflow:</strong> Autodesk Forma massing is exported to Autodesk Revit for architectural detailing, then synchronized back to re-evaluate microclimate and daylighting. Document real stage transitions and verified screenshots below.
        </span>
      </div>

      {/* ── Workflow Diagram ── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-4)', position: 'relative' }}>
          {workflowSteps.map((ws, i) => (
            <div key={ws.num} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>
                <span>{ws.num}</span>
                {i < 4 && <ArrowRight size={12} style={{ color: 'var(--border-strong)', marginLeft: 'auto' }} />}
              </div>
              <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                {ws.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {ws.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Building Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Focal Building Specifications</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Building Name</label>
                <input
                  className="input"
                  value={revit.building_name || ''}
                  onChange={(e) => set('building_name', e.target.value)}
                  placeholder="e.g. Innovation Hub & Commercial Tower"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role in Masterplan</label>
                <input
                  className="input"
                  value={revit.building_role || ''}
                  onChange={(e) => set('building_role', e.target.value)}
                  placeholder="e.g. Transit anchor mixed-use office & civic hub"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Forma Model Reference</label>
                <input
                  className="input text-mono"
                  value={revit.forma_ref || ''}
                  onChange={(e) => set('forma_ref', e.target.value)}
                  placeholder="e.g. FORMA-BLD-01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Revit Model Reference</label>
                <input
                  className="input text-mono"
                  value={revit.revit_ref || ''}
                  onChange={(e) => set('revit_ref', e.target.value)}
                  placeholder="e.g. RVT-ARCH-2026-V2"
                />
              </div>
            </div>

            {/* Statuses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <div className="form-group">
                <label className="form-label">Forma → Revit Export Status</label>
                <select
                  className="select"
                  value={revit.export_status || 'pending'}
                  onChange={(e) => set('export_status', e.target.value)}
                >
                  <option value="pending">Not Started / Pending</option>
                  <option value="in_progress">Exported to Revit</option>
                  <option value="complete">Verified in Revit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Revit → Forma Sync Status</label>
                <select
                  className="select"
                  value={revit.sync_status || 'pending'}
                  onChange={(e) => set('sync_status', e.target.value)}
                >
                  <option value="pending">Not Started / Pending</option>
                  <option value="in_progress">Sync in Progress</option>
                  <option value="complete">Synced &amp; Analysis Re-run</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(revit.detailing_done)}
                  onChange={(e) => set('detailing_done', e.target.checked ? 1 : 0)}
                />
                <span>Architectural Detailing Completed in Revit</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(revit.analysis_rerun)}
                  onChange={(e) => set('analysis_rerun', e.target.checked ? 1 : 0)}
                />
                <span>Forma Environmental Analyses Re-run Post-Sync</span>
              </label>
            </div>
          </div>
        </div>

        {/* Verification Artifacts */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Evidence & Verification Artifacts</span>
              <p className="card-subtitle">Document each transition with authentic model exports</p>
            </div>
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {evidenceSlots.map((slot) => {
                const currentImg = revit[slot.field] as string | undefined;
                const isUploadingThis = uploading === slot.field;

                return (
                  <div
                    key={slot.field}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                        {slot.label}
                      </span>
                      {currentImg && <CheckCircle2 size={13} color="var(--green)" />}
                    </div>

                    <div style={{ height: 160, background: '#0B0D10', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {currentImg ? (
                        <img src={currentImg} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: 'var(--space-4)' }}>
                          <Cpu size={24} style={{ opacity: 0.4, margin: '0 auto var(--space-2)' }} />
                          <div>{slot.desc}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
                      <label className="btn btn-secondary btn-sm" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(slot.field, e)}
                          style={{ display: 'none' }}
                          disabled={isUploadingThis}
                        />
                        {isUploadingThis ? 'Uploading…' : currentImg ? 'Replace Artifact' : 'Upload Evidence'}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving…' : <><Save size={14} /> Save Building Data</>}
          </button>
        </div>
      </form>
    </div>
  );
}
