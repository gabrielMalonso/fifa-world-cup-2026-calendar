import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "web",
  publicDir: "../public",
  base: "./",
  build: {
    outDir: "../.site-build",
    emptyOutDir: true
  }
});
