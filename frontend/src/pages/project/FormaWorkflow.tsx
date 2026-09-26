import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, Save } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../store/appStore';
import type { FormaWorkflowStep } from '../../types';

export default function FormaWorkflow() {
  const { projectId } = useParams<{ projectId: string }>();
  const toast = useToast();
  const [steps, setSteps] = useState<FormaWorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    api.forma.list(projectId).then(res => {
      if (res.ok) {
        setSteps(res.data);
        const n: Record<string, string> = {};
        res.data.forEach(s => { n[s.id] = s.notes || ''; });
        setNotes(n);
      }
      setLoading(false);
    });
  }, [projectId]);

  const complete = steps.filter(s => s.status === 'complete').length;
  const inProgress = steps.filter(s => s.status === 'in_progress').length;

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function updateStatus(step: FormaWorkflowStep, status: FormaWorkflowStep['status']) {
    setSaving(step.id);
    const res = await api.forma.updateStep(projectId!, step.id, { status, notes: notes[step.id] || '' });
    setSaving(null);
    if (res.ok) {
      setSteps(prev => prev.map(s => s.id === step.id ? res.data : s));
      toast.success(`Step marked as ${status.replace('_',' ')}`);
    } else toast.error(res.error);
  }

  async function saveNotes(step: FormaWorkflowStep) {
    setSaving(step.id + '-notes');
    const res = await api.forma.updateStep(projectId!, step.id, { notes: notes[step.id] || '' });
    setSaving(null);
    if (res.ok) { setSteps(prev => prev.map(s => s.id === step.id ? res.data : s)); toast.success('Notes saved'); }
    else toast.error(res.error);
  }

  const statusColor = { pending:'var(--text-tertiary)', in_progress:'var(--blue)', complete:'var(--green)' };
  const pct = steps.length ? Math.round(complete/steps.length*100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Forma Workflow</h1>
          <p className="page-subtitle">Track your Autodesk Forma site design progress</p>
        </div>
      </div>

      {/* Critical boundary notice */}
      <div className="info-banner warn" style={{ marginBottom:'var(--space-4)' }}>
        <AlertTriangle size={15} style={{flexShrink:0}}/>
        <div>
          <strong>Work is performed in Autodesk Forma.</strong> This checklist tracks your progress — it does not perform any Forma operations.
          <a href="https://forma.autodesk.com" target="_blank" rel="noopener noreferrer" style={{ marginLeft:8, color:'var(--blue)', display:'inline-flex', alignItems:'center', gap:3 }}>
            Open Autodesk Forma <ExternalLink size={11}/>
          </a>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom:'var(--space-6)', padding:'var(--space-5) var(--space-6)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-3)' }}>
          <span style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-md)' }}>Workflow Progress</span>
          <div style={{ display:'flex', gap:'var(--space-4)', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
            <span><span style={{color:'var(--green)',fontWeight:600}}>{complete}</span> complete</span>
            <span><span style={{color:'var(--blue)',fontWeight:600}}>{inProgress}</span> in progress</span>
            <span><span style={{fontWeight:600}}>{steps.length - complete - inProgress}</span> pending</span>
          </div>
        </div>
        <div className="progress-bar" style={{ height:6 }}>
          <div className="progress-fill green" style={{ width:`${pct}%` }}/>
        </div>
        <div style={{ fontSize:'var(--text-sm)', color:'var(--text-tertiary)', marginTop:'var(--space-2)' }}>{pct}% — {complete}/{steps.length} steps complete</div>
      </div>

      {loading && <div className="loading-overlay"><div className="spinner"/></div>}

      {/* Steps */}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
        {steps.map((step, idx) => {
          const isExpanded = expanded.has(step.id);
          const isSaving = saving === step.id || saving === step.id + '-notes';
          return (
            <div key={step.id} className="card" style={{ borderLeft:`3px solid ${statusColor[step.status]}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-4) var(--space-5)', cursor:'pointer' }} onClick={() => toggleExpand(step.id)}>
                {/* Step number */}
                <div style={{ width:28, height:28, borderRadius:'50%', background: step.status==='complete'?'var(--green)': step.status==='in_progress'?'var(--blue)':'var(--bg-muted)', border:`2px solid ${statusColor[step.status]}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {step.status==='complete' ? <CheckCircle size={14} color="#fff"/> : <span style={{ fontSize:'var(--text-xs)', fontWeight:700, color: step.status==='in_progress'?'#fff':'var(--text-tertiary)' }}>{idx+1}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:'var(--weight-semibold)', fontSize:'var(--text-md)', color:'var(--text-primary)' }}>{step.step_name}</div>
                  {step.step_description && <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginTop:2 }}>{step.step_description}</div>}
                </div>
                <span className={`analysis-status ${step.status==='complete'?'reviewed': step.status==='in_progress'?'uploaded':'not-started'}`}>
                  {step.status.replace('_',' ')}
                </span>
                {isExpanded ? <ChevronDown size={15} color="var(--text-tertiary)"/> : <ChevronRight size={15} color="var(--text-tertiary)"/>}
              </div>

              {isExpanded && (
                <div style={{ padding:'0 var(--space-5) var(--space-5)', borderTop:'1px solid var(--border)' }}>
                  {/* Status buttons */}
                  <div style={{ display:'flex', gap:'var(--space-2)', margin:'var(--space-4) 0' }}>
                    {(['pending','in_progress','complete'] as const).map(s => (
                      <button key={s} className={`btn btn-sm ${step.status===s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => updateStatus(step, s)} disabled={isSaving}>
                        {s==='complete' && <CheckCircle size={12}/>}
                        {s==='in_progress' && <Circle size={12}/>}
                        {s.replace('_',' ')}
                      </button>
                    ))}
                    {isSaving && <div className="spinner" style={{width:16,height:16,borderWidth:2,alignSelf:'center'}}/>}
                  </div>
                  {/* Notes */}
                  <div className="form-group">
                    <label className="form-label">Notes / Evidence Reference</label>
                    <textarea className="textarea" rows={2} value={notes[step.id]||''} onChange={e => setNotes(n=>({...n,[step.id]:e.target.value}))} placeholder="Add notes, evidence reference, or screenshot file name…"/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'var(--space-3)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => saveNotes(step)} disabled={isSaving}>
                      <Save size={12}/> Save Notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
