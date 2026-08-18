// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages *user* site: served from the domain root, so base is '/'.
// Setting base to '/repo-name/' here is the classic mistake — it would break every asset URL.
export default defineConfig({
  site: 'https://alexayu1204.github.io',
  base: '/',
  output: 'static',
  devToolbar: { enabled: false },
  build: {
    // every route becomes a real directory with its own index.html,
    // so GitHub Pages can serve it without any rewrite rules
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: { assetsInlineLimit: 2048 },
  },
});
