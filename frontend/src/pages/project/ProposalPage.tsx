import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { Proposal, ProposalMetric } from '../../types';

interface Props { label: 'A' | 'B' }

const TEMPLATES = {
  A: { name:'Proposal A', concept:'Transit-Oriented Compact Development', description:'Higher density mixed-use development concentrated around transit nodes, with walkable streets and compact urban form.', planning_strategy:'Compact, high-density development gradient from transit core to periphery. Mixed-use zones with retail, office, and residential.', transportation:'Metro feeder buses, shared mobility hubs at transit nodes, elevated pedestrian walkways, cycle tracks.', buildings:'Mixed-use towers (G+15 to G+25) at transit nodes, mid-rise residential (G+6 to G+10) at periphery.', landscaping:'Linear green corridors along streets, rooftop gardens, pocket parks, tree-lined boulevards.', density:'High density at core (FSI 3.5–4.0), medium at periphery (FSI 1.5–2.0)', advantages:'High transit ridership potential, reduced car dependency, efficient land use, economic vitality.', tradeoffs:'Higher embodied carbon from dense construction, less ground-level green space, potential overshadowing.' },
  B: { name:'Proposal B', concept:'Green-Blue Resilient Development', description:'Moderate density with emphasis on blue-green infrastructure, flood resilience, and urban cooling throughout the site.', planning_strategy:'Distributed moderate density with extensive green-blue network. Environmental resilience as primary organizing principle.', transportation:'Green mobility corridors, cycling infrastructure, pedestrian priority streets, low-speed zones.', buildings:'Low-to-mid-rise buildings (G+4 to G+10) distributed across site with generous green buffers between blocks.', landscaping:'Extensive green network: wetlands, rain gardens, linear parks, tree canopy, blue corridors.', density:'Moderate density throughout (FSI 1.5–2.5), more even distribution across site.', advantages:'Lower heat stress, flood resilience, better daylight access, biodiversity, community amenity.', tradeoffs:'Lower FAR means less housing/commercial capacity per unit area, may require larger site.' },
};

export default function ProposalPage({ label }: Props) {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [form, setForm] = useState<Partial<Proposal>>({});
  const [metrics, setMetrics] = useState<ProposalMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const other = label === 'A' ? 'B' : 'A';
  const accent = label === 'A' ? 'var(--blue)' : 'var(--green)';
  const tmpl = TEMPLATES[label];

  useEffect(() => {
    if (!projectId) return;
    api.proposals.byLabel(projectId, label).then(res => {
      if (res.ok) {
        setProposal(res.data);
        setForm(res.data);
        setMetrics(Array.isArray(res.data.metrics) ? res.data.metrics : []);
      }
      setLoading(false);
    });
  }, [projectId, label]);

  function field(key: keyof Proposal, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function addMetric() { setMetrics(m => [...m, { label:'', value:'', unit:'' }]); }
  function updateMetric(idx: number, key: keyof ProposalMetric, val: string) {
    setMetrics(m => m.map((x, i) => i === idx ? { ...x, [key]: val } : x));
  }
  function removeMetric(idx: number) { setMetrics(m => m.filter((_, i) => i !== idx)); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!proposal) return;
    setSaving(true);
    const res = await api.proposals.update(projectId!, proposal.id, { ...form, metrics });
    setSaving(false);
    if (res.ok) { setProposal(res.data); toast.success(`Proposal ${label} saved`); }
    else toast.error(res.error);
  }

  function applyTemplate() {
    setForm(f => ({ ...f, ...tmpl }));
    toast.info('Template applied — edit to match your actual proposal');
  }

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;
  if (!proposal) return <div className="info-banner error">Proposal not found</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
          <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:accent, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'var(--text-xl)', flexShrink:0 }}>{label}</div>
          <div>
            <h1 className="page-title">Proposal {label}</h1>
            <p className="page-subtitle">{form.concept || tmpl.concept}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'var(--space-2)', alignItems:'center' }}>
          {!form.concept && <button className="btn btn-ghost btn-sm" onClick={applyTemplate}>Use Template</button>}
          <span className={`badge ${proposal.status==='complete'?'badge-green':'badge-muted'}`}>{proposal.status}</span>
        </div>
      </div>

      <div className="info-banner info" style={{ marginBottom:'var(--space-6)' }}>
        <Info size={14} style={{flexShrink:0}}/> This proposal is completely independent from Proposal {other}. Data entered here does not affect the other proposal.
      </div>

      <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
        {/* Concept */}
        <div className="card">
          <div className="card-header" style={{ borderTop:`3px solid ${accent}` }}>
            <span className="card-title">Concept</span>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Proposal Name</label>
              <input className="input" value={form.name||''} onChange={e=>field('name',e.target.value)} placeholder={tmpl.name}/>
            </div>
            <div className="form-group">
              <label className="form-label">Concept</label>
              <input className="input" value={form.concept||''} onChange={e=>field('concept',e.target.value)} placeholder={tmpl.concept}/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" rows={4} value={form.description||''} onChange={e=>field('description',e.target.value)} placeholder={tmpl.description}/>
            </div>
          </div>
        </div>

        {/* Planning details */}
        <div className="card">
          <div className="card-header"><span className="card-title">Planning Details</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            {[
              { key:'planning_strategy' as const, label:'Planning Strategy', ph: tmpl.planning_strategy },
              { key:'transportation' as const, label:'Transportation Approach', ph: tmpl.transportation },
              { key:'buildings' as const, label:'Building Typology', ph: tmpl.buildings },
              { key:'landscaping' as const, label:'Landscaping Strategy', ph: tmpl.landscaping },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <textarea className="textarea" rows={2} value={form[f.key]||''} onChange={e=>field(f.key,e.target.value)} placeholder={f.ph}/>
              </div>
            ))}
          </div>
        </div>

        {/* Density and trade-offs */}
        <div className="card">
          <div className="card-header"><span className="card-title">Density & Trade-offs</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Density</label>
              <input className="input" value={form.density||''} onChange={e=>field('density',e.target.value)} placeholder={tmpl.density}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Advantages</label>
                <textarea className="textarea" rows={3} value={form.advantages||''} onChange={e=>field('advantages',e.target.value)} placeholder={tmpl.advantages}/>
              </div>
              <div className="form-group">
                <label className="form-label">Trade-offs</label>
                <textarea className="textarea" rows={3} value={form.tradeoffs||''} onChange={e=>field('tradeoffs',e.target.value)} placeholder={tmpl.tradeoffs}/>
              </div>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Key Metrics</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addMetric}><Plus size={13}/> Add Metric</button>
          </div>
          <div className="card-body">
            {metrics.length === 0 && (
              <div style={{ color:'var(--text-tertiary)', fontSize:'var(--text-base)', textAlign:'center', padding:'var(--space-6) 0' }}>No metrics yet — add quantifiable planning targets</div>
            )}
            {metrics.map((m, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:'var(--space-3)', marginBottom:'var(--space-3)', alignItems:'center' }}>
                <input className="input" placeholder="Metric label" value={m.label} onChange={e=>updateMetric(i,'label',e.target.value)}/>
                <input className="input" placeholder="Value" value={m.value} onChange={e=>updateMetric(i,'value',e.target.value)}/>
                <input className="input" placeholder="Unit (km², %…)" value={m.unit||''} onChange={e=>updateMetric(i,'unit',e.target.value)}/>
                <button type="button" className="btn btn-ghost btn-icon" onClick={()=>removeMetric(i)}><Trash2 size={13} color="var(--red)"/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes + Status */}
        <div className="card">
          <div className="card-header"><span className="card-title">Notes & Status</span></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="textarea" rows={3} value={form.notes||''} onChange={e=>field('notes',e.target.value)} placeholder="Any additional planning notes, decisions, or context…"/>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="select" style={{ maxWidth:200 }} value={form.status||'draft'} onChange={e=>field('status',e.target.value)}>
                <option value="draft">Draft</option>
                <option value="complete">Complete</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : <><Save size={15}/> Save Proposal {label}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
