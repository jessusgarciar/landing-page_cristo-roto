import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  outDir: "build",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
  server: {
    port: 4321,
    host: true,
  },
  build: {
    format: "directory",
  },
});
