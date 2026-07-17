import { useCallback, useEffect, useRef } from 'react';

function prepareMutedInlineVideo(video: HTMLVideoElement | null) {
  if (!video) return;

  // React sets `muted` as a DOM property and does not guarantee that the
  // corresponding HTML attribute is present. Set both synchronously from the
  // callback ref, before the browser makes its first autoplay decision.
  video.defaultMuted = true;
  video.muted = true;
  video.volume = 0;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
}

/**
 * Crossfades between two <video> elements playing the same looping clip so the
 * seam never shows a hard cut/black-frame. Mirrors the original DC logic:
 * ~1.2-1.6s before the active clip ends, start the inactive twin and fade.
 */
export function useHeroVideoLoop() {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoARef = useCallback((video: HTMLVideoElement | null) => {
    videoARef.current = video;
    prepareMutedInlineVideo(video);
  }, []);

  const setVideoBRef = useCallback((video: HTMLVideoElement | null) => {
    videoBRef.current = video;
    prepareMutedInlineVideo(video);
  }, []);

  const setMobileVideoRef = useCallback((video: HTMLVideoElement | null) => {
    mobileVideoRef.current = video;
    prepareMutedInlineVideo(video);
  }, []);

  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b) return;

    if (window.matchMedia('(max-width: 840px)').matches) {
      const mobile = mobileVideoRef.current;
      if (!mobile) return;

      // Reassert mutable playback state for restored tabs and browsers that
      // defer media setup. Required attributes were already set by the ref.
      mobile.loop = true;

      const play = () => {
        if (document.visibilityState === 'hidden' || !mobile.paused) return;
        mobile.play().catch(() => {});
      };

      const resumeWhenVisible = () => {
        if (document.visibilityState === 'visible') play();
      };

      mobile.addEventListener('canplay', play);
      mobile.addEventListener('loadeddata', play);
      document.addEventListener('visibilitychange', resumeWhenVisible);
      window.addEventListener('pageshow', play);
      document.addEventListener('touchstart', play, { passive: true });
      document.addEventListener('pointerdown', play, { passive: true });
      if (mobile.readyState >= 2) play();

      return () => {
        mobile.removeEventListener('canplay', play);
        mobile.removeEventListener('loadeddata', play);
        document.removeEventListener('visibilitychange', resumeWhenVisible);
        window.removeEventListener('pageshow', play);
        document.removeEventListener('touchstart', play);
        document.removeEventListener('pointerdown', play);
      };
    }

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
    let fadeTimer: number | undefined;
    let disposed = false;

    const resumeActive = () => {
      if (document.visibilityState === 'hidden' || !active.paused) return;
      active.play().catch(() => {});
    };

    const onTimeUpdate = (event: Event) => {
      if (event.target !== active || crossfading) return;
      const duration = active.duration;
      if (!duration || !isFinite(duration)) return;
      const lead = Math.min(1.6, Math.max(1.2, duration * 0.2));
      if (active.currentTime < duration - lead) return;
      crossfading = true;
      inactive.currentTime = 0;
      inactive.play().then(() => {
        if (disposed) return;
        inactive.classList.add('is-active');
        active.classList.remove('is-active');
        fadeTimer = window.setTimeout(() => {
          const prev = active;
          active = inactive;
          inactive = prev;
          prev.pause();
          prev.currentTime = 0;
          crossfading = false;
        }, FADE_MS);
      }).catch(() => {
        // Some mobile browsers defer playback until a user gesture. Keep the
        // currently visible clip alive instead of fading to a paused twin.
        active.currentTime = 0;
        active.play().catch(() => {});
        crossfading = false;
      });
    };

    const start = () => {
      a.classList.add('is-active');
      b.classList.remove('is-active');
      a.play().catch(() => {});
    };

    a.addEventListener('timeupdate', onTimeUpdate);
    b.addEventListener('timeupdate', onTimeUpdate);
    document.addEventListener('visibilitychange', resumeActive);
    window.addEventListener('pageshow', resumeActive);
    document.addEventListener('touchstart', resumeActive, { passive: true });
    document.addEventListener('pointerdown', resumeActive, { passive: true });
    if (a.readyState >= 1) start();
    else a.addEventListener('loadedmetadata', start, { once: true });

    return () => {
      disposed = true;
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
      a.removeEventListener('timeupdate', onTimeUpdate);
      b.removeEventListener('timeupdate', onTimeUpdate);
      document.removeEventListener('visibilitychange', resumeActive);
      window.removeEventListener('pageshow', resumeActive);
      document.removeEventListener('touchstart', resumeActive);
      document.removeEventListener('pointerdown', resumeActive);
    };
  }, []);

  return {
    videoARef: setVideoARef,
    videoBRef: setVideoBRef,
    mobileVideoRef: setMobileVideoRef,
  };
}
