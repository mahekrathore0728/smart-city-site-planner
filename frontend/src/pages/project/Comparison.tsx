import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';
import type { Proposal, Analysis, AnalysisType } from '../../types';
import { ANALYSIS_LABELS, ANALYSIS_STATUS_LABELS } from '../../types';

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

const NOT_AVAILABLE = (
  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
    Not available (Evidence required)
  </span>
);

export default function Comparison() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.proposals.list(projectId),
      api.analyses.list(projectId),
    ]).then(([pr, ar]) => {
      if (pr.ok) setProposals(pr.data);
      if (ar.ok) setAnalyses(ar.data);
      setLoading(false);
    });
  }, [projectId]);

  const opt1 = proposals.find((p) => p.label === '1' || p.label === 'A');
  const opt2 = proposals.find((p) => p.label === '2' || p.label === 'B');

  const getAnalysis = (propId: string, type: AnalysisType) =>
    analyses.find((a) => a.proposal_id === propId && a.analysis_type === type);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const planningDimensions: { key: keyof Proposal; label: string }[] = [
    { key: 'concept', label: 'Design Approach & Concept' },
    { key: 'density', label: 'Density & FAR / FSI' },
    { key: 'landscaping', label: 'Green & Open Space Network' },
    { key: 'transportation', label: 'Transportation & Mobility' },
    { key: 'buildings', label: 'Building Massing & Typologies' },
    { key: 'advantages', label: 'Key Strengths & Benefits' },
    { key: 'tradeoffs', label: 'Identified Trade-offs' },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Option Comparison</h1>
          <p className="page-subtitle">
            Side-by-side architectural and environmental evaluation of Design Option 1 and Design Option 2
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/projects/${projectId}/final`)}
        >
          Select Final Concept <ArrowRight size={14} />
        </button>
      </div>

      {(!opt1?.concept || !opt2?.concept) && (
        <div className="info-banner warn" style={{ marginBottom: 'var(--space-6)' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>
            One or both design options have incomplete spatial parameters.{' '}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/projects/${projectId}/proposals/a`)}
              style={{ padding: '0 4px', textDecoration: 'underline' }}
            >
              Configure Design Options
            </button>
          </span>
        </div>
      )}

      {/* ── Header Columns ── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr' }}>
          <div style={{ padding: 'var(--space-5)', borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Comparison Metrics
            </span>
          </div>

          {/* Option 1 Header */}
          <div style={{ padding: 'var(--space-5)', borderRight: '1px solid var(--border)', borderTop: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                1
              </div>
              <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                {opt1?.name || 'Design Option 1'}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
              {opt1?.concept || 'Spatial concept pending configuration'}
            </div>
          </div>

          {/* Option 2 Header */}
          <div style={{ padding: 'var(--space-5)', borderTop: '3px solid var(--green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                2
              </div>
              <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
                {opt2?.name || 'Design Option 2'}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
              {opt2?.concept || 'Spatial concept pending configuration'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. Planning Dimensions Table ── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
        <div className="card-header">
          <span className="card-title">Spatial & Planning Parameters</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Dimension</th>
                <th>Design Option 1</th>
                <th>Design Option 2</th>
              </tr>
            </thead>
            <tbody>
              {planningDimensions.map((f) => (
                <tr key={f.key}>
                  <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {f.label}
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                    {(opt1?.[f.key] as string) || NOT_AVAILABLE}
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                    {(opt2?.[f.key] as string) || NOT_AVAILABLE}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. Environmental Analysis Side-by-Side ── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <span className="card-title">Forma Environmental Analysis Comparison</span>
            <p className="card-subtitle">Verified findings and quantitative results side-by-side</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Analysis Type</th>
                <th>Design Option 1</th>
                <th>Design Option 2</th>
              </tr>
            </thead>
            <tbody>
              {ANALYSIS_TYPES.map((type) => {
                const an1 = opt1 ? getAnalysis(opt1.id, type) : null;
                const an2 = opt2 ? getAnalysis(opt2.id, type) : null;

                return (
                  <tr key={type}>
                    <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-secondary)' }}>
                      <div>{ANALYSIS_LABELS[type]}</div>
                    </td>

                    {/* Option 1 Column */}
                    <td style={{ fontSize: 'var(--text-sm)' }}>
                      {an1?.result_value ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                          <span className="text-mono" style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                            {an1.result_value} {an1.result_unit || ''}
                          </span>
                          <span className="badge badge-blue" style={{ fontSize: '9px' }}>
                            {ANALYSIS_STATUS_LABELS[an1.status] || an1.status}
                          </span>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                          {an1?.status !== 'not_started' ? ANALYSIS_STATUS_LABELS[an1?.status || 'not_started'] : 'Result not available'}
                        </div>
                      )}

                      {an1?.finding ? (
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 'var(--text-xs)' }}>
                          {an1.finding}
                        </div>
                      ) : null}
                    </td>

                    {/* Option 2 Column */}
                    <td style={{ fontSize: 'var(--text-sm)' }}>
                      {an2?.result_value ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                          <span className="text-mono" style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                            {an2.result_value} {an2.result_unit || ''}
                          </span>
                          <span className="badge badge-green" style={{ fontSize: '9px' }}>
                            {ANALYSIS_STATUS_LABELS[an2.status] || an2.status}
                          </span>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                          {an2?.status !== 'not_started' ? ANALYSIS_STATUS_LABELS[an2?.status || 'not_started'] : 'Result not available'}
                        </div>
                      )}

                      {an2?.finding ? (
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 'var(--text-xs)' }}>
                          {an2.finding}
                        </div>
                      ) : null}
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
