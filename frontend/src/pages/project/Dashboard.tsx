import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, CheckCircle, Circle, ArrowRight,
  Layers, FileBarChart2, Layout, Cpu, Lightbulb, Compass,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import type { ReadinessReport, FormaWorkflowStep, Analysis, Proposal, FinalConcept, RevitWorkflow } from '../../types';

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject } = useAppStore();
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [finalConcept, setFinalConcept] = useState<FinalConcept | null>(null);
  const [revit, setRevit] = useState<RevitWorkflow | null>(null);
  const [formaSteps, setFormaSteps] = useState<FormaWorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.projects.readiness(projectId),
      api.proposals.list(projectId),
      api.analyses.list(projectId),
      api.final.get(projectId),
      api.revit.get(projectId),
      api.forma.list(projectId),
    ]).then(([r, p, a, f, rev, steps]) => {
      if (r.ok) setReadiness(r.data);
      if (p.ok) setProposals(p.data);
      if (a.ok) setAnalyses(a.data);
      if (f.ok) setFinalConcept(f.data);
      if (rev.ok) setRevit(rev.data);
      if (steps.ok) setFormaSteps(steps.data);
      setLoading(false);
    });
  }, [projectId]);

  if (!currentProject || loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const p = currentProject;
  const areaValid = p.site_area_km2 >= 1.0;
  const opt1 = proposals.find((x) => x.label === '1' || x.label === 'A');
  const opt2 = proposals.find((x) => x.label === '2' || x.label === 'B');

  const analysesReviewed = analyses.filter((a) => a.status === 'actual_forma_result' || a.status === 'user_entered').length;
  const analysesWithEvidence = analyses.filter((a) => a.status !== 'not_started').length;
  const totalAnalyses = 16; // 8 for Option 1, 8 for Option 2

  // Progress score calculated from actual project records
  const score = readiness?.score ?? 0;
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 40 ? 'var(--blue)' : 'var(--amber)';

  // Required 6 Sections per prompt
  const overviewSections = [
    {
      title: 'Site',
      icon: <MapPin size={18} />,
      path: 'site',
      status: p.site_area_km2 > 0 ? (areaValid ? 'Configured (≥1 km²)' : 'Area < 1 km²') : 'Not started',
      desc: p.site_area_km2 > 0
        ? `${p.site_area_km2.toFixed(2)} km² (${(p.site_area_km2 * 1000000).toLocaleString()} m²)`
        : 'Boundary and dimensions pending',
      isComplete: p.site_area_km2 >= 1.0,
    },
    {
      title: 'Design Options',
      icon: <Layers size={18} />,
      path: 'proposals/a',
      status: (opt1?.concept || opt2?.concept) ? 'Formulated' : 'Not started',
      desc: (opt1?.concept && opt2?.concept)
        ? 'Option 1 & Option 2 defined'
        : opt1?.concept
          ? 'Option 1 in progress, Option 2 pending'
          : 'Define planning typologies and density options',
      isComplete: Boolean(opt1?.concept && opt2?.concept),
    },
    {
      title: 'Analysis',
      icon: <FileBarChart2 size={18} />,
      path: 'analyses',
      status: analysesWithEvidence > 0 ? `${analysesWithEvidence}/${totalAnalyses} Recorded` : 'Not started',
      desc: analysesWithEvidence > 0
        ? `${analysesReviewed} verified, ${analysesWithEvidence - analysesReviewed} evidence uploaded`
        : 'Forma sunlight, wind, and microclimate data',
      isComplete: analysesWithEvidence >= 8,
    },
    {
      title: 'Board',
      icon: <Layout size={18} />,
      path: 'forma-board',
      status: (readiness?.items?.forma_board) ? 'Board Assembled' : 'Not started',
      desc: 'Architectural presentation workspace and narrative frames',
      isComplete: Boolean(readiness?.items?.forma_board),
    },
    {
      title: 'Building',
      icon: <Cpu size={18} />,
      path: 'revit',
      status: (revit?.building_name && revit.export_status !== 'pending') ? revit.export_status : 'Not started',
      desc: revit?.building_name ? revit.building_name : 'Massing export and Revit synchronization',
      isComplete: Boolean(revit?.detailing_done || revit?.sync_status === 'complete'),
    },
    {
      title: 'Final Concept',
      icon: <Lightbulb size={18} />,
      path: 'final',
      status: finalConcept?.selected_proposal ? `Selected: Option ${finalConcept.selected_proposal}` : 'Not started',
      desc: finalConcept?.rationale ? finalConcept.rationale.slice(0, 75) + '…' : 'Synthesis, trade-offs, and final site design',
      isComplete: Boolean(finalConcept?.selected_proposal),
    },
  ];

  return (
    <div>
      {/* Project Overview Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span className="badge badge-muted">Project Workspace</span>
              {p.site_area_km2 > 0 && (
                areaValid ? (
                  <span className="badge badge-green">Validated: 1.00 km² / 1,000,000 m²</span>
                ) : (
                  <span className="badge badge-amber">
                    <AlertTriangle size={11} /> Site &lt; 1.00 km²
                  </span>
                )
              )}
            </div>

            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {p.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--text-base)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} />
                <span>{p.location_name || [p.city, p.state].filter(Boolean).join(', ') || 'Location not specified'}</span>
              </div>
              <span>•</span>
              <div>
                Site Area: <span className="text-mono" style={{ color: 'var(--text-primary)', fontWeight: 'var(--weight-semibold)' }}>{p.site_area_km2.toFixed(2)} km²</span>
              </div>
              {p.description && (
                <>
                  <span>•</span>
                  <span style={{ maxWidth: 400 }} className="truncate">{p.description}</span>
                </>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate(`/projects/${projectId}/site`)}
          >
            Open Site Map <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Progress & Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', alignItems: 'stretch' }}>
        {/* Progress Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            Planning Progress
          </div>

          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto var(--space-4)' }}>
            <svg viewBox="0 0 96 96" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={scoreColor}
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                {score}%
              </span>
            </div>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {readiness?.passed ?? 0} of {readiness?.total ?? 14} verified steps
          </div>
        </div>

        {/* 6 Required Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          {overviewSections.map((sec) => (
            <div
              key={sec.title}
              className="card"
              style={{
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), transform var(--transition-fast)',
              }}
              onClick={() => navigate(`/projects/${projectId}/${sec.path}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ color: sec.isComplete ? 'var(--green)' : 'var(--blue)' }}>
                      {sec.icon}
                    </span>
                    <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
                      {sec.title}
                    </span>
                  </div>

                  {sec.isComplete ? (
                    <CheckCircle size={15} color="var(--green)" />
                  ) : (
                    <Circle size={15} color="var(--border-strong)" />
                  )}
                </div>

                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: sec.status === 'Not started' ? 'var(--text-muted)' : 'var(--blue)', marginBottom: 4 }}>
                  {sec.status}
                </div>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sec.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                <span>Configure {sec.title}</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
