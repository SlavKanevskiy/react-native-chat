/**
 * Bundles widget.tsx → dist/chat-widget.js
 * Tiny output (~1kb): just the Custom Element that wraps the chat in an iframe.
 * No Firebase, no React — plain browser APIs only.
 */

import esbuild from 'esbuild';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

mkdirSync(resolve(root, 'dist'), { recursive: true });

const result = await esbuild.build({
  entryPoints: [resolve(root, 'widget.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'esnext',
  outfile: resolve(root, 'dist', 'chat-widget.js'),
  logLevel: 'info',
});

if (result.errors.length) {
  console.error('Build failed:', result.errors);
  process.exit(1);
}

console.log('✓ dist/chat-widget.js built successfully');
