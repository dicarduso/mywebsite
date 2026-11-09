// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";


// https://astro.build/config
export default defineConfig({
  site: 'https://dicarduso.github.io', // Substitui pelo teu username do GitHub
  base: '/mywebsite',
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
