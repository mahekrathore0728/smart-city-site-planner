import { useNavigate } from 'react-router-dom';
import { MapPin, BarChart2, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <MapPin size={14} strokeWidth={2.5} />
          </div>
          <span>Smart City Site Planner</span>
        </div>
        <div className="landing-nav-actions">
          <span className="badge badge-blue">SIH 26114</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>View Projects</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects/new')}>Start Project</button>
        </div>
      </header>

      <main className="landing-hero">
        {/* SVG urban planning map background */}
        <svg className="landing-map-bg" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Roads grid */}
          <line x1="0" y1="120" x2="600" y2="120" stroke="#111" strokeWidth="8" opacity="0.4"/>
          <line x1="0" y1="260" x2="600" y2="260" stroke="#111" strokeWidth="8" opacity="0.4"/>
          <line x1="0" y1="400" x2="600" y2="400" stroke="#111" strokeWidth="8" opacity="0.4"/>
          <line x1="120" y1="0" x2="120" y2="500" stroke="#111" strokeWidth="8" opacity="0.4"/>
          <line x1="280" y1="0" x2="280" y2="500" stroke="#111" strokeWidth="8" opacity="0.4"/>
          <line x1="440" y1="0" x2="440" y2="500" stroke="#111" strokeWidth="8" opacity="0.4"/>
          {/* City blocks */}
          <rect x="130" y="130" width="140" height="120" fill="#111" opacity="0.05"/>
          <rect x="290" y="130" width="140" height="120" fill="#111" opacity="0.05"/>
          <rect x="130" y="270" width="140" height="120" fill="#111" opacity="0.05"/>
          <rect x="290" y="270" width="140" height="120" fill="#111" opacity="0.05"/>
          <rect x="0" y="130" width="110" height="120" fill="#111" opacity="0.05"/>
          <rect x="450" y="130" width="150" height="120" fill="#111" opacity="0.05"/>
          <rect x="0" y="270" width="110" height="120" fill="#111" opacity="0.05"/>
          {/* Buildings */}
          {[140,160,180,200,220,240,300,320,340,360,380,400].map((x, i) => (
            <rect key={i} x={x} y={140 + (i % 3) * 20} width="14" height={20 + (i % 4) * 8} fill="#111" opacity="0.15"/>
          ))}
          {/* Green spaces */}
          <rect x="130" y="130" width="40" height="40" fill="#10B981" opacity="0.3" rx="2"/>
          <rect x="380" y="280" width="50" height="50" fill="#10B981" opacity="0.3" rx="2"/>
          <rect x="0" y="0" width="110" height="110" fill="#10B981" opacity="0.15" rx="2"/>
          {/* Site boundary */}
          <rect x="80" y="80" width="440" height="340" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="10 6" opacity="0.6" rx="4"/>
          {/* Site label */}
          <text x="90" y="75" fontSize="11" fill="#2563EB" fontWeight="600" opacity="0.7">SITE BOUNDARY · 2.5 km²</text>
          {/* Transit line */}
          <line x1="0" y1="260" x2="600" y2="260" stroke="#7C3AED" strokeWidth="4" opacity="0.5"/>
          <circle cx="120" cy="260" r="8" fill="#7C3AED" opacity="0.6"/>
          <circle cx="280" cy="260" r="8" fill="#7C3AED" opacity="0.6"/>
          <circle cx="440" cy="260" r="8" fill="#7C3AED" opacity="0.6"/>
        </svg>

        <div className="landing-content">
          <div className="landing-sih-badge">
            <span className="badge badge-blue">SIH 26114 · Problem Statement</span>
          </div>
          <h1 className="landing-headline">
            SMART CITY<br />SITE PLANNER
          </h1>
          <p className="landing-sub">
            Design better places with data-driven site planning.<br/>
            A professional command center for Autodesk Forma workflows.
          </p>
          <div className="landing-ctas">
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/projects/new')}>
              Start Project <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-xl" onClick={() => navigate('/projects')}>
              View Projects
            </button>
          </div>

          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-icon"><MapPin size={18} /></div>
              <div className="landing-feature-title">Forma Workflow Documentation</div>
              <div className="landing-feature-desc">Track your Autodesk Forma site design progress step by step</div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon"><BarChart2 size={18} /></div>
              <div className="landing-feature-title">Analysis-Driven Decisions</div>
              <div className="landing-feature-desc">Document all 8 Forma analyses with findings and design responses</div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon"><FileText size={18} /></div>
              <div className="landing-feature-title">Presentation Builder</div>
              <div className="landing-feature-desc">Organize your 5–7 slide SIH presentation and Forma Board story</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing-footer-note">
        <ExternalLink size={12} style={{ display:'inline', verticalAlign:'middle', marginRight:4 }} />
        A companion platform for the Autodesk Forma Site Design workflow · Not affiliated with Autodesk Inc.
        &nbsp;·&nbsp; SIH Problem Statement 26114
      </footer>
    </div>
  );
}
