import { useReveal } from '../hooks/useReveal';

const FEATURES = [
  {
    title: 'Five subscriptions → one',
    desc: 'Concept, texture, video and render models behind a single balance. No juggling top-ups across five dashboards.',
    path: 'M13 3 23 8.5 13 14 3 8.5Z M23 13.5 13 19 3 13.5 M23 18 13 23.5 3 18',
  },
  {
    title: 'Zero export–import',
    desc: 'Iterate where the asset lives. Change the prompt — the scene updates, with history intact.',
    path: 'M21 8a9 9 0 0 0-15.5-2M5 3v3.5H8.5 M5 18a9 9 0 0 0 15.5 2M21 23v-3.5H17.5',
  },
  {
    title: 'Assets arrive scene-ready',
    desc: 'Meshes come with clean topology, unwrapped UVs and PBR maps already wired into materials.',
    path: 'M13 2.5 22.5 8v10L13 23.5 3.5 18V8Z M13 23.5V13.5 M3.5 8 13 13.5 22.5 8',
  },
];

export default function Features() {
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>();

  return (
    <section className="page-section" data-screen-label="Features">
      <span id="features" className="anchor-target" aria-hidden="true" />
      <div className="container">
        <div ref={headRef} className="features-head reveal">
          <div className="eyebrow">Why it sticks</div>
          <h2 className="section-title">Built around the pain,<br />not the demo reel</h2>
        </div>
        <div ref={gridRef} className="features-grid reveal">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d={f.path} stroke="#0932b9" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="title">{f.title}</div>
              <p>{f.desc}</p>
            </div>
          ))}
          <div className="feature-card">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="3" y="4" width="20" height="14" rx="2.5" stroke="#0932b9" strokeWidth="1.7" />
              <path d="M11 8.5v5l4.5-2.5Z" stroke="#0932b9" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M9 22h8" stroke="#0932b9" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <div className="title">Render in the same tab</div>
            <p>Queue a cloud render and keep sculpting. No overnight babysitting of a local GPU.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
