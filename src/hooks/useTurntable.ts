import { useEffect, useRef, useState } from 'react';

/**
 * Drives the keyframe-dense turntable MP4 as an interactive timeline.
 * The browser keeps decoding in its native video pipeline instead of retaining
 * dozens of ImageBitmaps in memory. Idle sway and pointer drag share the same
 * reflected position space, so both reverse cleanly at either end.
 */
export function useTurntable(src: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [missing, setMissing] = useState(false);
  const [ready, setReady] = useState(false);

  const durationRef = useRef(0);
  const frameCountRef = useRef(0);
  const positionRef = useRef(0);
  const indexRef = useRef(-1);
  const targetRef = useRef<number | null>(null);
  const seekRafRef = useRef(0);
  const idleRafRef = useRef(0);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const dragFromRef = useRef(0);
  const visibleRef = useRef(false);

  const drawFrame = (position: number) => {
    const video = videoRef.current;
    const duration = durationRef.current;
    const count = frameCountRef.current;
    if (!video || !duration || !count || video.seeking) return;

    const wrapped = ((position % (2 * count)) + 2 * count) % (2 * count);
    const reflected = wrapped < count ? wrapped : 2 * count - wrapped;
    const index = Math.max(0, Math.min(count - 1, Math.round(reflected)));
    if (index === indexRef.current) return;

    indexRef.current = index;
    const time = 0.02 + (index / (count - 1)) * (duration - 0.1);
    try {
      video.currentTime = time;
    } catch {
      indexRef.current = -1;
    }
  };

  const scheduleSeek = () => {
    if (seekRafRef.current) return;
    const seek = () => {
      seekRafRef.current = 0;
      const video = videoRef.current;
      const target = targetRef.current;
      if (!video || target == null || video.readyState < HTMLMediaElement.HAVE_METADATA) return;

      positionRef.current += (target - positionRef.current) * 0.14;
      drawFrame(positionRef.current);
      const settled = Math.abs(target - positionRef.current) < 0.25;
      if (!draggingRef.current && settled) {
        targetRef.current = null;
        return;
      }
      if (draggingRef.current || video.seeking || !settled) {
        seekRafRef.current = requestAnimationFrame(seek);
      }
    };
    seekRafRef.current = requestAnimationFrame(seek);
  };

  const beginIdleSway = () => {
    if (idleRafRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let idleWait = 0;
    let idleBase = positionRef.current;
    let offset = 0;
    let direction = 1;
    let elapsed = 0;
    let last = performance.now();

    const loop = (timestamp: number) => {
      idleRafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const count = frameCountRef.current;
      const delta = Math.min(0.05, (timestamp - last) / 1000);
      last = timestamp;
      if (!video || !count || !visibleRef.current) return;

      if (draggingRef.current || seekRafRef.current) {
        idleWait = 5;
        idleBase = positionRef.current;
        offset = 0;
        direction = 1;
        elapsed = 0;
        return;
      }
      if (idleWait > 0) {
        idleWait -= delta;
        idleBase = positionRef.current;
        offset = 0;
        direction = 1;
        elapsed = 0;
        return;
      }

      elapsed += delta;
      const ease = Math.min(1, elapsed / 0.8);
      const amplitude = count * 0.28;
      const speed = count * 0.48;
      offset += delta * speed * direction * ease;
      if (offset > amplitude) {
        offset = amplitude;
        direction = -1;
      } else if (offset < -amplitude) {
        offset = -amplitude;
        direction = 1;
      }

      positionRef.current += (idleBase + offset - positionRef.current) * 0.12;
      drawFrame(positionRef.current);
    };
    idleRafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    setMissing(false);
    setReady(false);
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    let initialized = false;
    const onLoadedData = () => {
      if (initialized) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) return;
      initialized = true;
      durationRef.current = duration;
      frameCountRef.current = Math.min(96, Math.max(48, Math.round(duration * 16)));
      positionRef.current = 0;
      indexRef.current = -1;
      video.pause();
      drawFrame(0);
      setReady(true);
      beginIdleSway();
    };
    const onError = () => setMissing(true);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      video.preload = 'auto';
      video.load();
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onLoadedData();
    };

    let loadObserver: IntersectionObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'undefined') {
      visibleRef.current = true;
      start();
    } else {
      loadObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadObserver?.disconnect();
          start();
        }
      }, { rootMargin: '1600px 0px' });
      loadObserver.observe(container);

      visibilityObserver = new IntersectionObserver((entries) => {
        visibleRef.current = entries.some((entry) => entry.isIntersecting);
      });
      visibilityObserver.observe(container);
    }

    return () => {
      loadObserver?.disconnect();
      visibilityObserver?.disconnect();
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      video.pause();
      if (seekRafRef.current) cancelAnimationFrame(seekRafRef.current);
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
      seekRafRef.current = 0;
      idleRafRef.current = 0;
      targetRef.current = null;
      draggingRef.current = false;
    };
    // Animation helpers intentionally retain their ref-backed state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const duration = durationRef.current;
    const count = frameCountRef.current;
    if (!video || !duration || !count) return;

    draggingRef.current = true;
    video.pause();
    dragXRef.current = event.clientX;
    dragFromRef.current = positionRef.current;
    targetRef.current = positionRef.current;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const count = frameCountRef.current;
    if (!draggingRef.current || !count) return;
    const width = event.currentTarget.getBoundingClientRect().width;
    if (!width) return;

    const delta = ((event.clientX - dragXRef.current) / width) * count * 1.15;
    targetRef.current = dragFromRef.current + delta;
    scheduleSeek();
  };

  const onPointerUp = () => {
    draggingRef.current = false;
    scheduleSeek();
  };

  return {
    containerRef,
    videoRef,
    missing,
    ready,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
