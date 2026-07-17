# Quadcode AI — landing page for freelance 3D generalists

Test-task landing for **Quadcode AI**, aimed at a specific niche: freelance 3D
generalists (Upwork-style) who lose hours dispatching between Midjourney,
Blender and a separate render pass. Value prop: *prompt → concept → mesh →
render, in one window.*

![Quadcode AI landing page](docs/quadcode-landing-preview.png)

## Stack

- Vite + React 19 + TypeScript
- No CSS framework — plain CSS with custom properties, `clamp()` for fluid
  type, CSS container queries, and real `@media` breakpoints (mobile ≤ 840px)
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

The hero serves WebM first with an MP4 fallback and crossfades between two
`<video>` elements so the source clip never shows a hard cut. The interactive
UFO uses the optimized MP4 for predictable frame decoding into canvas. It only
starts downloading once its section nears the viewport (`IntersectionObserver`,
1600px runway), so it costs nothing on a visit that never scrolls that far.
Both videos are muted, inline-safe and backed by lightweight poster frames.

Total `dist/` is ~5.7 MB, of which ~5.5 MB is media/font assets and only
~72 KB gzip is JS+CSS — the app shell itself is not the bottleneck; the two
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

## Asset brief

All generated assets were created through Higgsfield. The table names the
underlying generation model separately so the workflow stays reproducible.

| Asset | Platform · model | Prompt (short) | Iterations | Post-processing |
|---|---|---|---:|---|
| Asya Kim avatar | Higgsfield · GPT Image 2 | Realistic portrait of Asya Kim, a freelance 3D generalist focused on product visualization and presented as Upwork Top Rated; no text, logos or lettering | 1 | Circular crop, downscaled to 112×112, WebP export |
| Wireless headphones | Higgsfield · GPT Image 2 | Use the supplied product photo as a loose reference; create a different wireless headphone design on a clean white background | 1 | White-background product crop, WebP export |
| Hero concept still | Higgsfield · GPT Image 2 | Rework three visual references into a Quadcode AI landing hero for professional 3D designers; English copy, Quadcode AI branding and a light neutral palette | 6 | Selected composition integrated into the live layout; exported as a 1280×720 JPEG poster |
| Hero animation | Higgsfield · Seedance 2 | Static premium SaaS hero; animate only the 3D character creation process, glass ribbons and subtle particles; seamless 10-second loop | 3 | H.264 and VP9/WebM encodes; dual-video crossfade hides the residual source seam |
| UFO still | Higgsfield · GPT Image 2 | Generate an original iridescent UFO from the supplied references, using the reference palette and liquid-glass drips; NFT-art finish, no UI or text | 2 | Cropped and exported as the 1280×860 turntable poster |
| UFO turntable video | Higgsfield · Kling 3.0 Turbo | Camera completes one constant-speed 360° orbit around a centered static UFO and returns to the exact starting angle; background unchanged | 2 | Downscaled to 1280×860; H.264 and VP9/WebM encodes; lazy loading and canvas drag-scrubbing |
| Pipeline 01 — Concept | Higgsfield · GPT Image 2 | Ancient stone golem with mossy runes, painterly concept sketch, rough brushstrokes, white background | 1 | WebP export |
| Pipeline 02 — Mesh | Higgsfield · GPT Image 2 | Same golem as a grey clay 3D viewport render with wireframe overlay, matcap shading and a neutral studio | 1 | Previous stage used as visual reference; WebP export |
| Pipeline 03 — Materials | Higgsfield · GPT Image 2 | Same golem as a clean PBR look-dev presentation with stone, moss and metal material spheres | 1 | Previous stage used as visual reference; UI/text excluded with a negative prompt; WebP export |
| Pipeline 04 — Final render | Higgsfield · GPT Image 2 | Same golem as an 8K cinematic final render with key light, volumetric fog, color grading and an Octane-style finish | 1 | Previous stage used as visual reference; WebP export |

The four pipeline frames deliberately reuse the preceding stage as a visual
reference so the silhouette and viewing angle read as one asset moving from
concept to production render.

<details>
<summary><strong>Hero concept prompt</strong></summary>

> Use all supplied images as references and reinterpret the design for
> Quadcode AI. Replace the content so the landing page speaks to professional
> 3D designers and communicates that Quadcode AI brings their workflow into
> one place. Rewrite all page copy in English, replace the logo with Quadcode
> AI, use a light neutral modern palette, and preserve the reference
> composition and visual language as closely as possible. The three references
> define the material treatment, overall visual style and 3D character; adapt
> the character for Quadcode AI rather than reproducing a literal 1:1 copy.

</details>

<details>
<summary><strong>Hero animation prompt</strong></summary>

> Animate this premium AI product landing page hero while preserving the exact
> composition, layout and camera angle. Keep the camera static: no zoom,
> movement, perspective change or UI motion. Animate only the 3D female artwork,
> the upper and lower glass ribbons, and subtle atmospheric particles. Over a
> seamless 10-second loop, dissolve the chrome-and-glass character into glowing
> particles, reorganize them into a volumetric structure, form a thin blue
> wireframe, rebuild the detailed model, and let glossy black, transparent
> glass, chrome and liquid-metal materials flow across it before returning to
> the original final render. Move the ribbons slowly like energy streams with
> restrained blue-violet iridescence. Premium, minimal, elegant, Apple-style
> motion design; luxury CGI, smooth easing, no aggressive effects. The ending
> frame must match the beginning frame for infinite looping.

</details>

<details>
<summary><strong>Pipeline prompts</strong></summary>

1. `Concept art sketch of an ancient stone golem with mossy runes, painterly, rough brushstrokes, white background.`
2. `Same golem as a grey clay 3D viewport screenshot, wireframe overlay, matcap shading, neutral studio.`
3. `Same golem, textured, PBR look-dev presentation, neutral seamless grey studio background, flat even lighting, three floating material preview spheres next to the model (stone, moss, metal), no software UI, no panels, no text, clean minimal composition.` Negative prompt: `software interface, UI panels, buttons, text overlays, sky`.
4. `Same golem, 8K cinematic final render, key light, volumetric fog, color graded, Octane style.`

</details>
