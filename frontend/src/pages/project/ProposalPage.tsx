import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Layers, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Proposal, ProposalMetric } from '../../types';

interface Props {
  label: '1' | '2' | 'A' | 'B';
}

export default function ProposalPage({ label: defaultLabel }: Props) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeOpt, setActiveOpt] = useState<'1' | '2'>(
    defaultLabel === '2' || defaultLabel === 'B' ? '2' : '1'
  );
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [form, setForm] = useState<Partial<Proposal>>({});
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    api.proposals.byLabel(projectId, activeOpt).then((res) => {
      if (res.ok) {
        setProposal(res.data);
        setForm(res.data);
        setImages(Array.isArray(res.data.images) ? res.data.images : []);
      }
      setLoading(false);
    });
  }, [projectId, activeOpt]);

  function field(key: keyof Proposal, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!proposal || !projectId) return;
    setSaving(true);

    const res = await api.proposals.update(projectId, proposal.id, {
      ...form,
      images,
    });
    setSaving(false);
    if (res.ok) {
      setProposal(res.data);
      toast.success(`Design Option ${activeOpt} saved`);
    } else {
      toast.error(res.error || 'Failed to save option');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !proposal || !projectId) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      const newImages = [...images, res.url];
      setImages(newImages);
      await api.proposals.update(projectId, proposal.id, { images: newImages });
      toast.success('Visual artifact uploaded');
    } else {
      toast.error(res.error || 'Upload failed');
    }
    e.target.value = '';
  }

  const optionColor = activeOpt === '1' ? 'var(--blue)' : 'var(--green)';

  return (
    <div>
      {/* ── Top Header with Option Switcher ── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span className="badge badge-muted">Site Planning Typology</span>
            <span
              className="badge"
              style={{
                background: form.status === 'complete' ? 'rgba(69, 197, 138, 0.15)' : 'rgba(79, 124, 255, 0.15)',
                color: form.status === 'complete' ? '#6EE7B7' : '#93C5FD',
              }}
            >
              {form.status === 'complete' ? 'Completed' : 'Draft Option'}
            </span>
          </div>
          <h1 className="page-title">Design Option {activeOpt}</h1>
          <p className="page-subtitle">
            {form.name || `Design Option ${activeOpt}`} — Formulate massing, spatial layout, and circulation strategy
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {/* Switcher Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 3 }}>
            <button
              type="button"
              className={`btn btn-sm ${activeOpt === '1' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveOpt('1')}
            >
              Option 1
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeOpt === '2' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveOpt('2')}
            >
              Option 2
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/projects/${projectId}/comparison`)}
          >
            Compare Options <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* ── 1. Option Identity & Concept ── */}
          <div className="card">
            <div className="card-header" style={{ borderLeft: `4px solid ${optionColor}` }}>
              <div>
                <span className="card-title">Concept & Strategy</span>
                <p className="card-subtitle">Strategic planning intent and core urban proposition</p>
              </div>

              <select
                className="select"
                style={{ width: 'auto', padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                value={form.status || 'draft'}
                onChange={(e) => field('status', e.target.value)}
              >
                <option value="draft">Status: Draft</option>
                <option value="complete">Status: Completed</option>
              </select>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Option Name</label>
                  <input
                    className="input"
                    value={form.name || ''}
                    onChange={(e) => field('name', e.target.value)}
                    placeholder={activeOpt === '1' ? 'e.g. Transit-Oriented Compact District' : 'e.g. Green-Blue Resilient Urban Grid'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Concept Statement</label>
                  <input
                    className="input"
                    value={form.concept || ''}
                    onChange={(e) => field('concept', e.target.value)}
                    placeholder={activeOpt === '1' ? 'High-density mixed-use clustered around transit nodes' : 'Moderate density organized around ecological corridors'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Planning Narrative</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => field('description', e.target.value)}
                  placeholder="Detail the spatial hierarchy, target population, and urban structure…"
                />
              </div>
            </div>
          </div>

          {/* ── 2. Design Decisions ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Design Decisions & Spatial Parameters</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Planning Strategy & Land Use</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={form.planning_strategy || ''}
                  onChange={(e) => field('planning_strategy', e.target.value)}
                  placeholder="Zoning distribution, mixed-use ratios, and public-to-private land allocation…"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Building Massing & Typologies</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={form.buildings || ''}
                    onChange={(e) => field('buildings', e.target.value)}
                    placeholder="Height profiles (e.g. G+15 towers, G+6 mid-rise), podiums, and envelope setbacks…"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Open Space & Landscaping</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={form.landscaping || ''}
                    onChange={(e) => field('landscaping', e.target.value)}
                    placeholder="Park networks, green buffers, rain gardens, and permeable surfaces…"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Transportation & Mobility Network</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={form.transportation || ''}
                    onChange={(e) => field('transportation', e.target.value)}
                    placeholder="Transit corridors, street hierarchy, pedestrian paths, and bike networks…"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Density & FSI / FAR Decisions</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={form.density || ''}
                    onChange={(e) => field('density', e.target.value)}
                    placeholder="Floor Space Index (FSI), ground coverage %, and unit densities…"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Trade-offs & Evaluation ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Comparative Merits & Trade-offs</span>
            </div>

            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--green)' }}>Advantages & Strengths</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.advantages || ''}
                    onChange={(e) => field('advantages', e.target.value)}
                    placeholder="Key benefits: transit access, spatial efficiency, economic viability…"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--amber)' }}>Trade-offs & Constraints</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={form.tradeoffs || ''}
                    onChange={(e) => field('tradeoffs', e.target.value)}
                    placeholder="Compromises made: embodied carbon, shading, green footprint…"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Visual Artifacts & Upload ── */}
          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">Visual Artifacts & Diagrams</span>
                <p className="card-subtitle">Upload architectural site diagrams or massing snapshots</p>
              </div>
            </div>

            <div className="card-body">
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        height: 120,
                        background: '#0E1217',
                      }}
                    >
                      <img src={img} alt={`Option ${activeOpt} visual ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              <label className="upload-area" style={{ display: 'block' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <Upload size={24} style={{ color: 'var(--blue)', margin: '0 auto var(--space-2)' }} />
                <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                  {uploading ? 'Uploading visual artifact…' : `Upload Diagram for Design Option ${activeOpt}`}
                </div>
                <div className="upload-area-text">PNG, JPG, or SVG up to 32MB</div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving…' : <><Save size={15} /> Save Design Option {activeOpt}</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
