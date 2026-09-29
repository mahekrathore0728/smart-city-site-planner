import { ArrowRight, BarChart3, BookOpen, Leaf, Map, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Landing.css';

const workflow = [
  {
    number: '01',
    icon: Map,
    title: 'Site Context',
    description: 'Define the site and understand its surroundings.',
  },
  {
    number: '02',
    icon: Layers3,
    title: 'Design Options',
    description: 'Develop alternative planning concepts.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Environmental Analysis',
    description: 'Evaluate environmental and spatial performance.',
  },
  {
    number: '04',
    icon: Leaf,
    title: 'Final Concept',
    description: 'Compare options and develop the selected concept.',
  },
];

const capabilities = [
  {
    icon: Layers3,
    title: 'SITE PLANNING',
    description: 'Build and shape your site',
  },
  {
    icon: BookOpen,
    title: 'CONTEXT',
    description: 'Understand the surroundings',
  },
  {
    icon: BarChart3,
    title: 'ANALYSIS',
    description: 'Make data-driven decisions',
  },
  {
    icon: Leaf,
    title: 'DESIGN OPTIONS',
    description: 'Explore and compare',
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand">
            <span className="brand-icon">
              <Layers3 size={20} strokeWidth={2.4} />
            </span>
            <span>UrbanPlan</span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#process">Projects</a>
            <a href="#process">Methodology</a>
            <a href="#workspace">Resources</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login-link">
              Login
            </Link>
            <Link to="/projects" className="landing-pill landing-pill-primary">
              Open Planner
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-image" aria-hidden="true">
            <img
              src="/images/city-masterplan-hero.jpg"
              alt=""
            />
          </div>

          <div className="landing-hero-overlay" />

          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-content">
              <p className="landing-eyebrow">
                URBAN PLANNING / SMARTER CITIES
              </p>

              <h1>
                Plan Better Places.
                <br />
                Design <span>Smarter Cities.</span>
              </h1>

              <p className="landing-hero-description">
                A professional workspace for site planning, urban analysis and
                design decisions.
              </p>

              <div className="landing-hero-actions">
                <Link
                  to="/projects/new"
                  className="landing-pill landing-pill-primary landing-pill-large"
                >
                  Start a Project
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/projects"
                  className="landing-pill landing-pill-outline landing-pill-large"
                >
                  Explore Workspace
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-capability-strip">
          <div className="landing-container capability-grid">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <div className="capability-item" key={title}>
                <div className="capability-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="landing-section process-section">
          <div className="landing-container">
            <div className="section-heading">
              <p className="landing-eyebrow">THE PROCESS</p>
              <h2>From Site to Strategy</h2>
              <p>
                A simple connected workflow to turn your ideas into real,
                data-backed urban solutions.
              </p>
            </div>

            <div className="workflow-grid">
              {workflow.map(({ number, icon: Icon, title, description }, index) => (
                <div className="workflow-wrap" key={number}>
                  <article className="workflow-card">
                    <div className="workflow-icon">
                      <Icon size={22} />
                    </div>

                    <div className="workflow-number">{number}</div>

                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>

                  {index < workflow.length - 1 && (
                    <div className="workflow-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workspace" className="landing-section workspace-section">
          <div className="landing-container workspace-grid">
            <div className="workspace-copy">
              <p className="landing-eyebrow">WORKSPACE PREVIEW</p>
              <h2>One workspace for the complete planning process.</h2>
              <p>
                From site analysis to final design, everything you need is in
                one place. Visualize, analyze, and make better decisions —
                faster.
              </p>

              <ul className="workspace-features">
                <li>Interactive 3D site planning</li>
                <li>Environmental analysis</li>
                <li>Design-option comparison</li>
                <li>Structured project workflow</li>
              </ul>
            </div>

            <div className="workspace-preview">
              <div className="preview-sidebar">
                <div className="preview-logo">
                  <Layers3 size={16} />
                  <span>UrbanPlan</span>
                </div>
                <span>Home</span>
                <span>Site Design</span>
                <span>Analysis</span>
                <span>Board</span>
                <span>Settings</span>
              </div>

              <div className="preview-main">
                <div className="preview-map">
                  <img src="/images/city-masterplan-hero.jpg" alt="" />
                </div>

                <div className="preview-analysis">
                  <strong>Site Analysis</strong>
                  {['Sun Hours', 'Daylight Potential', 'Microclimate', 'Wind Analysis', 'Noise', 'Solar Energy'].map(
                    (item) => (
                      <span key={item}>
                        <i />
                        {item}
                      </span>
                    )
                  )}
                </div>

                <div className="preview-bottom">
                  <div>
                    <strong>Design Options</strong>
                    <div className="preview-options">
                      <div>Option 1</div>
                      <div>Option 2</div>
                    </div>
                  </div>

                  <div className="preview-metrics">
                    <strong>Area Metrics</strong>
                    <b>1.00 km²</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-image" aria-hidden="true">
            <img src="/images/city-masterplan-hero.jpg" alt="" />
          </div>
          <div className="landing-cta-overlay" />

          <div className="landing-container landing-cta-inner">
            <div>
              <p className="landing-eyebrow">READY TO BUILD YOUR SMARTER CITY?</p>
              <h2>Start shaping your next site.</h2>
              <p>Turn site context into informed planning decisions.</p>

              <Link
                to="/projects/new"
                className="landing-pill landing-pill-primary landing-pill-large"
              >
                Create Project
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="cta-tags">
              <div>
                <Leaf size={22} />
                <strong>Sustainable</strong>
                <span>More green. More resilient.</span>
              </div>

              <div>
                <Layers3 size={22} />
                <strong>People-Centric</strong>
                <span>Better places. Healthier lives.</span>
              </div>

              <div>
                <BarChart3 size={22} />
                <strong>Future-Ready</strong>
                <span>Built for what's next.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-brand">
            <span className="brand-icon">
              <Layers3 size={18} />
            </span>
            <span>UrbanPlan</span>
          </div>

          <div className="footer-links">
            <a href="#process">Site Planning</a>
            <a href="#workspace">Workspace</a>
            <a href="#process">Methodology</a>
            <a href="#workspace">Resources</a>
          </div>
        </div>
      </footer>
    </div>
  );
}