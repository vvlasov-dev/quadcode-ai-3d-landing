import { useEffect, useRef } from 'react';

/**
 * Crossfades between two <video> elements playing the same looping clip so the
 * seam never shows a hard cut/black-frame. Mirrors the original DC logic:
 * ~1.2-1.6s before the active clip ends, start the inactive twin and fade.
 */
export function useHeroVideoLoop() {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      a.pause();
      b.pause();
      return;
    }

    const FADE_MS = 1300;
    [a, b].forEach((v) => {
      v.muted = true;
      v.loop = false;
      v.playsInline = true;
      v.style.transition = `opacity ${FADE_MS}ms ease-out`;
    });

    let active = a;
    let inactive = b;
    let crossfading = false;

    const onTimeUpdate = (event: Event) => {
      if (event.target !== active || crossfading) return;
      const duration = active.duration;
      if (!duration || !isFinite(duration)) return;
      const lead = Math.min(1.6, Math.max(1.2, duration * 0.2));
      if (active.currentTime < duration - lead) return;
      crossfading = true;
      inactive.currentTime = 0;
      inactive.play().catch(() => {});
      inactive.classList.add('is-active');
      active.classList.remove('is-active');
      setTimeout(() => {
        const prev = active;
        active = inactive;
        inactive = prev;
        prev.pause();
        prev.currentTime = 0;
        crossfading = false;
      }, FADE_MS);
    };

    const start = () => {
      a.classList.add('is-active');
      b.classList.remove('is-active');
      a.play().catch(() => {});
    };

    a.addEventListener('timeupdate', onTimeUpdate);
    b.addEventListener('timeupdate', onTimeUpdate);
    if (a.readyState >= 1) start();
    else a.addEventListener('loadedmetadata', start, { once: true });

    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate);
      b.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  return { videoARef, videoBRef };
}
