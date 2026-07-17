import { useReveal } from '../hooks/useReveal';

const TAGS = ['14 h → 3 h per hero shot', '5 subscriptions → 1', 'Zero exports'];

export default function UseCase() {
  const leftRef = useReveal<HTMLDivElement>();
  const rightRef = useReveal<HTMLDivElement>();

  return (
    <section className="page-section" data-screen-label="Use case">
      <span id="use-case" className="anchor-target" aria-hidden="true" />
      <div className="container usecase-grid">
        <div ref={leftRef} className="reveal">
          <div className="eyebrow">Use case</div>
          <blockquote className="usecase-quote">
            &ldquo;I used to lose whole evenings gluing Midjourney frames to Blender. Now the concept, the mesh and the final shot happen in one window — a product hero shot takes an evening coffee, not a weekend.&rdquo;
          </blockquote>
          <div className="usecase-person">
            <img className="usecase-avatar" src="/assets/pipeline/usecase-avatar.webp" alt="Asya Kim" width={56} height={56} loading="lazy" />
            <div>
              <div className="name">Asya Kim</div>
              <div className="role">Freelance 3D generalist · product visualization, Upwork Top Rated</div>
            </div>
          </div>
          <div className="usecase-tags">
            {TAGS.map((t) => <span className="pill-tag" key={t}>{t}</span>)}
          </div>
        </div>
        <div ref={rightRef} className="reveal">
          <div className="usecase-render">
            <img src="/assets/pipeline/usecase-render.webp" alt="Asya's hero shot" loading="lazy" />
          </div>
          <div className="usecase-caption">Client-ready hero shot — prompted, meshed and rendered in one Quadcode session.</div>
        </div>
      </div>
    </section>
  );
}
