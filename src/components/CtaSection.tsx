import { useRef, useState, type FormEvent } from 'react';
import { useReveal } from '../hooks/useReveal';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same React-state-driven press feedback as the hero buttons (see
// Hero.tsx's usePress for the full reasoning).
const MIN_PRESS_MS = 130;
function usePress() {
  const [pressed, setPressed] = useState(false);
  const pressedAtRef = useRef(0);
  const down = () => {
    pressedAtRef.current = performance.now();
    setPressed(true);
  };
  const up = () => {
    const remaining = MIN_PRESS_MS - (performance.now() - pressedAtRef.current);
    if (remaining > 0) setTimeout(() => setPressed(false), remaining);
    else setPressed(false);
  };
  return {
    pressed,
    // Spread onto the `.label` span (the pointer-events:auto element) —
    // NOT the outer button, whose pointer-events:none blocks down-events
    // from reaching JS listeners there even though click/onClick still
    // bubbles through fine. See Hero.tsx's usePress for the full story.
    labelHandlers: {
      onPointerDown: down,
      onPointerUp: up,
      onPointerLeave: up,
      onPointerCancel: up,
      onMouseDown: down,
      onMouseUp: up,
    },
  };
}

export default function CtaSection() {
  const ref = useReveal<HTMLDivElement>();
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { pressed, labelHandlers } = usePress();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError('Enter your email to get access.');
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError('That email doesn’t look right — double-check it.');
      return;
    }
    setError(null);
    // Fade the form out first, then swap to the success state — a clean
    // cross-fade instead of an instant snap between the two blocks.
    setLeaving(true);
    setTimeout(() => setDone(true), 220);
  };

  return (
    <section className="page-section" data-screen-label="CTA">
      <span id="cta" className="anchor-target" aria-hidden="true" />
      <div className="container">
        <div ref={ref} className="cta-box reveal">
          <h2>Stop dispatching.<br />Start creating.</h2>
          <p className="lede">Early access opens in waves — 3D artists first.</p>
          {!done ? (
            <>
              <form className={`cta-form${leaving ? ' is-leaving' : ''}`} onSubmit={onSubmit} noValidate>
                <input
                  type="email"
                  placeholder="you@studio.com"
                  value={email}
                  className={error ? 'has-error' : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'cta-email-error' : undefined}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                />
                <button
                  type="submit"
                  className={`cta-pill cta-submit cta-hoverable${pressed ? ' is-pressed' : ''}`}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src="/assets/buttons/btn-getstarted-transparent.webp"
                    alt=""
                    draggable={false}
                    style={{ position: 'absolute', left: -16, top: -11, width: 175, maxWidth: 'none' }}
                  />
                  <span className="label" style={{ color: '#fff' }} {...labelHandlers}>Get early access</span>
                </button>
              </form>
              {error && <p className="cta-form-error" id="cta-email-error" role="alert">{error}</p>}
            </>
          ) : (
            <div className="cta-done">
              <span className="check">✓</span>
              <span className="message">You&rsquo;re in — invite lands this month.</span>
            </div>
          )}
          <div className="cta-fineprint">No card required. Cancel the other five subscriptions later.</div>
        </div>
      </div>
    </section>
  );
}
