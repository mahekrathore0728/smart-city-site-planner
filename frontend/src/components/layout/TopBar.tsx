import { useNavigate, useParams } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import './TopBar.css';

const STAGE_LABELS: Record<string, string> = {
  setup: 'Setup',
  site: 'Site',
  problems: 'Problems',
  objectives: 'Objectives',
  forma_workflow: 'Forma Workflow',
  proposals: 'Proposals',
  analyses: 'Analyses',
  comparison: 'Comparison',
  forma_board: 'Forma Board',
  revit: 'Revit',
  final: 'Final Concept',
  presentation: 'Presentation',
  complete: 'Complete',
};

export default function TopBar() {
  const { currentProject, setSidebarOpen, sidebarOpen } = useAppStore();
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
              {currentProject.name}
            </span>
            {currentProject.is_demo && (
              <span className="badge badge-demo" style={{ marginLeft: 8 }}>DEMO</span>
            )}
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
      </div>
    </header>
  );
}
