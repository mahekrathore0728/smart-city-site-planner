import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, MapPin, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../store/appStore';
import type { Project } from '../types';

const STAGE_LABELS: Record<string, string> = {
  setup:'Setup', site:'Site', problems:'Problems', objectives:'Objectives',
  forma_workflow:'Forma Workflow', proposals:'Proposals', analyses:'Analyses',
  comparison:'Comparison', forma_board:'Forma Board', revit:'Revit',
  final:'Final Concept', presentation:'Presentation', complete:'Complete',
};

export default function ProjectList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.projects.list().then(res => {
      setLoading(false);
      if (res.ok) setProjects(res.data);
      else setError(res.error);
    });
  }, []);

  async function handleDelete(p: Project) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await api.projects.delete(p.id);
    if (res.ok) {
      setProjects(prev => prev.filter(x => x.id !== p.id));
      toast.success('Project deleted');
    } else toast.error(res.error);
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Top nav */}
      <header style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'0 var(--space-8)', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', fontWeight:600, fontSize:'var(--text-md)' }}>
          <div style={{ width:26,height:26,background:'var(--blue)',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}>
            <MapPin size={14} strokeWidth={2.5} />
          </div>
          Smart City Site Planner
        </div>
        <div style={{ display:'flex', gap:'var(--space-3)', alignItems:'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Home</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>
            <Plus size={14}/> New Project
          </button>
        </div>
      </header>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'var(--space-10) var(--space-8)' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Your Smart City planning workspaces</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            <Plus size={15}/> New Project
          </button>
        </div>

        {loading && (
          <div className="loading-overlay"><div className="spinner"/></div>
        )}
        {error && (
          <div className="info-banner error" style={{marginBottom:'var(--space-6)'}}>
            <AlertTriangle size={16}/> {error}
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <FolderOpen size={40} className="empty-state-icon" />
              <div className="empty-state-title">No projects yet</div>
              <p className="empty-state-desc">Start your first Smart City planning project to track your Forma workflow, proposals, and analyses.</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/projects/new')}>
                <Plus size={15}/> Start Project
              </button>
            </div>
          </div>
        )}
        {!loading && projects.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Location</th>
                  <th>Site Area</th>
                  <th>Stage</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} style={{cursor:'pointer'}} onClick={() => navigate(`/projects/${p.id}`)}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'var(--space-2)', flexWrap:'wrap'}}>
                        {p.is_demo && <span className="badge badge-demo">DEMO</span>}
                        <span style={{fontWeight:'var(--weight-medium)'}}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{color:'var(--text-secondary)'}}>
                      {p.city ? `${p.city}, ${p.state}` : <span style={{color:'var(--text-tertiary)'}}>—</span>}
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        {p.site_area_km2 > 0 ? (
                          <>
                            <span className="text-mono">{p.site_area_km2.toFixed(2)} km²</span>
                            {p.site_area_km2 < 1.0 && <AlertTriangle size={13} color="var(--amber)" title="Below 1 km² minimum"/>}
                          </>
                        ) : <span style={{color:'var(--text-tertiary)'}}>—</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-muted">{STAGE_LABELS[p.stage] || p.stage}</span>
                    </td>
                    <td style={{color:'var(--text-secondary)', fontSize:'var(--text-sm)'}}>
                      {new Date(p.updated_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{display:'flex',gap:'var(--space-2)'}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/projects/${p.id}`)}>
                          Open <ArrowRight size={12}/>
                        </button>
                        {!p.is_demo && (
                          <button className="btn btn-icon" onClick={() => handleDelete(p)} title="Delete project" aria-label="Delete">
                            <Trash2 size={14} color="var(--red)"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
