import { useReveal } from '../hooks/useReveal';

const STAGES = [
  { id: 'pipeline-concept', title: '01 · Concept', desc: 'Frame straight from the prompt' },
  { id: 'pipeline-mesh', title: '02 · Mesh', desc: 'Generated with clean topology' },
  { id: 'pipeline-texture', title: '03 · Materials', desc: 'PBR maps applied in-scene' },
  { id: 'pipeline-render', title: '04 · Render', desc: 'Cloud render, color-graded' },
];

export default function Pipeline() {
  const headRef = useReveal<HTMLDivElement>();
  const chipRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>();

  return (
    <section className="page-section" data-screen-label="Pipeline">
      <span id="pipeline" className="anchor-target" aria-hidden="true" />
      <div className="container">
        <div ref={headRef} className="pipeline-head reveal">
          <div className="eyebrow">The pipeline, collapsed</div>
          <h2 className="section-title">From prompt to final render,<br />without leaving the window</h2>
          <p className="section-lede">One asset, one session. No exports, no version soup, no &ldquo;final_v7_FIX&rdquo;.</p>
        </div>
        <div ref={chipRef} className="prompt-chip reveal">
          <span className="tag">PROMPT</span>
          <span className="text">ancient stone golem, mossy runes, cinematic key light</span>
        </div>
        <div ref={gridRef} className="pipeline-grid reveal">
          {STAGES.map((s) => (
            <div className="pipeline-card" key={s.id}>
              <div className="frame">
                <img src={`/assets/pipeline/${s.id}.webp`} alt={s.title} loading="lazy" width={400} height={275} />
              </div>
              <div className="title">{s.title}</div>
              <div className="desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
