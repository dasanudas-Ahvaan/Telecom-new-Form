import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    esbuild: {
      drop: env.NODE_ENV === 'development' ? [] : ['console', 'debugger'],
    },
    build: {
      sourcemap: false,
    },
  };
});