import { useNavigate } from 'react-router-dom';
import { Menu, ExternalLink, LogOut, User } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import './TopBar.css';

const STAGE_LABELS: Record<string, string> = {
  setup: 'Setup',
  site: 'Site',
  problems: 'Context & Problems',
  objectives: 'Objectives',
  forma_workflow: 'Planning Workflow',
  proposals: 'Design Options',
  analyses: 'Site Analysis',
  comparison: 'Design Comparison',
  forma_board: 'Design Board',
  revit: 'Building Development',
  final: 'Final Concept',
  presentation: 'Project Presentation',
  complete: 'Complete',
};

export default function TopBar() {
  const { currentProject, setSidebarOpen, sidebarOpen, user, logout } = useAppStore();
  const navigate = useNavigate();

  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <button
          className="btn btn-ghost btn-icon topbar-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        {currentProject && (
          <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
            <button
              className="breadcrumb-link"
              onClick={() => navigate('/projects')}
            >
              Projects
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {currentProject.name.replace(/^\[DEMO\]\s*/i, '')}
            </span>
          </nav>
        )}
      </div>

      <div className="topbar-right">
        {currentProject && (
          <div className="topbar-stage">
            <span className="topbar-stage-label">Stage:</span>
            <span className="topbar-stage-value">
              {STAGE_LABELS[currentProject.stage] || currentProject.stage}
            </span>
          </div>
        )}
        <a
          href="https://forma.autodesk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          title="Open Autodesk Forma"
        >
          <ExternalLink size={13} />
          Autodesk Forma
        </a>

        <div className="topbar-user">
          <span className="topbar-user-name">
            <User size={13} /> {user?.full_name || 'Planner'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign Out">
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
