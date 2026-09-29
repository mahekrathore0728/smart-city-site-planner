import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Upload, Layout, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { api, uploadFile } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FormaBoardFrame } from '../../types';

const BOARD_STORY = [
  { index: 1, title: '01 Site + Context', desc: 'Site location, 1.0 km² boundary verification, existing roads, terrain contours, and local constraints.' },
  { index: 2, title: '02 Design Option 1', desc: 'Massing layout, typologies, density profile, and spatial circulation for Option 1.' },
  { index: 3, title: '03 Design Option 2', desc: 'Alternative massing layout, green-blue network, and circulation strategy for Option 2.' },
  { index: 4, title: '04 Analysis Comparison', desc: 'Side-by-side Forma environmental analysis comparison across sunlight, wind, and microclimate.' },
  { index: 5, title: '05 Final Concept', desc: 'Defended synthesis, design decisions, trade-off rationale, and strategic implementation.' },
  { index: 6, title: '06 Building / Revit Evidence', desc: 'Detailed architectural building modeling, floor plans, and Revit-to-Forma sync evidence.' },
];

export default function FormaBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [frames, setFrames] = useState<FormaBoardFrame[]>([]);
  const [forms, setForms] = useState<Record<string, Partial<FormaBoardFrame>>>({});
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.formaBoard.list(projectId).then((res) => {
      if (res.ok) {
        setFrames(res.data);
        const f: Record<string, Partial<FormaBoardFrame>> = {};
        res.data.forEach((fr) => {
          f[fr.id] = { ...fr };
        });
        setForms(f);
      }
      setLoading(false);
    });
  }, [projectId]);

  const activeStory = BOARD_STORY[activeIdx] || BOARD_STORY[0];
  const activeFrame = frames[activeIdx];
  const formData = activeFrame ? (forms[activeFrame.id] || {}) : {};
  const imagePaths = Array.isArray(formData.image_paths) ? formData.image_paths : [];

  function updateForm(key: keyof FormaBoardFrame, val: string) {
    if (!activeFrame) return;
    setForms((f) => ({
      ...f,
      [activeFrame.id]: {
        ...f[activeFrame.id],
        [key]: val,
      },
    }));
  }

  async function handleSave() {
    if (!activeFrame || !projectId) return;
    setSaving(true);
    const res = await api.formaBoard.updateFrame(projectId, activeFrame.id, {
      ...forms[activeFrame.id],
      frame_title: activeStory.title,
    });
    setSaving(false);
    if (res.ok) {
      setFrames((f) => f.map((x) => (x.id === activeFrame.id ? res.data : x)));
      toast.success('Frame saved');
    } else {
      toast.error(res.error || 'Failed to save frame');
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeFrame || !projectId) return;
    setUploading(true);
    const res = await uploadFile(file);
    setUploading(false);
    if (res.ok) {
      const newPaths = [...imagePaths, res.url];
      setForms((f) => ({
        ...f,
        [activeFrame.id]: { ...f[activeFrame.id], image_paths: newPaths },
      }));
      await api.formaBoard.updateFrame(projectId, activeFrame.id, {
        image_paths: newPaths,
      });
      setFrames((f) =>
        f.map((x) => (x.id === activeFrame.id ? { ...x, image_paths: newPaths } : x))
      );
      toast.success('Evidence graphic added to frame');
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planning Presentation Board</h1>
          <p className="page-subtitle">
            Curate narrative panels and evidence graphics for urban site presentation
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : <><Save size={14} /> Save Active Panel</>}
        </button>
      </div>

      {/* Frame Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {BOARD_STORY.map((story, i) => {
          const frameItem = frames[i];
          const hasDesc = Boolean(frameItem?.description || forms[frameItem?.id || '']?.description);
          const imgCount = frameItem?.image_paths?.length || 0;
          const isActive = activeIdx === i;

          return (
            <div
              key={story.index}
              className="card"
              style={{
                padding: 'var(--space-4)',
                cursor: 'pointer',
                borderColor: isActive ? 'var(--blue)' : 'var(--border)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                transition: 'all var(--transition-fast)',
              }}
              onClick={() => setActiveIdx(i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: isActive ? 'var(--blue)' : 'var(--text-secondary)' }}>
                  Panel {story.index}
                </span>
                {hasDesc && <CheckCircle2 size={12} color="var(--green)" />}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {story.title}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 4 }}>
                {imgCount > 0 ? `${imgCount} visual artifacts` : 'No images yet'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Frame Workspace */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">{activeStory.title}</span>
            <p className="card-subtitle">{activeStory.desc}</p>
          </div>
          <span className="badge badge-muted">Panel {activeStory.index} of 6</span>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Narrative description */}
          <div className="form-group">
            <label className="form-label">Panel Narrative & Planning Findings</label>
            <textarea
              className="textarea"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder={`Document the planning rationale and analytical evidence for ${activeStory.title}…`}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Decision Notes / Key Takeaways</label>
            <textarea
              className="textarea"
              rows={2}
              value={formData.decision_notes || ''}
              onChange={(e) => updateForm('decision_notes', e.target.value)}
              placeholder="Highlight critical spatial criteria or environmental findings communicated in this frame…"
            />
          </div>

          {/* Evidence Graphics */}
          <div className="form-group">
            <label className="form-label">Panel Graphics & Verified Artifacts</label>
            {imagePaths.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {imagePaths.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      height: 140,
                      background: '#0B0D10',
                    }}
                  >
                    <img src={p} alt={`Artifact ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}

            <label className="upload-area" style={{ display: 'block' }}>
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
              <Upload size={22} style={{ color: 'var(--blue)', margin: '0 auto var(--space-2)' }} />
              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                {uploading ? 'Uploading graphic…' : `Upload Graphic to ${activeStory.title}`}
              </div>
              <div className="upload-area-text">Attach high-resolution site plans, Forma diagrams, or Revit axonometrics</div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : <><Save size={14} /> Save Panel Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
