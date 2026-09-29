import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ToastStack from './components/ui/ToastStack';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Workspace projects
import ProjectList from './pages/ProjectList';
import CreateProject from './pages/CreateProject';

// Project Workspace pages
import Dashboard from './pages/project/Dashboard';
import SiteLocation from './pages/project/SiteLocation';
import LocalProblems from './pages/project/LocalProblems';
import DataSources from './pages/project/DataSources';
import Objectives from './pages/project/Objectives';
import FormaWorkflow from './pages/project/FormaWorkflow';
import ProposalPage from './pages/project/ProposalPage';
import Analyses from './pages/project/Analyses';
import Comparison from './pages/project/Comparison';
import FormaBoard from './pages/project/FormaBoard';
import RevitIntegration from './pages/project/RevitIntegration';
import FinalConcept from './pages/project/FinalConcept';
import ImpactImplementation from './pages/project/ImpactImplementation';
import Presentation from './pages/project/Presentation';
import WalkthroughPage from './pages/project/WalkthroughPage';
import Team from './pages/project/Team';
import SIHChecklist from './pages/project/SIHChecklist';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<CreateProject />} />

          {/* Project workspace */}
          <Route path="/projects/:projectId" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="site" element={<SiteLocation />} />
            <Route path="problems" element={<LocalProblems />} />
            <Route path="sources" element={<DataSources />} />
            <Route path="objectives" element={<Objectives />} />
            <Route path="forma" element={<FormaWorkflow />} />
            <Route path="proposals/a" element={<ProposalPage label="1" />} />
            <Route path="proposals/b" element={<ProposalPage label="2" />} />
            <Route path="options/1" element={<ProposalPage label="1" />} />
            <Route path="options/2" element={<ProposalPage label="2" />} />
            <Route path="analyses" element={<Analyses />} />
            <Route path="comparison" element={<Comparison />} />
            <Route path="forma-board" element={<FormaBoard />} />
            <Route path="revit" element={<RevitIntegration />} />
            <Route path="final" element={<FinalConcept />} />
            <Route path="impact" element={<ImpactImplementation />} />
            <Route path="presentation" element={<Presentation />} />
            <Route path="walkthrough" element={<WalkthroughPage />} />
            <Route path="team" element={<Team />} />
            <Route path="checklist" element={<SIHChecklist />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastStack />
    </BrowserRouter>
  );
}
