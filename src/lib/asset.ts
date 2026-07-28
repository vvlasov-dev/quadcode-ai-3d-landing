/**
 * Resolves a path inside `public/` against the deploy base path.
 *
 * GitHub Pages serves this project from a subfolder
 * (vvlasov-dev.github.io/quadcode-ai-3d-landing/), so a hardcoded
 * "/assets/hero.mp4" would 404 there. Vite exposes the configured base as
 * import.meta.env.BASE_URL, so every reference to a file in `public/` goes
 * through here and stays correct on any base — including the root-served
 * Docker/nginx deployment, where BASE_URL is just '/'.
 *
 * Query strings are preserved, so cache-busting suffixes still work:
 *   asset('assets/hero-mobile.mp4?v=62-framing')
 *
 * Pass the path WITHOUT a leading slash.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
