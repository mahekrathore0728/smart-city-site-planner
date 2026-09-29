import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import type { Proposal, Analysis, AnalysisType } from '../../types';
import { ANALYSIS_LABELS, ANALYSIS_STATUS_LABELS } from '../../types';

const ANALYSIS_TYPES: AnalysisType[] = ['area_metrics','embodied_carbon','sun_hours','daylight','wind','microclimate','noise','solar_energy'];
const NA = <span style={{color:'var(--text-tertiary)',fontStyle:'italic'}}>Not Available</span>;

export default function Comparison() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([api.proposals.list(projectId), api.analyses.list(projectId)]).then(([pr, ar]) => {
      if (pr.ok) setProposals(pr.data);
      if (ar.ok) setAnalyses(ar.data);
      setLoading(false);
    });
  }, [projectId]);

  const propA = proposals.find(p => p.label === 'A');
  const propB = proposals.find(p => p.label === 'B');
  const getAn = (propId: string, type: AnalysisType) => analyses.find(a => a.proposal_id === propId && a.analysis_type === type);

  if (loading) return <div className="loading-overlay"><div className="spinner"/></div>;

  const planningFields: { key: keyof Proposal; label: string }[] = [
    { key:'concept', label:'Concept' }, { key:'planning_strategy', label:'Planning Strategy' },
    { key:'transportation', label:'Transportation' }, { key:'buildings', label:'Buildings' },
    { key:'landscaping', label:'Landscaping' }, { key:'density', label:'Density' },
    { key:'advantages', label:'Advantages' }, { key:'tradeoffs', label:'Trade-offs' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Design Comparison</h1>
          <p className="page-subtitle">Side-by-side evaluation of Design Option A and Design Option B</p>
        </div>
      </div>

      {(!propA?.concept || !propB?.concept) && (
        <div className="info-banner warn" style={{ marginBottom:'var(--space-6)' }}>
          One or both design options are incomplete. <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/proposals/a`)}>Complete Design Option A</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/projects/${projectId}/proposals/b`)}>Complete Design Option B</button>
        </div>
      )}

      {/* Header row */}
      <div className="card" style={{ marginBottom:'var(--space-6)', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'200px 1fr 1fr' }}>
          <div style={{ padding:'var(--space-5)', borderRight:'1px solid var(--border)', background:'var(--bg-muted)' }}/>
          {([propA, propB] as const).map((prop, i) => {
            const l = i === 0 ? 'A' : 'B';
            const accent = l === 'A' ? 'var(--blue)' : 'var(--green)';
            return (
              <div key={l} style={{ padding:'var(--space-5)', borderRight: l==='A' ? '1px solid var(--border)' : 'none', borderTop:`3px solid ${accent}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginBottom:'var(--space-1)' }}>
                  <div style={{ width:24,height:24,borderRadius:'var(--radius-sm)',background:accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'var(--text-md)' }}>{l}</div>
                  <span style={{ fontWeight:'var(--weight-bold)', fontSize:'var(--text-lg)' }}>{prop?.name || `Design Option ${l}`}</span>
                </div>
                <div style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{prop?.concept || 'Not yet defined'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planning dimensions table */}
      <div className="card" style={{ marginBottom:'var(--space-6)', overflow:'hidden' }}>
        <div className="card-header"><span className="card-title">Planning Dimensions</span></div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:180 }}>Dimension</th>
                <th>Design Option A</th>
                <th>Design Option B</th>
              </tr>
            </thead>
            <tbody>
              {planningFields.map(f => (
                <tr key={f.key}>
                  <td style={{ fontWeight:'var(--weight-medium)', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{f.label}</td>
                  <td style={{ fontSize:'var(--text-base)', lineHeight:'var(--leading-relaxed)' }}>{(propA?.[f.key] as string) || NA}</td>
                  <td style={{ fontSize:'var(--text-base)', lineHeight:'var(--leading-relaxed)' }}>{(propB?.[f.key] as string) || NA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis comparison */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div className="card-header"><span className="card-title">Site Analysis Comparison</span></div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:180 }}>Analysis</th>
                <th>Option A — Finding</th>
                <th>Option A — Status</th>
                <th>Option B — Finding</th>
                <th>Option B — Status</th>
              </tr>
            </thead>
            <tbody>
              {ANALYSIS_TYPES.map(type => {
                const anA = propA ? getAn(propA.id, type) : null;
                const anB = propB ? getAn(propB.id, type) : null;
                return (
                  <tr key={type}>
                    <td style={{ fontWeight:'var(--weight-medium)', whiteSpace:'nowrap' }}>{ANALYSIS_LABELS[type]}</td>
                    <td style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', maxWidth:200 }}>
                      {anA?.finding || <span style={{color:'var(--amber)', fontStyle:'italic', fontSize:'var(--text-xs)'}}>Awaiting Result</span>}
                    </td>
                    <td>
                      {anA ? (
                        <span className={`analysis-status ${anA.status === 'not_started' ? 'not-started' : anA.status === 'evidence_required' ? 'evidence-required' : anA.status === 'uploaded' ? 'uploaded' : 'reviewed'}`}>
                          {ANALYSIS_STATUS_LABELS[anA.status]}
                        </span>
                      ) : NA}
                    </td>
                    <td style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', maxWidth:200 }}>
                      {anB?.finding || <span style={{color:'var(--amber)', fontStyle:'italic', fontSize:'var(--text-xs)'}}>Awaiting Result</span>}
                    </td>
                    <td>
                      {anB ? (
                        <span className={`analysis-status ${anB.status === 'not_started' ? 'not-started' : anB.status === 'evidence_required' ? 'evidence-required' : anB.status === 'uploaded' ? 'uploaded' : 'reviewed'}`}>
                          {ANALYSIS_STATUS_LABELS[anB.status]}
                        </span>
                      ) : NA}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
