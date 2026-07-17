import { useEffect, useRef, useState } from 'react';

/**
 * Drag-to-rotate turntable: pre-decodes the clip into an array of ImageBitmap
 * frames (canvas), so scrubbing never waits on a video seek. Loads lazily
 * (IntersectionObserver, 1600px runway) and idles with a gentle sway once
 * visible and ready. Falls back to a plain looping <video> if decode fails.
 */
export function useTurntable(src: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [missing, setMissing] = useState(false);
  const [ready, setReady] = useState(false);

  const framesRef = useRef<ImageBitmap[] | null>(null);
  const posRef = useRef(0);
  const idxRef = useRef(-1);
  const draggingRef = useRef(false);
  const dragXRef = useRef(0);
  const dragFromRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const idleRafRef = useRef(0);
  const visibleRef = useRef(false);

  const drawFrame = (posRaw: number) => {
    const frames = framesRef.current;
    const cv = canvasRef.current;
    if (!frames || !cv) return;
    const N = frames.length;
    const m = ((posRaw % (2 * N)) + 2 * N) % (2 * N);
    const pos = m < N ? m : 2 * N - m;
    const idx = Math.max(0, Math.min(N - 1, Math.round(pos)));
    if (idx === idxRef.current) return;
    idxRef.current = idx;
    const f = frames[idx];
    if (cv.width !== f.width) { cv.width = f.width; cv.height = f.height; }
    cv.getContext('2d')!.drawImage(f, 0, 0);
    if (cv.style.opacity !== '1') cv.style.opacity = '1';
  };

  const startDragLoop = () => {
    if (rafRef.current) return;
    const step = () => {
      if (targetRef.current == null) { rafRef.current = 0; return; }
      posRef.current += (targetRef.current - posRef.current) * 0.14;
      drawFrame(posRef.current);
      if (!draggingRef.current && Math.abs(targetRef.current - posRef.current) < 0.25) {
        rafRef.current = 0;
        targetRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const beginIdleSway = () => {
    if (idleRafRef.current || !framesRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const N = framesRef.current.length;
    let idleWait = 0;
    let idleBase = posRef.current;
    let off = 0;
    let dir = 1;
    let t = 0;
    let last = performance.now();
    const A = N * 0.28;
    const speed = N * 0.48;
    const loop = (ts: number) => {
      idleRafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      if (!visibleRef.current) return;
      if (draggingRef.current || rafRef.current) {
        idleWait = 5; idleBase = posRef.current; off = 0; dir = 1; t = 0;
        return;
      }
      if (idleWait > 0) { idleWait -= dt; idleBase = posRef.current; off = 0; dir = 1; t = 0; return; }
      t += dt;
      const ease = Math.min(1, t / 0.8);
      off += dt * speed * dir * ease;
      if (off > A) { off = A; dir = -1; }
      else if (off < -A) { off = -A; dir = 1; }
      posRef.current += (idleBase + off - posRef.current) * 0.12;
      drawFrame(posRef.current);
    };
    idleRafRef.current = requestAnimationFrame(loop);
  };

  const buildFrames = async (blobUrl: string) => {
    try {
      const v = document.createElement('video');
      v.muted = true;
      v.preload = 'auto';
      v.src = blobUrl;
      await new Promise<void>((res, rej) => { v.onloadeddata = () => res(); v.onerror = () => rej(new Error('load failed')); });
      const d = v.duration;
      const N = Math.min(96, Math.max(48, Math.round(d * 16)));
      const w = 720;
      const h = Math.max(1, Math.round((w * v.videoHeight) / Math.max(1, v.videoWidth)));
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const cx = cv.getContext('2d')!;
      const frames: ImageBitmap[] = [];
      for (let i = 0; i < N; i++) {
        const t = 0.02 + (i / (N - 1)) * (d - 0.1);
        await new Promise<void>((res) => { v.onseeked = () => res(); v.currentTime = t; });
        cx.drawImage(v, 0, 0, w, h);
        frames.push(await createImageBitmap(cv));
      }
      framesRef.current = frames;
      posRef.current = 0;
      idxRef.current = -1;
      drawFrame(0);
      setReady(true);
      beginIdleSway();
    } catch {
      setMissing(true);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let started = false;
    let blobUrl: string | null = null;
    const start = () => {
      if (started) return;
      started = true;
      fetch(src)
        .then((r) => { if (!r.ok) throw new Error('missing'); return r.blob(); })
        .then((b) => { blobUrl = URL.createObjectURL(b); setTimeout(() => buildFrames(blobUrl!), 200); })
        .catch(() => setMissing(true));
    };
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io!.disconnect(); start(); } }, { rootMargin: '1600px 0px' });
      io.observe(el);
    }
    const visIO = new IntersectionObserver((es) => { visibleRef.current = es.some((x) => x.isIntersecting); });
    visIO.observe(el);
    return () => {
      io?.disconnect();
      visIO.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      framesRef.current?.forEach((f) => { try { f.close(); } catch {} });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!framesRef.current) return;
    e.preventDefault();
    draggingRef.current = true;
    dragXRef.current = e.clientX;
    dragFromRef.current = posRef.current;
    targetRef.current = posRef.current;
    startDragLoop();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !framesRef.current) return;
    const w = (e.currentTarget as HTMLDivElement).getBoundingClientRect().width;
    if (!w) return;
    targetRef.current = dragFromRef.current + ((e.clientX - dragXRef.current) / w) * framesRef.current.length * 1.15;
  };
  const onPointerUp = () => { draggingRef.current = false; };

  return { containerRef, canvasRef, missing, ready, onPointerDown, onPointerMove, onPointerUp };
}
