import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// PORT is only needed for the dev/preview server, not during a static build.
// On Vercel and other CI environments it is not set at build time.
const isBuild = process.argv.includes('build') || process.argv.includes('preview');

const rawPort = process.env.PORT;
if (!rawPort && !isBuild) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}
const port = rawPort ? Number(rawPort) : 3000;
if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH defaults to '/' for static deployments (Vercel, etc.)
const basePath = process.env.BASE_PATH ?? '/';

// Replit-only plugins — only loaded when running inside Replit
const isReplit =
  process.env.NODE_ENV !== 'production' &&
  process.env.REPL_ID !== undefined;

export default defineConfig(async () => ({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Runtime error overlay — Replit-only, skip in CI/Vercel builds
    ...(isReplit
      ? [await import('@replit/vite-plugin-runtime-error-modal').then((m) => m.default())]
      : []),
    ...(isReplit
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
}));
