import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {

  return {
    plugins: [react(), tailwindcss()],
    base: "/register/",
    esbuild: {
      drop: mode === "development" ? [] : ["console", "debugger"],
    },
    build: {
      sourcemap: false,
    },
  };
});
