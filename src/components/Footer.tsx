import { useState } from 'react';
import LegalModal from './LegalModal';

export default function Footer() {
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="site-footer">
      <div className="row">
        <a href="#" className="footer-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="brand">Quadcode</span>
          <span className="ai">AI</span>
        </a>
        <div className="footer-links">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); setLegal('privacy'); }}>Privacy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); setLegal('terms'); }}>Terms</a>
          <a href="mailto:hello@quadcode.ai">hello@quadcode.ai</a>
          <span className="copyright">© 2026 Quadcode AI</span>
        </div>
      </div>
      <LegalModal kind={legal} onClose={() => setLegal(null)} />
    </footer>
  );
}
