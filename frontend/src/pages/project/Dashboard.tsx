import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Circle, ArrowRight, MapPin, BarChart2, Layout, Cpu, FileText, Video, ClipboardList, Info } from 'lucide-react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import type { ReadinessReport, FormaWorkflowStep, Analysis } from '../../types';

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject } = useAppStore();
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [formaSteps, setFormaSteps] = useState<FormaWorkflowStep[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.projects.readiness(projectId),
      api.forma.list(projectId),
      api.analyses.list(projectId),
    ]).then(([r, f, a]) => {
      if (r.ok) setReadiness(r.data);
      if (f.ok) setFormaSteps(f.data);
      if (a.ok) setAnalyses(a.data);
      setLoading(false);
    });
  }, [projectId]);

  if (!currentProject || loading) {
    return <div className="loading-overlay"><div className="spinner"/></div>;
  }

  const p = currentProject;
  const formaComplete = formaSteps.filter(s => s.status === 'complete').length;
  const analysesReviewed = analyses.filter(a => a.status === 'reviewed').length;
  const analysesUploaded = analyses.filter(a => a.status !== 'not_started').length;
  const score = readiness?.score ?? 0;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';

  // Next task recommendation
  const items = readiness?.items ?? {};
  const nextTask = !items.site_area ? 'Set site area ≥ 1.0 km²'
    : !items.local_problems ? 'Document site context & local problems'
    : !items.objectives ? 'Define planning objectives'
    : !items.proposal_a ? 'Complete Design Option A concept'
    : !items.proposal_b ? 'Complete Design Option B concept'
    : !items.analyses_a ? 'Upload site analysis evidence'
    : !items.final_concept ? 'Select final concept & strategy'
    : !items.presentation ? 'Complete project presentation slides'
    : 'Review project readiness checklist';

  const sections = [
    { label:'Site Setup', icon:<MapPin size={16}/>, path:'site', done: items.site_area && items.site_boundary, note: p.site_area_km2 > 0 ? `${p.site_area_km2} km²` : 'Area not set' },
    { label:'Design Options', icon:<Layout size={16}/>, path:'proposals/a', done: items.proposal_a && items.proposal_b, note: [items.proposal_a && 'Option A', items.proposal_b && 'Option B'].filter(Boolean).join(' + ') || 'Not started' },
    { label:'Site Analysis', icon:<BarChart2 size={16}/>, path:'analyses', done: analysesReviewed >= 8, note: `${analysesUploaded}/16 with evidence` },
    { label:'Planning Workflow', icon:<CheckCircle size={16}/>, path:'forma', done: formaComplete >= 12, note: `${formaComplete}/12 steps` },
    { label:'Building Development', icon:<Cpu size={16}/>, path:'revit', done: items.revit_workflow, note: items.revit_workflow ? 'In progress' : 'Not started' },
    { label:'Project Presentation', icon:<FileText size={16}/>, path:'presentation', done: items.presentation, note: items.presentation ? '5+ slides ready' : 'Not started' },
  ];

  return (
    <div>
      {/* Project header */}
      <div style={{ marginBottom:'var(--space-8)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'var(--space-4)', flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', marginBottom:'var(--space-2)', flexWrap:'wrap' }}>
              <span className="badge badge-muted">{p.stage}</span>
              {p.site_area_km2 < 1.0 && p.site_area_km2 > 0 && (
                <span className="badge badge-amber"><AlertTriangle size={10}/> Site &lt; 1.0 km²</span>
              )}
            </div>
            <h1 style={{ fontSize:'var(--text-3xl)', fontWeight:800, letterSpacing:'-0.02em', color:'var(--text-primary)', lineHeight:1.2 }}>{p.name.replace(/^\[DEMO\]\s*/i, '')}</h1>
            {(p.city || p.location_name) && (
              <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginTop:'var(--space-2)', color:'var(--text-secondary)', fontSize:'var(--text-base)' }}>
                <MapPin size={13}/>
                {[p.location_name, p.city, p.state].filter(Boolean).join(', ')}
                {p.site_area_km2 > 0 && <span style={{marginLeft:4, fontFamily:'var(--font-mono)', fontSize:'var(--text-sm)', background:'var(--bg-muted)', padding:'1px 6px', borderRadius:'var(--radius-sm)'}}>{p.site_area_km2} km²</span>}
              </div>
            )}
            {p.planning_org && <div style={{ color:'var(--text-tertiary)', fontSize:'var(--text-sm)', marginTop:'var(--space-1)' }}>{p.planning_org}</div>}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/projects/${projectId}/checklist`)}>
            <ClipboardList size={14}/> Project Readiness
          </button>
        </div>
      </div>

      {/* Site area warning */}
      {p.site_area_km2 > 0 && p.site_area_km2 < 1.0 && (
        <div className="info-banner warn" style={{ marginBottom:'var(--space-6)' }}>
          <AlertTriangle size={16} style={{flexShrink:0}}/>
          <span>Site area ({p.site_area_km2} km²) is below the recommended minimum of 1.0 km² for regional site planning.</span>
          <button className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}} onClick={() => navigate(`/projects/${projectId}/site`)}>Update Site</button>
        </div>
      )}

      {/* Readiness + Progress grid */}
      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:'var(--space-6)', marginBottom:'var(--space-6)', alignItems:'start' }}>
        {/* Readiness score */}
        <div className="card" style={{ textAlign:'center', padding:'var(--space-6)' }}>
          <div style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--text-tertiary)', letterSpacing:'var(--tracking-widest)', textTransform:'uppercase', marginBottom:'var(--space-4)' }}>Project Readiness</div>
          <div style={{ position:'relative', width:90, height:90, margin:'0 auto var(--space-4)' }}>
            <svg viewBox="0 0 90 90" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="7"/>
              <circle cx="45" cy="45" r="38" fill="none" stroke={scoreColor} strokeWidth="7"
                strokeDasharray={`${2*Math.PI*38}`}
                strokeDashoffset={`${2*Math.PI*38*(1-score/100)}`}
                strokeLinecap="round" style={{transition:'stroke-dashoffset 0.5s ease'}}/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'var(--text-xl)', fontWeight:800, color:'var(--text-primary)' }}>{score}%</span>
            </div>
          </div>
          <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{readiness?.passed ?? 0}/{readiness?.total ?? 14} requirements met</div>
        </div>

        {/* Section cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'var(--space-4)' }}>
          {sections.map(s => (
            <button key={s.label} onClick={() => navigate(`/projects/${projectId}/${s.path}`)}
              style={{ textAlign:'left', background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'var(--space-4)', cursor:'pointer', transition:'border-color var(--transition-fast)', display:'flex', flexDirection:'column', gap:'var(--space-2)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor='var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='var(--border)')}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color: s.done ? 'var(--green)' : 'var(--text-tertiary)' }}>{s.icon}</span>
                {s.done ? <CheckCircle size={14} color="var(--green)"/> : <Circle size={14} color="var(--border-strong)"/>}
              </div>
              <div style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-base)', color:'var(--text-primary)' }}>{s.label}</div>
              <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{s.note}</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'var(--text-xs)', color:'var(--blue)' }}>Open <ArrowRight size={11}/></div>
            </button>
          ))}
        </div>
      </div>

      {/* Next task + progress bar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-6)', marginBottom:'var(--space-6)' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Recommended Next Step</span></div>
          <div className="card-body">
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--blue)', flexShrink:0 }}/>
              <span style={{ fontSize:'var(--text-md)', color:'var(--text-primary)' }}>{nextTask}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Overall Progress</span></div>
          <div className="card-body">
            <div className="progress-bar" style={{ height:8, marginBottom:'var(--space-3)' }}>
              <div className="progress-fill" style={{ width:`${score}%`, background: scoreColor }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
              <span>{readiness?.passed ?? 0} complete</span>
              <span>{(readiness?.total ?? 14) - (readiness?.passed ?? 0)} remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow quick status */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Planning Workflow Progress</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/forma`)}>
            View All <ArrowRight size={12}/>
          </button>
        </div>
        <div className="card-body-sm">
          {formaSteps.slice(0, 6).map(step => (
            <div key={step.id} style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ color: step.status==='complete'?'var(--green)': step.status==='in_progress'?'var(--blue)':'var(--text-tertiary)' }}>
                {step.status==='complete' ? <CheckCircle size={14}/> : <Circle size={14}/>}
              </span>
              <span style={{ flex:1, fontSize:'var(--text-base)', color: step.status==='complete'?'var(--text-secondary)':'var(--text-primary)' }}>{step.step_name}</span>
              <span className={`analysis-status ${step.status==='complete'?'reviewed': step.status==='in_progress'?'uploaded':'not-started'}`}>{step.status.replace('_',' ')}</span>
            </div>
          ))}
          {formaSteps.length > 6 && (
            <div style={{ padding:'8px 0', fontSize:'var(--text-sm)', color:'var(--text-tertiary)', textAlign:'center' }}>
              +{formaSteps.length - 6} more steps →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
