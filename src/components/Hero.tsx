import { useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { useHeroVideoLoop } from '../hooks/useHeroVideoLoop';
import './Hero.css';

const NAV_LINKS = [
  { href: '#pipeline', label: 'Product' },
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#use-case', label: 'For 3D Designers' },
];

// Let the browser do its normal native hash-jump — same algorithm the
// source's plain `href="#id"` links used (identical landing point/scroll
// animation), so the "camera" lands exactly where it always did. The only
// thing we add is stripping the hash back out of the URL right after,
// so it never lingers into a reload. Nothing here touches the scroll
// itself — it only rewrites the address bar once the jump has started.
function stripHashAfterJump() {
  requestAnimationFrame(() => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });
}

// Source marks every button `<a>` `draggable="false"` and blocks
// dragstart/contextmenu (`ondragstart`/`oncontextmenu="{{preventNative}}"`).
// Anchors are draggable by default in every browser — without this, a
// mousedown-and-move on the button starts a native link-drag (ghost image +
// no-drop cursor) instead of a normal press. Spread onto every button `<a>`.
const noDrag = {
  draggable: false,
  onDragStart: (e: DragEvent) => e.preventDefault(),
  onContextMenu: (e: MouseEvent) => e.preventDefault(),
};

// Press/active feedback is driven through React state. Handlers are
// attached to the `.label` span specifically — NOT the outer `<a>` — even
// though the `<a>` has pointer-events:none and click/onClick clearly still
// reach it via bubbling (navigation works fine). Testing showed
// onPointerDown/onMouseDown attached to the `<a>` never actually fired on a
// real click even though `click` did, so rather than rely on that bubbling
// behavior for down/up events specifically, the handlers now sit directly
// on the one element that's guaranteed to be the real interactive target.
// MIN_PRESS_MS pads out the pressed state so it stays visible even when the
// real mousedown-to-mouseup gap is shorter than the transition itself.
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
    // Spread onto the `.label` span (the pointer-events:auto element).
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

// Exact glass-button geometry from the original design (per context: header
// bar, mobile menu overlay). The label sits on real HTML text over the
// raster glass artwork, so it stays translatable/accessible.
const BTN = {
  enterpriseHeader: { w: 113, h: 42, imgLeft: -10.3, imgTop: -8.2, imgW: 133.4 },
  enterpriseMenu: { w: 129, h: 48, imgLeft: -11.2, imgTop: -9.3, imgW: 151 },
  startedHeader: { w: 126, h: 42, imgLeft: -16.1, imgTop: -10.6, imgW: 156.1 },
  startedMenu: { w: 146, h: 48, imgLeft: -15.6, imgTop: -11.4, imgW: 175 },
};

function Logo({ variant }: { variant: 'desktop' | 'mobile' }) {
  if (variant === 'mobile') {
    // Mobile wraps the wordmark in its own span carrying the Sector font +
    // color explicitly (independent of the outer link's own type), and the
    // outer link carries the white glow (text-shadow inherits to both spans)
    // so the logo stays legible over the video.
    return (
      <a href="#" className="hero-logo-mobile hero-glow" onClick={stripHashAfterJump}>
        <span className="wordmark-mobile">Quadcode</span>
        <span className="ai ai-mobile">AI</span>
      </a>
    );
  }
  return (
    <a href="#" className="hero-logo" onClick={stripHashAfterJump}>
      Quadcode<span className="ai">AI</span>
    </a>
  );
}

// variant: "header" gets hover+active (desktop bar); "menu" gets active only
// (the mobile slide-out is touch-driven, same as the source markup).
function EnterpriseCta({ variant }: { variant: 'header' | 'menu' }) {
  const g = variant === 'header' ? BTN.enterpriseHeader : BTN.enterpriseMenu;
  const { pressed, labelHandlers } = usePress();
  return (
    <a
      href="mailto:hello@quadcode.ai?subject=Enterprise"
      className={`cta-pill cta-enterprise${variant === 'header' ? ' cta-hoverable' : ''}${pressed ? ' is-pressed' : ''}`}
      style={{ width: g.w, height: g.h }}
      {...noDrag}
    >
      <img
        src="/assets/buttons/btn-enterprise-transparent.webp"
        alt=""
        draggable={false}
        style={{ position: 'absolute', left: g.imgLeft, top: g.imgTop, width: g.imgW, maxWidth: 'none' }}
      />
      <span className="label" style={{ color: '#16161f' }} {...labelHandlers}>Enterprise</span>
    </a>
  );
}

function GetStartedCta({ variant, onNavigate }: { variant: 'header' | 'menu'; onNavigate?: () => void }) {
  const g = variant === 'header' ? BTN.startedHeader : BTN.startedMenu;
  const { pressed, labelHandlers } = usePress();
  return (
    <a
      href="#cta"
      className={`cta-pill cta-started${variant === 'header' ? ' cta-hoverable' : ''}${pressed ? ' is-pressed' : ''}`}
      style={{ width: g.w, height: g.h }}
      onClick={() => { stripHashAfterJump(); onNavigate?.(); }}
      {...noDrag}
    >
      <img
        src="/assets/buttons/btn-getstarted-transparent.webp"
        alt=""
        draggable={false}
        style={{ position: 'absolute', left: g.imgLeft, top: g.imgTop, width: g.imgW, maxWidth: 'none' }}
      />
      <span className="label" style={{ color: '#ffffff' }} {...labelHandlers}>Get Started</span>
    </a>
  );
}

// variant: "desktop" gets hover (lift on the button) same as source;
// "mobile" gets active only (source never defines style-hover for the
// mobile start/watch buttons either).
function StartWatchButtons({ variant }: { variant: 'desktop' | 'mobile' }) {
  const hoverable = variant === 'desktop';
  const startPress = usePress();
  const watchPress = usePress();
  return (
    <div className={variant === 'desktop' ? 'hero-ctas' : 'hero-ctas-mobile'}>
      <a
        href="#cta"
        className={`cta-pill start-btn${hoverable ? ' cta-hoverable' : ''}${startPress.pressed ? ' is-pressed' : ''}`}
        onClick={stripHashAfterJump}
        {...noDrag}
      >
        <img src="/assets/buttons/btn-start-transparent.webp" alt="" draggable={false} />
        <span className="label" {...startPress.labelHandlers}>
          <span>Start creating</span>
          <svg width="26" height="17" viewBox="0 0 26 17" fill="none"><path d="M1 8.5h23M16.5 1.5 24 8.5 16.5 15.5" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </a>
      <a
        href="#pipeline"
        className={`cta-pill watch-btn${variant === 'mobile' ? ' watch-btn-mobile' : ''}${hoverable ? ' cta-hoverable' : ''}${watchPress.pressed ? ' is-pressed' : ''}`}
        onClick={stripHashAfterJump}
        {...noDrag}
      >
        <img src="/assets/buttons/btn-watch-transparent.webp" alt="" draggable={false} />
        <span className="label" {...watchPress.labelHandlers}>
          <span>See how it works</span>
          <svg width="15" height="17" viewBox="0 0 15 17" fill="none"><path d="M2 2.6v11.8c0 1.15 1.25 1.85 2.2 1.22l9.4-5.9c.9-.57.9-1.87 0-2.44L4.2 1.38C3.25.75 2 1.45 2 2.6Z" fill="#101018" /></svg>
        </span>
      </a>
    </div>
  );
}

export default function Hero() {
  const { videoARef, videoBRef } = useHeroVideoLoop();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="hero" data-screen-label="Hero">
      <div className="hero-video-bg" aria-hidden="true">
        <video ref={videoARef} className="hero-video" poster="/assets/poster-hero.jpg" muted playsInline autoPlay preload="auto">
          <source src="/assets/hero-background.webm" type="video/webm" />
          <source src="/assets/hero-background.mp4" type="video/mp4" />
        </video>
        <video ref={videoBRef} className="hero-video" poster="/assets/poster-hero.jpg" muted playsInline preload="metadata">
          <source src="/assets/hero-background.webm" type="video/webm" />
          <source src="/assets/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-scrim" />
        <div className="hero-video-fade" />
      </div>

      {/* Desktop: authored as a 1920x1080 canvas, uniformly scaled to fit the
          hero box via a CSS container-query ratio (no JS/ResizeObserver) —
          this is what keeps every element's proportions matching the
          original design at any viewport width instead of drifting. */}
      <div className="hero-canvas">
        <header className="hero-header">
          <Logo variant="desktop" />
          <nav className="hero-nav">
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} className="hero-glow" onClick={stripHashAfterJump}>{l.label}</a>)}
          </nav>
          <div className="hero-header-ctas">
            <EnterpriseCta variant="header" />
            <GetStartedCta variant="header" />
          </div>
        </header>

        <main className="hero-main-desktop">
          <div className="eyebrow hero-glow">Your 3D workflow, supercharged</div>
          <h1 className="hero-glow">Everything 3D designers<br />need, in one place</h1>
          <p className="lede hero-glow">Stop playing dispatcher between ten tabs. Prompt → concept → mesh → render, in one window.</p>
          <StartWatchButtons variant="desktop" />
        </main>
      </div>

      {/* Mobile: separate natural-flow block (own fluid clamp()/vw sizes,
          not scaled) — matches the original's own dedicated mobile markup
          rather than squeezing the desktop canvas down.
          Composition per handoff spec: no overlay of any kind on top of
          the video (no scrim/blur/mask/boxed clip) — the video is full-
          bleed and object-position is tuned (66% center) so the figure
          reads clearly in the open middle of the screen. Legibility comes
          entirely from placement: text lives in the naturally light upper
          zone right under the header, buttons are pinned to the bottom via
          margin-top:auto on their wrapper, leaving the whole middle of the
          screen free for the video. The only readability aid is the same
          light text-shadow glow the source itself used — see Hero.css. */}
      <div className="hero-mobile-wrap">
        <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
          <nav>
            {NAV_LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => { stripHashAfterJump(); setMenuOpen(false); }}>{l.label}</a>)}
          </nav>
          <div className="menu-ctas">
            <EnterpriseCta variant="menu" />
            <GetStartedCta variant="menu" onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>

        <header className="hero-header-mobile">
          <Logo variant="mobile" />
          <button className={`burger${menuOpen ? ' is-open' : ''}`} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </header>

        <main className="hero-main-mobile">
          <div className="eyebrow">Your 3D workflow, supercharged</div>
          <h1>Everything 3D designers need, in one place</h1>
          <p className="lede">Stop playing dispatcher between ten tabs. Prompt → concept → mesh → render, in one window.</p>
          <StartWatchButtons variant="mobile" />
        </main>
      </div>
    </div>
  );
}
