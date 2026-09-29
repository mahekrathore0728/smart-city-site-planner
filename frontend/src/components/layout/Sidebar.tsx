import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Compass, Layers,
  FileBarChart2, GitCompare, Layout, Cpu,
  Lightbulb, Presentation, ArrowLeft, Map, ClipboardCheck
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import './Sidebar.css';

const NAV_ITEMS = [
  { key: '', icon: <LayoutDashboard size={15} />, label: 'Overview' },
  { key: 'site', icon: <MapPin size={15} />, label: 'Site' },
  { key: 'problems', icon: <Compass size={15} />, label: 'Context' },
  { key: 'proposals/a', icon: <Layers size={15} />, label: 'Design Options' },
  { key: 'analyses', icon: <FileBarChart2 size={15} />, label: 'Analysis' },
  { key: 'comparison', icon: <GitCompare size={15} />, label: 'Comparison' },
  { key: 'forma-board', icon: <Layout size={15} />, label: 'Board' },
  { key: 'revit', icon: <Cpu size={15} />, label: 'Building' },
  { key: 'final', icon: <Lightbulb size={15} />, label: 'Final Concept' },
  { key: 'presentation', icon: <Presentation size={15} />, label: 'Presentation' },
  { key: 'checklist', icon: <ClipboardCheck size={15} />, label: 'SIH Checklist' },
];

export default function Sidebar() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject } = useAppStore();
  const navigate = useNavigate();

  return (
    <aside className="sidebar" aria-label="Navigation">
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate('/projects')} role="button" tabIndex={0}>
        <div className="sidebar-logo">
          <Map size={16} strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-main">Smart City</span>
          <span className="sidebar-brand-sub">Site Planner</span>
        </div>
      </div>

      {/* Active Project details */}
      {currentProject && (
        <div className="sidebar-project">
          <div className="sidebar-project-label">Active Workspace</div>
          <div className="sidebar-project-name">
            <span className="truncate">{currentProject.name}</span>
          </div>
          {(currentProject.location_name || currentProject.city) && (
            <div className="sidebar-project-meta">
              <MapPin size={11} style={{ flexShrink: 0 }} />
              <span className="truncate">
                {currentProject.location_name || `${currentProject.city}, ${currentProject.state}`}
              </span>
            </div>
          )}
          {currentProject.site_area_km2 > 0 && (
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              marginTop: 6,
              color: currentProject.site_area_km2 >= 1.0 ? 'var(--green)' : 'var(--amber)',
            }}>
              Area: {currentProject.site_area_km2.toFixed(2)} km²
              {currentProject.site_area_km2 >= 1.0 ? ' (✓ 1M m²)' : ' (⚠ < 1M m²)'}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-group">
          <div className="sidebar-group-label">Workspace Modules</div>
          {NAV_ITEMS.map((item) => {
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
              </NavLink>
            );
          })}
        </div>
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
