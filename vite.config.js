import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default ({ mode }) => {
  // Load env 
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react(), tailwindcss()],
    esbuild: {
      drop: env.NODE_ENV === 'development' ? [] : ['console', 'debugger'],
    },
    build: {
      sourcemap: false,
    },
  });
};