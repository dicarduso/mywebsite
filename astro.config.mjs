// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// GitHub Pages serves this repository from /mywebsite/, while local dev,
// preview and other hosts (Vercel, Netlify, etc.) serve it from the root.
// The deploy workflow sets DEPLOY_TARGET=github-pages for the Pages build.
const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

// https://astro.build/config
export default defineConfig({
  site: "https://dicarduso.github.io",
  base: isGitHubPages ? "/mywebsite" : "/",
  integrations: [tailwind(), react()],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  server: {
    host: true,
    port: 9999,
  },
});
