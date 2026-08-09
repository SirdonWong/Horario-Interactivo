import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      visualizer({
        filename: 'scratch/bundle-report.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'fs': path.resolve(__dirname, 'src/utils/dummy.ts'),
        'stream': path.resolve(__dirname, 'src/utils/dummy.ts'),
        'crypto': path.resolve(__dirname, 'src/utils/dummy.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              const RADIX_ECOSYSTEM = [
                '@radix-ui',
                '@floating-ui',
                'react-remove-scroll',
                'react-style-singleton',
                'use-callback-ref',
                'use-sidecar',
                'aria-hidden',
                'get-nonce',
              ];
              if (RADIX_ECOSYSTEM.some(pkg => id.includes(pkg))) {
                return; // no lo agrupes en "vendor" — deja que Rollup lo 
                        // separe automáticamente siguiendo el grafo del 
                        // import() dinámico de ColumnMappingDialog
              }
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
