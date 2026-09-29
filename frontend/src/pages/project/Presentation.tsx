import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Presentation as PresIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { PresentationSlide } from '../../types';

const SLIDE_TEMPLATES = [
  { index: 1, title: 'Title + Site Context & Challenges', desc: 'Site location, 1.0 km² boundary polygon, demographic context, and local planning challenges.' },
  { index: 2, title: 'Planning Objectives & Benchmarks', desc: 'Quantitative targets, zoning requirements, and baseline environmental benchmarks.' },
  { index: 3, title: 'Design Option 1 vs Design Option 2', desc: 'Side-by-side conceptual diagrams, massing typologies, and circulation hierarchies.' },
  { index: 4, title: 'Environmental Analysis & Evidence', desc: 'Autodesk Forma analytical findings across solar radiation, daylight, wind, and microclimate.' },
  { index: 5, title: 'Final Concept Selection & Rationale', desc: 'Synthesis defense, trade-off rationale, and selected spatial masterplan.' },
  { index: 6, title: 'Revit Detailing & Building Integration', desc: 'Focal building massing export, Revit detailing, and synchronized microclimate verification.' },
  { index: 7, title: 'Strategic Implementation & Phasing', desc: 'Phasing roadmap, infrastructure investments, and post-occupancy monitoring.' },
];

export default function Presentation() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [forms, setForms] = useState<Record<string, Partial<PresentationSlide>>>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.presentation.list(projectId).then((res) => {
      if (res.ok) {
        setSlides(res.data);
        const f: Record<string, Partial<PresentationSlide>> = {};
        res.data.forEach((s) => {
          f[s.id] = { ...s };
        });
        setForms(f);
      }
      setLoading(false);
    });
  }, [projectId]);

  function updateForm(key: keyof PresentationSlide, val: unknown) {
    const cur = slides[activeSlide];
    if (!cur) return;
    setForms((f) => ({
      ...f,
      [cur.id]: {
        ...f[cur.id],
        [key]: val,
      },
    }));
  }

  async function handleSave() {
    const cur = slides[activeSlide];
    if (!cur || !projectId) return;
    setSaving(true);
    const data = forms[cur.id] || {};
    const res = await api.presentation.updateSlide(projectId, cur.id, {
      ...data,
      status: data.content_notes ? 'complete' : 'draft',
    });
    setSaving(false);
    if (res.ok) {
      setSlides((s) => s.map((x) => (x.id === cur.id ? res.data : x)));
      toast.success('Slide content saved');
    } else {
      toast.error(res.error || 'Failed to save slide');
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const cur = slides[activeSlide];
    const file = e.target.files?.[0];
    if (!file || !cur || !projectId) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      const existing = Array.isArray(forms[cur.id]?.image_paths)
        ? (forms[cur.id].image_paths as string[])
        : [];
      const newPaths = [...existing, res.url];
      updateForm('image_paths', newPaths);
      await api.presentation.updateSlide(projectId, cur.id, { image_paths: newPaths });
      setSlides((s) =>
        s.map((x) => (x.id === cur.id ? { ...x, image_paths: newPaths } : x))
      );
      toast.success('Slide graphic uploaded');
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

  const cur = slides[activeSlide];
  const template = SLIDE_TEMPLATES[activeSlide] || SLIDE_TEMPLATES[0];
  const formData = cur ? (forms[cur.id] || {}) : {};
  const imagePaths = Array.isArray(formData.image_paths) ? (formData.image_paths as string[]) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Presentation Deck</h1>
          <p className="page-subtitle">
            Curate your 5–7 slide urban site planning presentation deck
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : <><Save size={14} /> Save Active Slide</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Slide navigation list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {SLIDE_TEMPLATES.map((tmpl, i) => {
            const slideItem = slides[i];
            const hasData = Boolean(forms[slideItem?.id || '']?.content_notes || slideItem?.content_notes);
            const isActive = activeSlide === i;

            return (
              <button
                key={tmpl.index}
                type="button"
                className="card"
                onClick={() => setActiveSlide(i)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: isActive ? 'var(--blue)' : 'var(--border)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: isActive ? 'var(--blue)' : 'var(--text-tertiary)', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase' }}>
                    Slide 0{tmpl.index}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginTop: 2 }}>
                    {tmpl.title}
                  </div>
                </div>

                {hasData && <CheckCircle2 size={13} color="var(--green)" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Active slide editor */}
        {cur && (
          <div className="card">
            <div className="card-header">
              <div>
                <span className="card-title">Slide 0{template.index}: {template.title}</span>
                <p className="card-subtitle">{template.desc}</p>
              </div>
              <span className="badge badge-muted">Slide {template.index} of 7</span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label">Slide Heading / Display Title</label>
                <input
                  className="input"
                  value={formData.title || template.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder={template.title}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Talking Points & Presentation Content</label>
                <textarea
                  className="textarea"
                  rows={6}
                  value={formData.content_notes || ''}
                  onChange={(e) => updateForm('content_notes', e.target.value)}
                  placeholder={`Detail the specific findings, metrics, and conclusions for Slide 0${template.index}…`}
                />
              </div>

              {/* Graphic upload */}
              <div className="form-group">
                <label className="form-label">Slide Visual Artifacts</label>
                {imagePaths.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    {imagePaths.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                          height: 130,
                          background: '#0B0D10',
                        }}
                      >
                        <img src={p} alt={`Slide graphic ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ))}
                  </div>
                )}

                <label className="upload-area" style={{ display: 'block' }}>
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                  <Upload size={22} style={{ color: 'var(--blue)', margin: '0 auto var(--space-2)' }} />
                  <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                    {uploading ? 'Uploading graphic…' : `Upload Graphic for Slide 0${template.index}`}
                  </div>
                  <div className="upload-area-text">Attach diagram, chart, or rendered image</div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : <><Save size={14} /> Save Slide Content</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
