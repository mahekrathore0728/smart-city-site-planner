import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Save, Upload, AlertTriangle, ShieldCheck,
  CheckCircle2, FileBarChart2, Compass
} from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Analysis, Proposal, AnalysisType, AnalysisStatus, AnalysisProvenance } from '../../types';
import { ANALYSIS_LABELS, ANALYSIS_STATUS_LABELS, PROVENANCE_LABELS } from '../../types';

const ANALYSIS_TYPES: AnalysisType[] = [
  'area_metrics',
  'embodied_carbon',
  'sun_hours',
  'daylight',
  'wind',
  'microclimate',
  'noise',
  'solar_energy',
];

const ANALYSIS_DESCRIPTIONS: Record<AnalysisType, string> = {
  area_metrics: 'Gross floor area (GFA), site coverage %, building footprint, and floor space index.',
  embodied_carbon: 'Upfront carbon footprint of building envelopes, structural materials, and construction.',
  sun_hours: 'Direct solar radiation duration on ground public realm and building facades.',
  daylight: 'Daylight autonomy and vertical sky component (VSC) for interior occupiable spaces.',
  wind: 'Wind comfort and aerodynamic safety analysis based on local meteorological wind rose data.',
  microclimate: 'Combined thermal comfort index (UTCI) factoring in radiation, shade, and wind flow.',
  noise: 'Acoustic noise propagation from surrounding traffic arteries and municipal infrastructure.',
  solar_energy: 'Photovoltaic generation potential on available rooftops and vertical facades.',
};

export default function Analyses() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [activeTab, setActiveTab] = useState<AnalysisType>('area_metrics');
  const [activeOpt, setActiveOpt] = useState<'1' | '2'>('1');
  const [form, setForm] = useState<Partial<Analysis>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.proposals.list(projectId),
      api.analyses.list(projectId),
    ]).then(([pr, ar]) => {
      if (pr.ok) setProposals(pr.data);
      if (ar.ok) {
        const map: Record<string, Analysis> = {};
        ar.data.forEach((a) => {
          map[`${a.proposal_id}:${a.analysis_type}`] = a;
        });
        setAnalyses(map);
      }
      setLoading(false);
    });
  }, [projectId]);

  // Find active proposal by matching '1'/'A' or '2'/'B'
  const currentProp = proposals.find(
    (p) => (activeOpt === '1' && (p.label === '1' || p.label === 'A')) ||
           (activeOpt === '2' && (p.label === '2' || p.label === 'B'))
  );
  const key = currentProp ? `${currentProp.id}:${activeTab}` : '';
  const currentAnalysis = analyses[key];

  useEffect(() => {
    if (currentAnalysis) setForm({ ...currentAnalysis });
    else setForm({});
  }, [key, currentAnalysis]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentAnalysis || !projectId) return;
    setSaving(true);
    const res = await api.analyses.update(projectId, currentAnalysis.id, form);
    setSaving(false);
    if (res.ok) {
      setAnalyses((a) => ({ ...a, [key]: res.data }));
      toast.success('Analysis findings recorded');
    } else {
      toast.error(res.error || 'Failed to save analysis');
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentAnalysis || !projectId) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      const updated = {
        ...form,
        evidence_image_path: res.url,
        status: (form.status === 'not_started' || form.status === 'evidence_required')
          ? ('uploaded' as AnalysisStatus)
          : form.status,
      };
      setForm(updated);
      const uRes = await api.analyses.update(projectId, currentAnalysis.id, updated);
      if (uRes.ok) {
        setAnalyses((a) => ({ ...a, [key]: uRes.data }));
        toast.success('Verified evidence uploaded');
      }
    } else {
      toast.error(res.error || 'Upload failed');
    }
    e.target.value = '';
  }

  function getAnalysisForType(type: AnalysisType, propId: string) {
    return analyses[`${propId}:${type}`];
  }

  const statusColors: Record<AnalysisStatus, { bg: string; text: string }> = {
    not_started: { bg: 'var(--bg-surface-elevated)', text: 'var(--text-tertiary)' },
    evidence_required: { bg: 'rgba(230, 162, 60, 0.15)', text: '#FCD34D' },
    uploaded: { bg: 'rgba(79, 124, 255, 0.15)', text: '#93C5FD' },
    actual_forma_result: { bg: 'rgba(69, 197, 138, 0.15)', text: '#6EE7B7' },
    user_entered: { bg: 'rgba(139, 92, 246, 0.15)', text: '#C4B5FD' },
    documented_assumption: { bg: 'rgba(230, 162, 60, 0.15)', text: '#FCD34D' },
    reference: { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)' },
    source_data: { bg: 'rgba(20, 184, 166, 0.15)', text: '#5EEAD4' },
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Analysis</h1>
          <p className="page-subtitle">
            Document authentic Autodesk Forma computational analyses, findings, and design responses
          </p>
        </div>
      </div>

      {/* ── Integrity Notice ── */}
      <div className="info-banner info" style={{ marginBottom: 'var(--space-6)' }}>
        <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>Data Provenance Notice:</strong> Analyses in this studio represent verified outputs from Autodesk Forma.
          No results or environmental numbers are fabricated. When data is pending, keep status as <em>Evidence Required</em>.
        </span>
      </div>

      {/* ── Option Switcher Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {(['1', '2'] as const).map((opt) => {
          const prop = proposals.find(
            (p) => (opt === '1' && (p.label === '1' || p.label === 'A')) ||
                   (opt === '2' && (p.label === '2' || p.label === 'B'))
          );
          const verifiedCount = ANALYSIS_TYPES.filter((t) => {
            const a = prop ? getAnalysisForType(t, prop.id) : null;
            return a && a.status !== 'not_started';
          }).length;

          const isActive = activeOpt === opt;
          return (
            <div
              key={opt}
              className="card"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderColor: isActive ? (opt === '1' ? 'var(--blue)' : 'var(--green)') : 'var(--border)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              }}
              onClick={() => setActiveOpt(opt)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: opt === '1' ? 'var(--blue)' : 'var(--green)',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-md)',
                }}>
                  {opt}
                </div>
                <div>
                  <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-md)' }}>
                    {prop?.name || `Design Option ${opt}`}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {verifiedCount}/8 analyses recorded with evidence
                  </div>
                </div>
              </div>

              {isActive && (
                <span className="badge badge-blue">Active Target</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main Analysis Split View ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Analysis Types List */}
        <div className="card" style={{ padding: 'var(--space-2)' }}>
          {ANALYSIS_TYPES.map((type) => {
            const prop = currentProp;
            const an = prop ? getAnalysisForType(type, prop.id) : null;
            const status: AnalysisStatus = an?.status || 'not_started';
            const isActive = activeTab === type;
            const sStyle = statusColors[status] || statusColors.not_started;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveTab(type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px var(--space-3)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-strong)' : 'transparent'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 2,
                }}
              >
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {ANALYSIS_LABELS[type]}
                </span>

                <span
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: sStyle.bg,
                    color: sStyle.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 600,
                  }}
                >
                  {status === 'not_started' ? 'Pending' : (status === 'actual_forma_result' ? 'Verified' : 'Recorded')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Analysis Detail Form */}
        {currentAnalysis && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="card-title">{ANALYSIS_LABELS[activeTab]}</span>
                    <span className="badge badge-muted">Option {activeOpt}</span>
                  </div>
                  <p className="card-subtitle">{ANALYSIS_DESCRIPTIONS[activeTab]}</p>
                </div>

                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: statusColors[currentAnalysis.status]?.bg || 'var(--bg-surface-elevated)',
                    color: statusColors[currentAnalysis.status]?.text || 'var(--text-primary)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {ANALYSIS_STATUS_LABELS[currentAnalysis.status] || currentAnalysis.status}
                </div>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* Status + Provenance */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Analysis Status</label>
                    <select
                      className="select"
                      value={form.status || 'not_started'}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AnalysisStatus }))}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="evidence_required">Evidence Required</option>
                      <option value="uploaded">Evidence Uploaded</option>
                      <option value="actual_forma_result">Actual Forma Result</option>
                      <option value="user_entered">User Entered Result</option>
                      <option value="documented_assumption">Documented Assumption</option>
                      <option value="reference">Reference</option>
                      <option value="source_data">Source Data</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Source / Provenance</label>
                    <select
                      className="select"
                      value={form.provenance || 'forma'}
                      onChange={(e) => setForm((f) => ({ ...f, provenance: e.target.value as AnalysisProvenance }))}
                    >
                      <option value="forma">Autodesk Forma Analysis Engine</option>
                      <option value="user">User Measured / Field Survey</option>
                      <option value="assumption">Documented Planning Assumption</option>
                      <option value="reference">External Reference Dataset</option>
                      <option value="source_data">Municipal / GIS Source Data</option>
                    </select>
                  </div>
                </div>

                {/* Result Value and Unit */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Quantified Result Value</label>
                    <input
                      className="input"
                      value={form.result_value || ''}
                      onChange={(e) => setForm((f) => ({ ...f, result_value: e.target.value }))}
                      placeholder="e.g. 6.4 (Leave blank if awaiting actual Forma run)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <input
                      className="input"
                      value={form.result_unit || ''}
                      onChange={(e) => setForm((f) => ({ ...f, result_unit: e.target.value }))}
                      placeholder="hrs, kWh/m², m/s, dB, kgCO2e/m²…"
                    />
                  </div>
                </div>

                {/* Finding */}
                <div className="form-group">
                  <label className="form-label">Analysis Finding</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.finding || ''}
                    onChange={(e) => setForm((f) => ({ ...f, finding: e.target.value }))}
                    placeholder="Document observable patterns, comfort thresholds, or critical exposure areas identified in the Forma run…"
                  />
                </div>

                {/* Design Response */}
                <div className="form-group">
                  <label className="form-label">Design Response</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.design_response || ''}
                    onChange={(e) => setForm((f) => ({ ...f, design_response: e.target.value }))}
                    placeholder="Describe specific architectural or urban interventions implemented in response (e.g. canopy orientation, building rotation, acoustic setbacks)…"
                  />
                </div>

                {/* Evidence Screenshot */}
                <div className="form-group">
                  <label className="form-label">Verifiable Evidence (Forma Screenshot)</label>
                  {form.evidence_image_path ? (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: '#0C1015' }}>
                      <img
                        src={form.evidence_image_path}
                        alt="Forma analysis evidence"
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                      />
                      <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)' }}>✓ Evidence on file</span>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                          Replace Screenshot
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-area" style={{ display: 'block' }}>
                      <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                      <Upload size={22} style={{ color: 'var(--blue)', margin: '0 auto var(--space-2)' }} />
                      <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                        {uploading ? 'Uploading screenshot…' : `Upload ${ANALYSIS_LABELS[activeTab]} Evidence`}
                      </div>
                      <div className="upload-area-text">Upload direct screenshot from Autodesk Forma to verify result</div>
                    </label>
                  )}
                </div>

                {/* Save button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : <><Save size={14} /> Save Analysis Record</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
