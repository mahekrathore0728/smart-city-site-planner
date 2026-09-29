import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, MapPin, Play,
  LayoutGrid, BarChart2, GitCompare, Lightbulb,
  CheckCircle2, Leaf, Users, Cpu, Map,
  Layers, Maximize2, Compass, Box
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeHeroView, setActiveHeroView] = useState<'site' | 'context' | 'analysis' | 'options'>('site');

  function handleStartPlanning() {
    navigate(user ? '/projects' : '/signup');
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="lp-root">

      {/* ── NAVBAR ── */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand" onClick={() => navigate('/')}>
            <div className="lp-nav-logo">
              <Map size={16} strokeWidth={2.5} />
            </div>
            <span className="lp-nav-name">
              Smart City <span className="lp-nav-name-sub">Site Planner</span>
            </span>
          </div>

          <nav className="lp-nav-links">
            <button className="lp-nav-link" onClick={() => scrollTo('process')}>Projects</button>
            <button className="lp-nav-link" onClick={() => scrollTo('process')}>Workflows</button>
            <button className="lp-nav-link" onClick={() => scrollTo('platform')}>Resources</button>
            <button className="lp-nav-link" onClick={() => scrollTo('cta')}>About</button>
          </nav>

          <button className="lp-nav-cta" onClick={handleStartPlanning}>
            Open Planner <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />

        {/* Location pill */}
        <div className="lp-hero-location">
          <MapPin size={13} />
          Mahalunge, Pune · 1.20 km²
        </div>

        {/* Left content */}
        <div className="lp-hero-content">
          <p className="lp-hero-eyebrow">URBAN PLANNING PLATFORM</p>
          <h1 className="lp-hero-title">
            Shape the city<br />
            <span className="lp-hero-title-blue">before you build it.</span>
          </h1>
          <p className="lp-hero-sub">
            Analyze. Design. Create sustainable and resilient urban spaces<br />
            with data-driven insights and performance-backed site proposals.
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-btn-primary" onClick={handleStartPlanning}>
              Start Planning <ArrowRight size={15} />
            </button>
            <button className="lp-btn-ghost" onClick={() => scrollTo('process')}>
              <span className="lp-play-icon"><Play size={12} fill="currentColor" /></span>
              Explore How It Works
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="lp-hero-scroll">
          <div className="lp-scroll-mouse">
            <div className="lp-scroll-dot" />
          </div>
          <span>Scroll</span>
        </div>

        {/* Bottom-right view mode bar */}
        <div className="lp-hero-viewbar">
          <button
            className={`lp-viewbar-btn ${activeHeroView === 'site' ? 'active' : ''}`}
            onClick={() => setActiveHeroView('site')}
          >
            <LayoutGrid size={14} /> Site
          </button>
          <button
            className={`lp-viewbar-btn ${activeHeroView === 'context' ? 'active' : ''}`}
            onClick={() => setActiveHeroView('context')}
          >
            <MapPin size={14} /> Context
          </button>
          <button
            className={`lp-viewbar-btn ${activeHeroView === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveHeroView('analysis')}
          >
            <BarChart2 size={14} /> Analysis
          </button>
          <button
            className={`lp-viewbar-btn ${activeHeroView === 'options' ? 'active' : ''}`}
            onClick={() => setActiveHeroView('options')}
          >
            <GitCompare size={14} /> Options
          </button>
        </div>
      </section>

      {/* ── PROCESS SECTION ── */}
      <section className="lp-process" id="process">
        <div className="lp-process-inner">
          {/* Left */}
          <div className="lp-process-left">
            <p className="lp-section-eyebrow">THE PROCESS</p>
            <h2 className="lp-process-title">From Site to Strategy</h2>
            <p className="lp-process-desc">
              A simple, connected workflow to turn your ideas into real, data-backed urban solutions.
            </p>
          </div>

          {/* Right: 4 steps */}
          <div className="lp-steps">
            {[
              { n: '01', icon: <MapPin size={20} />, title: 'Site Context', desc: 'Understand your site, terrain, and contextual surroundings.' },
              { n: '02', icon: <LayoutGrid size={20} />, title: 'Design Options', desc: 'Explore multiple planning alternatives and massing schemes.' },
              { n: '03', icon: <BarChart2 size={20} />, title: 'Environmental Analysis', desc: 'Evaluate climate, noise, wind, daylight, and carbon potential.' },
              { n: '04', icon: <Leaf size={20} />, title: 'Final Concept', desc: 'Compare, refine and choose the optimal site proposal.' },
            ].map((step, i) => (
              <div key={step.n} className="lp-step-wrap">
                <div className="lp-step">
                  <div className="lp-step-icon">{step.icon}</div>
                  <p className="lp-step-num">{step.n}</p>
                  <h3 className="lp-step-title">{step.title}</h3>
                  <p className="lp-step-desc">{step.desc}</p>
                </div>
                {i < 3 && <div className="lp-step-arrow"><ArrowRight size={16} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM SECTION ── */}
      <section className="lp-platform" id="platform">
        <div className="lp-platform-inner">
          {/* Left: mock workspace */}
          <div className="lp-workspace-frame">
            <div className="lp-workspace-topbar">
              <div className="lp-ws-logo">
                <Map size={13} strokeWidth={2.5} />
                <span>Smart City Site Planner</span>
              </div>
              <div className="lp-ws-topbar-icons">
                <div className="lp-ws-dot" />
                <div className="lp-ws-dot" />
              </div>
            </div>
            <div className="lp-workspace-body">
              {/* Sidebar */}
              <div className="lp-ws-sidebar">
                {['Home', 'Site Design', 'Analysis', 'Design Options', 'Board', 'Settings'].map((item, i) => (
                  <div key={item} className={`lp-ws-nav-item ${i === 1 ? 'active' : ''}`}>
                    <div className="lp-ws-nav-dot" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="lp-ws-main">
                {/* Map area */}
                <div className="lp-ws-map">
                  <img src="/hero-city.jpg" alt="Site plan aerial" />
                  <div className="lp-ws-map-overlay" />
                  <div className="lp-ws-map-toolbar">
                    <div className="lp-ws-tb-btn"><Layers size={11} /></div>
                    <div className="lp-ws-tb-btn"><Box size={11} /></div>
                    <div className="lp-ws-tb-btn"><Compass size={11} /></div>
                    <div className="lp-ws-tb-btn"><Maximize2 size={11} /></div>
                  </div>
                </div>

                {/* Right panel */}
                <div className="lp-ws-panel">
                  <div className="lp-ws-panel-header">Analysis Results</div>
                  <div className="lp-ws-analysis-list">
                    {[
                      { label: 'Sun Hours', color: '#4ade80' },
                      { label: 'Daylight Potential', color: '#facc15' },
                      { label: 'Wind Analysis', color: '#4ade80' },
                      { label: 'Noise', color: '#4ade80' },
                      { label: 'Solar Energy', color: '#60a5fa' },
                    ].map(a => (
                      <div key={a.label} className="lp-ws-analysis-row">
                        <span>{a.label}</span>
                        <div className="lp-ws-analysis-dot" style={{ backgroundColor: a.color, color: a.color }} />
                      </div>
                    ))}
                  </div>

                  <div className="lp-ws-panel-header" style={{ marginTop: 14 }}>Area Metrics</div>
                  <div className="lp-ws-metrics">
                    <div className="lp-ws-bar-chart">
                      {[40, 65, 30, 85, 50, 75].map((h, i) => (
                        <div key={i} className="lp-ws-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="lp-ws-donut">
                      <svg viewBox="0 0 60 60" width="60" height="60">
                        <circle cx="30" cy="30" r="22" fill="none" stroke="#1e293b" strokeWidth="6" />
                        <circle cx="30" cy="30" r="22" fill="none" stroke="#3B82F6" strokeWidth="6"
                          strokeDasharray="100 38" strokeDashoffset="25" strokeLinecap="round" />
                      </svg>
                      <div className="lp-ws-donut-label">
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Total Area</div>
                        <div style={{ fontSize: 8, color: '#94a3b8' }}>1.00 km²</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div className="lp-platform-copy">
            <p className="lp-section-eyebrow">ONE PLATFORM. ENDLESS POSSIBILITIES.</p>
            <h2 className="lp-platform-title">
              One workspace for the<br />complete planning process.
            </h2>
            <p className="lp-platform-desc">
              Visualize your site, run analysis, compare options and bring your vision to life — all in one place.
            </p>
            <ul className="lp-checklist">
              {[
                'Interactive maps & 3D view',
                'Built-in environmental analysis tools',
                'Easy comparison of design options',
                'Seamless Revit / BIM workflow integration',
              ].map(item => (
                <li key={item} className="lp-checklist-item">
                  <CheckCircle2 size={16} className="lp-check-icon" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="lp-btn-primary" onClick={handleStartPlanning} style={{ marginTop: 32 }}>
              Start Planning <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="lp-cta" id="cta">
        <div className="lp-cta-bg" />
        <div className="lp-cta-inner">
          {/* Left */}
          <div className="lp-cta-left">
            <p className="lp-section-eyebrow" style={{ color: '#64748b' }}>READY TO BUILD A SMARTER TOMORROW?</p>
            <h2 className="lp-cta-title">Start shaping your next site.</h2>
            <p className="lp-cta-desc">
              Create, analyze and compare your smart-city site proposals with performance-driven insights.
            </p>
            <button className="lp-btn-primary" onClick={handleStartPlanning} style={{ marginTop: 32 }}>
              Create Project <ArrowRight size={15} />
            </button>
          </div>

          {/* Right: benefits */}
          <div className="lp-benefits">
            <div className="lp-benefit">
              <div className="lp-benefit-icon" style={{ color: '#4ade80' }}>
                <Leaf size={22} />
              </div>
              <h3 className="lp-benefit-title">Sustainable</h3>
              <p className="lp-benefit-desc">Greener cities. Healthier lives.</p>
            </div>
            <div className="lp-benefit">
              <div className="lp-benefit-icon" style={{ color: '#60a5fa' }}>
                <Users size={22} />
              </div>
              <h3 className="lp-benefit-title">People-Centric</h3>
              <p className="lp-benefit-desc">Better spaces. Stronger communities.</p>
            </div>
            <div className="lp-benefit">
              <div className="lp-benefit-icon" style={{ color: '#a78bfa' }}>
                <Cpu size={22} />
              </div>
              <h3 className="lp-benefit-title">Future-Ready</h3>
              <p className="lp-benefit-desc">Built for what's next.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-nav-logo" style={{ width: 26, height: 26, borderRadius: 6 }}>
              <Map size={13} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Smart City Site Planner
            </span>
          </div>
          <p className="lp-footer-copy">
            © {new Date().getFullYear()} Smart City Site Planner · SIH 2026 Problem Statement 26114
          </p>
          <div className="lp-footer-links">
            <button className="lp-nav-link" onClick={() => navigate('/login')}>Login</button>
            <button className="lp-nav-link" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
