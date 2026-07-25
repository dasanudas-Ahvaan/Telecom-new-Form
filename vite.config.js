import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    drop: env.NODE_ENV === "development" ? [] : ["console", "debugger"],
  },
  build: {
    sourcemap: false,
  },
});
