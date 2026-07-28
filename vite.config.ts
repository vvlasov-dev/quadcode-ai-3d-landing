import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves a project repo from a subfolder, so every asset URL
// needs that prefix baked in:
//   https://vvlasov-dev.github.io/quadcode-ai-3d-landing/
//
// Override with BASE_PATH=/ when building for a root-served target (the
// Dockerfile/nginx deployment), since there the site owns the domain root.
//
// Set unconditionally rather than only for `command === 'build'`: Vite
// reports BOTH `vite dev` and `vite preview` as command 'serve', so a
// build-only base makes `preview` serve dist at '/' while the built HTML
// points at the subfolder — every asset then falls through to the SPA
// index.html fallback and the app silently never mounts.
//
// Anything in `public/` must be referenced through `asset()` in
// src/lib/asset.ts — Vite rewrites its own imports for `base` automatically,
// but plain string paths in JSX (`src="/assets/x.webp"`) are opaque to it.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/quadcode-ai-3d-landing/',
})
