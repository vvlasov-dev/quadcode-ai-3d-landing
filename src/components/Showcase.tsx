import { useReveal } from '../hooks/useReveal';
import { useTurntable } from '../hooks/useTurntable';

export default function Showcase() {
  const headRef = useReveal<HTMLDivElement>();
  const boxRef = useReveal<HTMLDivElement>();
  const {
    containerRef,
    videoRef,
    missing,
    ready,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  } = useTurntable('/assets/turntable.mp4?v=20260718-all-i');

  return (
    <section className="page-section" data-screen-label="Showcase">
      <span id="showcase" className="anchor-target" aria-hidden="true" />
      <div className="container">
        <div ref={headRef} className="showcase-head reveal">
          <div className="eyebrow">Interactive 3D preview</div>
          <h2 className="section-title">Grab it. Spin it.</h2>
          <p className="section-lede">A Quadcode scene the way your client sees it — drag to orbit the asset.</p>
        </div>
        <div ref={boxRef} className="reveal">
          <div ref={containerRef} className="turntable">
            {!missing && (
              <video
                ref={videoRef}
                src="/assets/turntable.mp4?v=20260718-all-i"
                poster="/assets/poster-turntable.jpg"
                muted
                playsInline
                preload="none"
                className={ready ? 'is-ready' : ''}
              />
            )}
            {missing && (
              <div className="fallback">
                <svg width="34" height="34" viewBox="0 0 26 26" fill="none"><path d="M13 2.5 22.5 8v10L13 23.5 3.5 18V8Z M13 23.5V13.5 M3.5 8 13 13.5 22.5 8" stroke="#9a9aa6" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg>
                <div className="cap">Turntable preview unavailable</div>
                <div className="sub">The interactive video could not load on this device.</div>
              </div>
            )}
            <div className="drag-layer" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />
            <span className="drag-hint">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7a5.5 5.5 0 1 1 1.6 3.9M3 13.5V10.9h2.6" stroke="#33333d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>DRAG TO ROTATE</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
