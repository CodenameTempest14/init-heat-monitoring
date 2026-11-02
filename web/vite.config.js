import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// cssMinify off: Tabler's CSS is already minified, and re-minifying changes line-height numbers by a hair (1/64 px),
// which shifts text by a pixel against the approved design images (tests/ui-gate-*.test.js).
export default defineConfig({ plugins: [react()], build: { cssMinify: false } });
