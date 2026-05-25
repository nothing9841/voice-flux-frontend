import React from 'react';
import { Sparkles, Globe, UploadCloud, History, Play, CheckCircle, ArrowRight, Video, Languages, Shield, HelpCircle } from 'lucide-react';

const LANDING_LANGUAGES = [
  { eng: 'Hindi', native: 'हिंदी' },
  { eng: 'Marathi', native: 'मराठी' },
  { eng: 'Bengali', native: 'বাংলা' },
  { eng: 'Gujarati', native: 'ગુજરાતી' },
  { eng: 'Tamil', native: 'தமிழ்' },
  { eng: 'Telugu', native: 'తెలుగు' },
  { eng: 'Kannada', native: 'ಕನ್ನಡ' },
  { eng: 'Malayalam', native: 'മലയാളം' },
  { eng: 'Urdu', native: 'اردو' },
  { eng: 'Odia', native: 'ଓଡ଼ିଆ' }
];

export default function Landing({ onGetStarted, onLogin }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-body fade-in">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-bottom-right"></div>

      {/* Translucent Sticky Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Languages className="logo-icon" size={28} />
            <span>VoiceFlux</span>
          </div>
          <div className="nav-links">
            <button className="nav-link-btn" onClick={() => scrollToSection('features')}>Features</button>
            <button className="nav-link-btn" onClick={() => scrollToSection('languages')}>Languages</button>
            <button className="nav-link-btn" onClick={onLogin}>Login</button>
            <button className="btn-nav-primary" onClick={() => onGetStarted(false)}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="badge">
          <Sparkles size={16} />
          <span>Next-Generation AI Multilingual Video Dubber</span>
        </div>
        <h1 className="hero-headline">
          Dub Your Videos into <br />
          <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Indian Languages
          </span> with AI
        </h1>
        <p className="hero-subtitle">
          Break language barriers instantly. Streamline translation, subtitle generation, and audio synthesis in 10 major Indian regional languages with advanced sync-matching voice technology.
        </p>

        <div className="hero-ctas">
          <button className="btn-hero-primary" onClick={() => onGetStarted(false)}>
            Start Dubbing Now <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline' }} />
          </button>
          <button className="btn-hero-secondary" onClick={() => scrollToSection('languages')}>
            Supported Languages
          </button>
        </div>

        {/* Premium Dashboard Mockup Panel (Interactive Pure CSS Visual Mockup) */}
        <div className="dashboard-mockup glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>voiceflux_workspace_v1.0</span>
            </div>
            <div style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle size={14} /> Model Ready
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            {/* Left: Video Player mockup */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#020205', borderRadius: '16px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <Play size={40} style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.5))' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.85rem', textAlign: 'center', color: '#f8fafc' }}>
                  "नमस्कार, वॉइसफ्लक्स एआई डबिंग सॉफ्टवेयर में आपका स्वागत है।"
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.25rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Hindi Dub Preview</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>00:14 / 01:30</span>
              </div>
            </div>

            {/* Right: Settings panel mockup */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Target Languages</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-color))', color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Hindi (हिंदी)</span>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tamil</span>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Telugu</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Processing Steps</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} /> <span>Extracting Audio & STT (Whisper)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} /> <span>Translating Subtitles</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                    <div className="spinner-small" style={{ width: '14px', height: '14px', border: '1.5px solid rgba(255,255,255,0.2)', borderLeftColor: 'var(--accent-color)' }}></div>
                    <span style={{ color: 'var(--accent-color)' }}>Generating TTS Voices (100% matched)</span>
                  </div>
                </div>
              </div>

              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', position: 'relative', marginTop: '0.5rem' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '70%', background: 'linear-gradient(to right, var(--accent-blue), var(--accent-color))', borderRadius: '2px', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Designed for Content Creators & Educators</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Sparkles size={24} />
            </div>
            <h3>AI Voice Translation</h3>
            <p>Convert audio dynamically with natural-sounding localized voice synthesis that keeps pace perfectly with video timelines.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Languages size={24} />
            </div>
            <h3>10 Indian Languages</h3>
            <p>Direct translation to the biggest regional markets including Hindi, Marathi, Bengali, Tamil, Kannada, Malayalam, and Urdu.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <UploadCloud size={24} />
            </div>
            <h3>Fast Cloud Upload</h3>
            <p>Upload video chunks directly and securely to the cloud with full pipeline stability and parallel stream performance.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <History size={24} />
            </div>
            <h3>Dashboard & History</h3>
            <p>Track dubbed files, retrieve output records, view time-synchronized subtitles, and download dubbed files in one click.</p>
          </div>
        </div>
      </section>

      {/* Supported Languages Showcase Section */}
      <section id="languages" className="languages-section">
        <h2 className="section-title">Support Across Major Indian Languages</h2>
        <div className="languages-showcase">
          {LANDING_LANGUAGES.map((lang) => (
            <div key={lang.eng} className="native-lang-badge">
              <span className="eng-name">{lang.eng}</span>
              <span className="native-name">{lang.native}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="final-cta-section">
        <div className="cta-banner glass-panel" style={{ background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, rgba(11, 15, 25, 0.4) 100%)' }}>
          <h2>Dub Your First Video Free</h2>
          <p>Tap into a huge network of Indian content consumers. Register today and instantly translate your video messages.</p>
          <button className="btn-hero-primary" onClick={() => onGetStarted(false)} style={{ margin: '0 auto' }}>
            Get Started Now <ArrowRight size={18} style={{ marginLeft: '0.5rem', display: 'inline' }} />
          </button>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo" style={{ fontSize: '1.5rem', pointerEvents: 'none' }}>
              <Languages className="logo-icon" size={24} />
              <span>VoiceFlux</span>
            </div>
            <p>Empowering educators, enterprises, and video creators to share knowledge without language barriers.</p>
          </div>
          <div className="footer-rights">
            &copy; {new Date().getFullYear()} VoiceFlux. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
