import { useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAppStore } from '../../store/appStore';
import { api } from '../../api/client';
import './AppShell.css';

export default function AppShell() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, setCurrentProject, sidebarOpen } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    if (currentProject?.id === projectId) return;

    api.projects.get(projectId).then((res) => {
      if (res.ok) {
        setCurrentProject(res.data);
      } else {
        navigate('/projects');
      }
    });
  }, [projectId, currentProject?.id, setCurrentProject, navigate]);

  return (
    <div className="shell">
      <Sidebar />
      <div className={`shell-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <TopBar />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
