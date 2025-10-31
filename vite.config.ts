import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'RootstockWinks',
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'axios', 'ethers', 'wagmi', '@rainbow-me/rainbowkit'],
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: false,
  },
});
