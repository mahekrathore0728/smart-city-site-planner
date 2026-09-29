import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, AlertTriangle, Database, Target,
  CheckSquare, Building2, FileBarChart2, GitCompare,
  Layout, Cpu, Lightbulb, TrendingUp, Presentation,
  Video, Users, ClipboardList, ChevronRight, ArrowLeft,
  MapIcon, Layers
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import './Sidebar.css';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  group?: string;
}

const NAV_GROUPS = [
  {
    label: 'Project Workspace',
    items: [
      { key: '', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
      { key: 'site', icon: <MapPin size={15} />, label: 'Site & Location' },
      { key: 'problems', icon: <AlertTriangle size={15} />, label: 'Context & Problems' },
      { key: 'sources', icon: <Database size={15} />, label: 'Data Sources' },
      { key: 'objectives', icon: <Target size={15} />, label: 'Objectives' },
    ],
  },
  {
    label: 'Planning & Options',
    items: [
      { key: 'forma', icon: <CheckSquare size={15} />, label: 'Planning Workflow' },
      { key: 'proposals/a', icon: <Building2 size={15} />, label: 'Design Option A' },
      { key: 'proposals/b', icon: <Building2 size={15} />, label: 'Design Option B' },
      { key: 'analyses', icon: <FileBarChart2 size={15} />, label: 'Site Analysis' },
      { key: 'comparison', icon: <GitCompare size={15} />, label: 'Design Comparison' },
      { key: 'forma-board', icon: <Layout size={15} />, label: 'Design Board' },
    ],
  },
  {
    label: 'Building & Strategy',
    items: [
      { key: 'revit', icon: <Cpu size={15} />, label: 'Building Development' },
      { key: 'final', icon: <Lightbulb size={15} />, label: 'Final Concept' },
      { key: 'impact', icon: <TrendingUp size={15} />, label: 'Impact & Strategy' },
    ],
  },
  {
    label: 'Deliverables & Readiness',
    items: [
      { key: 'presentation', icon: <Presentation size={15} />, label: 'Project Presentation' },
      { key: 'walkthrough', icon: <Video size={15} />, label: 'Project Walkthrough' },
      { key: 'team', icon: <Users size={15} />, label: 'Team & Roles' },
      { key: 'checklist', icon: <ClipboardList size={15} />, label: 'Project Readiness' },
    ],
  },
];

export default function Sidebar() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject } = useAppStore();
  const navigate = useNavigate();

  return (
    <aside className="sidebar" aria-label="Navigation">
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate('/projects')} role="button" tabIndex={0}>
        <div className="sidebar-logo" style={{ background: 'var(--sage)' }}>
          <Layers size={16} color="#0B0F0E" strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-main">UrbanPlan</span>
          <span className="sidebar-brand-sub">Urban Planning Platform</span>
        </div>
      </div>

      {/* Project name */}
      {currentProject && (
        <div className="sidebar-project">
          <div className="sidebar-project-label">Active Project</div>
          <div className="sidebar-project-name">
            <span className="truncate">{currentProject.name.replace(/^\[DEMO\]\s*/i, '')}</span>
          </div>
          {currentProject.city && (
            <div className="sidebar-project-meta">
              <MapPin size={10} />
              {currentProject.city}, {currentProject.state}
            </div>
          )}
          {currentProject.site_area_km2 < 1.0 && currentProject.site_area_km2 > 0 && (
            <div className="sidebar-area-warn">
              ⚠ Site &lt; 1.0 km²
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map((item) => {
              const to = projectId
                ? `/projects/${projectId}${item.key ? `/${item.key}` : ''}`
                : '#';
              return (
                <NavLink
                  key={item.key}
                  to={to}
                  end={item.key === ''}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                  <ChevronRight size={12} className="sidebar-link-arrow" />
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-back-btn" onClick={() => navigate('/projects')}>
          <ArrowLeft size={13} />
          All Projects
        </button>
      </div>
    </aside>
  );
}
