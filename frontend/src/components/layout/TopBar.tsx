import { useNavigate } from 'react-router-dom';
import { Menu, ExternalLink, LogOut, User } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import './TopBar.css';

const STAGE_LABELS: Record<string, string> = {
  setup: 'Setup',
  site: 'Site Planning',
  problems: 'Context & Constraints',
  objectives: 'Objectives',
  forma_workflow: 'Forma Workflow',
  proposals: 'Design Options',
  analyses: 'Environmental Analysis',
  comparison: 'Option Comparison',
  forma_board: 'Planning Board',
  revit: 'Building Integration',
  final: 'Final Concept',
  presentation: 'Presentation Deck',
  complete: 'Finalized',
};

export default function TopBar() {
  const { currentProject, setSidebarOpen, sidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

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
          </nav>
        )}
      </div>

      <div className="topbar-right">
        {currentProject && (
          <div className="topbar-stage">
            <span className="topbar-stage-label">Status:</span>
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
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <ExternalLink size={13} />
          Autodesk Forma
        </a>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderLeft: '1px solid var(--border)', paddingLeft: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {user.full_name}
            </span>
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
