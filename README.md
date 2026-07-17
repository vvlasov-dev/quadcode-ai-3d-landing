# Quadcode AI — hero + landing (Vite + React + TypeScript)

Test-task landing for **Quadcode AI**, aimed at a specific niche: freelance 3D
generalists (Upwork-style) who lose hours dispatching between Midjourney,
Blender and a separate render pass. Value prop: *prompt → concept → mesh →
render, in one window.*

![Quadcode AI landing page](docs/quadcode-landing-preview.png)

## Stack

- Vite + React 19 + TypeScript
- No CSS framework — plain CSS with custom properties, `clamp()` for fluid
  type, and real `@media` breakpoints (mobile ≤ 840px) instead of a
  JS-driven `ResizeObserver` scale hack
- Only React and ReactDOM as runtime dependencies (~72 KB gzip total JS+CSS
  in the current production build)

## Structure

```
src/
  components/   Hero, Pipeline, Features, Showcase (turntable), UseCase,
                CtaSection, Footer, LegalModal
  hooks/        useHeroVideoLoop (video crossfade), useTurntable
                (canvas frame pre-decode drag-to-rotate), useReveal
                (scroll-in animation)
public/assets/  video, fonts, compressed images
```

## Scripts

```bash
npm install
npm run dev        # local dev server
npm run build       # production build -> dist/
npm run preview     # serve the production build locally
```

## Performance work

The two heavy pieces are the hero background loop and the UFO turntable —
both re-encoded from the original masters with `ffmpeg`:

| Asset | Before | After | How |
|---|---|---|---|
| `hero-background.mp4` | 8.0 MB (1920×1080, ~6.6 Mbps) | 1.5 MB (H.264, CRF 25, faststart) | `+` `.webm`/VP9 alt (1.3 MB) |
| `turntable.mp4` | 8.4 MB (1756×1180, ~17 Mbps) | 1.1 MB (scaled to 1280w, CRF 24, faststart) | `+` `.webm`/VP9 alt (1.1 MB) |
| Buttons (4 glass PNGs) | 472 KB | 164 KB (WebP q90, alpha kept) | `ffmpeg` PNG→WebP |
| Pipeline/use-case photos | — | 320 KB total (WebP) | exported directly as WebP |

Both videos serve `<source>` WebM first, MP4 fallback; both are `muted
playsinline`, use a poster frame, and the turntable clip only starts
downloading once its section nears the viewport (`IntersectionObserver`,
1600px runway) — it costs nothing on a visit that never scrolls that far.
The hero loop crossfades between two `<video>` tags so the non-seamless
source clip never shows a hard cut.

Total `dist/` is ~5.7 MB, of which ~5.4 MB is video/image assets and only
~70 KB gzip is JS+CSS — the app shell itself is not the bottleneck; the two
videos are, and that's expected/acceptable per the brief ("видео может
снижать [Lighthouse], это ок").

Further, if needed: re-encode at a slightly higher CRF (27–28) if the target
server's bandwidth is constrained, or serve the videos from behind a CDN with
range-request support (both files are `faststart`-muxed, so byte-range
seeking already works without one).

## Deploying to your own server

Three options, pick what fits your box:

**1. Docker (simplest, no Node/nginx setup needed on the host)**
```bash
docker build -t quadcode-hero .
docker run -d -p 80:80 --name quadcode-hero quadcode-hero
```

**2. Plain nginx (no Docker)**
```bash
npm run build
rsync -avz --delete dist/ user@your-server:/var/www/quadcode-hero/
# then point an nginx server block's `root` at that path — nginx.conf in
# this repo has the gzip + cache-control rules to copy into your site config
```

**3. Any static file host** (the `dist/` folder is fully static — no server-side
code, no environment variables) — copy it wherever you already serve static
files from.

## Note on the brief's deploy requirement

The task brief asks for a Railway/Vercel link specifically; this was deployed
to the requester's own server instead by their explicit choice. Worth
flagging when submitting, in case that line item is graded literally.

## Asset brief

| Asset | Model | Prompt (gist) | Iterations | Post-processing |
|---|---|---|---|---|
| Hero loop (ribbons) | Higgsfield, image-to-video | Abstract iridescent ribbons, left-to-right motion, light scene | — | Crossfade loop from two `<video>` tags (source clip isn't seamless); JPEG poster; re-encoded H.264 CRF 25 + WebM/VP9 alt |
| Glass buttons | Static UI-kit render (high-res reference) | Glass-morphism pills, inner glow, indigo/pink gradient | — | Cut from a master frame, background removed, unsharp; live HTML text overlaid; exported to WebP |
| Pipeline 01 Concept | Flux / MJ | `concept art sketch of an ancient stone golem, mossy runes, painterly, white bg, 3/4 view` | — | — |
| Pipeline 02 Mesh | Flux / MJ, ref = 01 | `same golem, grey clay viewport screenshot, wireframe overlay, matcap` | — | — |
| Pipeline 03 Materials | Flux / MJ, ref = 02, low strength | `same golem, PBR material preview, flat studio light, no environment` | — | — |
| Pipeline 04 Render | Flux / MJ, ref = 03 | `same golem, cinematic final render, volumetric fog, color graded` | — | — |
| UFO turntable | Higgsfield, image-to-video | `camera orbits around centered iridescent UFO, studio, object static` | — | Frames pre-decoded to canvas for drag-scrub; ping-pong loop masks the non-seamless join; lazy-loaded; re-encoded + downscaled to 1280w, H.264 CRF 24 + WebM/VP9 alt |
| Use-case render | Flux / MJ | `product hero shot, matte black electric kettle, DTC style, softbox` | — | — |
| Logo | Sector font, "AI" superscript in `#7B6CFF` | — | — | Self-hosted WOFF2, plain `@font-face` |

Each pipeline stage was generated with the previous stage as a reference
(fixed silhouette/angle: `3/4 view, slightly low angle`, fixed seed) so the
four frames read as one continuous asset moving through the pipeline.
